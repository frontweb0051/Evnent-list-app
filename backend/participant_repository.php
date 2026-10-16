<?php
declare(strict_types=1);

function createParticipant(
  PDO $pdo,
  int $eventId,
  string $name,
  string $email,
  int $guests,
  string $note
):string {

  // トランザクション開始
  $pdo->beginTransaction();

  try {
    // 1. イベントの行をロックして、残り枠を取得する
    // FOR UPDATE : 対象の業をトランザクションが終わるまで他の人が読み書きできなくする
    $stmt = $pdo->prepare(
      'SELECT remaining FROM events
      WHERE id = :id AND status = \'published\'
      FOR UPDATE'
    );
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch();

    if ($event === false) {
      $pdo->rollBack();
      return 'not_found';
    }

    // 2. 残り枠が足りるか確認する
    $remaining = (int) $event['remaining'];
    if ($guests > $remaining) {
      $pdo->rollBack();
      return 'full';
    }

    // 3. 同じメールで、有効な申込がすでにあるか確認する
    $stmt = $pdo->prepare(
      'SELECT COUNT(*) FROM participants
      WHERE event_id = :event_id AND email = :email AND status = \'confirmed\''
    );
    $stmt->execute([':event_id' => $eventId, ':email' => $email]);

    // fetchColumn : 集計結果を取得
    $count = (int) $stmt->fetchColumn();

    if ($count > 0) {
      $pdo->rollBack();
      return 'duplicate';
    }

    // 4. 申込を保存する
    // random_bytes = 32バイトの乱数
    // bin2hex = 32バイトを16進数の文字列に変更
    $calcelToken = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare(
        'INSERT INTO participants (event_id, name, email, guests, note, cancel_token)
          VALUES (:event_id, :name, :email, :guests, :note, :cancel_token)'
    );
    $stmt->execute(
      [
        ':event_id'     => $eventId,
        ':name'         => $name,
        ':email'        => $email,
        ':guests'       => $guests,
        ':note'         => $note,
        ':cancel_token' => $calcelToken,
      ]
    );

    // 5. 残り枠を減らす
    $stmt = $pdo->prepare(
        'UPDATE events
          SET remaining = remaining - :guests, updated_at = now()
          WHERE id = :id'
    );
    $stmt->execute([':guests' => $guests, ':id' => $eventId]);

    // 6. 確定
    $pdo->commit();

    return 'ok';

    // すべてのエラーを取得してTransactionが開きっぱなしになるのを防ぐ
  } catch(Throwable $e) {

  // transactionがonの状態でcatchされた場合の処理
    if ($pdo->inTransaction()) {
      $pdo->rollBack();
    }
    throw $e;
  }
}

function cancelParaticipant(PDO $pdo, string $token):string {
  $pdo->beginTransaction();
  
  // ((p.event_date + p.start_time) <= (not() AT TIME ZONE 'Asia/Tokyo')) AS has_started
  // 日付と時間を合体させて現在の日付より過去のものか判別。返り値はboolean
  try {
    $stmt = $pdo->prepare(
      "SELECT 
        p.id, 
        p.event_id, 
        p.status, 
        p.guests,
        ((p.event_date + p.start_time) <= (now() AT TIME ZONE 'Asia/Tokyo')) AS has_started
      FROM participants p
      JOIN events e ON e.id = p.event_id
      WHERE p.cancel_token = :token
      FOR UPDATE of p"
    );
    $stmt->execute([':token' => $token]);
    $paraticipant = $stmt->fetch();

    if ($paraticipant === false) {
      $pdo->rollBack();
      return "not_found";
    } 

    if ($paraticipant['status'] === "cancelled") {
      $pdo->rollBack();
      return 'already_cancelled';
    }

    // 応募人数を取得する
    $paraticipantId = (int) $paraticipant['id'];
    $eventId = (int) $paraticipant['event_id'];
    $guests = (int) $paraticipant['guests'];

    $stmt = $pdo->prepare(
      'UPDATE participants SET status = :status WHERE id = :id'
    );
    $stmt->execute([':status' => 'cancelled', ':id' => $id]);

    $stmt = $pdo->prepare(
      'UPDATE events SET remaining = remaining + :guests, updated_at = now() WHERE id = :event_id'
    );
    $stmt->execute([':guests' => $guests, ':event_id' => $eventId]);
    $pdo->commit();

    return 'ok';
  } catch (Throwable $e) {
    if ($pdo->inTransaction()) {
      $pdo->rollBack();
    }
    throw $e;
  }
}

// function findParticipantByToken(PDO $pdo, string $token):?array {
//   $pdo->beginTransaction();
  
//   try {
//     $pdo->prepare(
//       ''
//     )
//   }
// }