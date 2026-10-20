<?php
declare(strict_types=1);

// 同時キャンセルのテスト用の道具(test_cancel_concurrent.sh から呼ばれる)
// 使い方:
//   php tests/cancel_helper.php setup            テスト用のイベントと申込を作る(「イベントid トークン」を表示)
//   php tests/cancel_helper.php cancel トークン   キャンセルを1回実行する(結果を表示)
//   php tests/cancel_helper.php check イベントid  残り枠と申込の状態を表示する
//   php tests/cancel_helper.php cleanup          テスト用のデータを削除する

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../participant_repository.php';

$mode = '';
if (isset($argv[1])) {
    $mode = $argv[1];
}

$pdo = getDb();

if ($mode === 'setup') {
    $pdo->exec("DELETE FROM events WHERE title LIKE '[TEST]%'");

    $futureDate = (new DateTime('+7 days', new DateTimeZone('Asia/Tokyo')))->format('Y-m-d');

    $stmt = $pdo->prepare(
        'INSERT INTO events
            (title, description, address, venue_name, estimated_time, participation_fee,
             event_date, start_time, end_time, capacity, remaining, status, precautions, belongings)
         VALUES
            (:title, :description, :address, :venue_name, :estimated_time, :participation_fee,
             :event_date, :start_time, :end_time, :capacity, :remaining, :status, :precautions, :belongings)
         RETURNING id'
    );
    $stmt->execute([
        ':title' => '[TEST] 同時キャンセル用',
        ':description' => 'テスト用',
        ':address' => 'テスト住所',
        ':venue_name' => 'テスト会場',
        ':estimated_time' => '2時間',
        ':participation_fee' => 0,
        ':event_date' => $futureDate,
        ':start_time' => '10:00:00',
        ':end_time' => '12:00:00',
        ':capacity' => 10,
        ':remaining' => 8,
        ':status' => 'published',
        ':precautions' => '',
        ':belongings' => '',
    ]);
    $eventId = (int)$stmt->fetchColumn();

    $token = bin2hex(random_bytes(32));
    $stmt = $pdo->prepare(
        'INSERT INTO participants (event_id, name, email, guests, note, cancel_token, status)
         VALUES (:event_id, :name, :email, :guests, :note, :cancel_token, :status)'
    );
    $stmt->execute([
        ':event_id' => $eventId,
        ':name' => 'テスト太郎',
        ':email' => 'concurrent@example.com',
        ':guests' => 2,
        ':note' => '',
        ':cancel_token' => $token,
        ':status' => 'confirmed',
    ]);

    echo $eventId . ' ' . $token . "\n";
    exit(0);
}

if ($mode === 'cancel') {
    $token = '';
    if (isset($argv[2])) {
        $token = $argv[2];
    }
    echo cancelParticipant($pdo, $token) . "\n";
    exit(0);
}

if ($mode === 'check') {
    $eventId = 0;
    if (isset($argv[2])) {
        $eventId = (int)$argv[2];
    }

    $stmt = $pdo->prepare('SELECT remaining FROM events WHERE id = :id');
    $stmt->execute([':id' => $eventId]);
    $remaining = $stmt->fetchColumn();

    $stmt = $pdo->prepare('SELECT status FROM participants WHERE event_id = :id');
    $stmt->execute([':id' => $eventId]);
    $status = $stmt->fetchColumn();

    echo 'remaining=' . $remaining . ' status=' . $status . "\n";
    exit(0);
}

if ($mode === 'cleanup') {
    $pdo->exec("DELETE FROM events WHERE title LIKE '[TEST]%'");
    exit(0);
}

echo "使い方: php tests/cancel_helper.php setup | cancel トークン | check イベントid | cleanup\n";
exit(1);