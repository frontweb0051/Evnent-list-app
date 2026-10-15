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