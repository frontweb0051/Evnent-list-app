<?php
declare(strict_types=1);

// キャンセル機能のテスト(コマンドラインで実行する)
// 実行: docker compose exec app php tests/test_cancel.php
// 前提: participant_repository.php に cancelParticipant() と createParticipant() がある
// テスト用のイベントは、タイトルの先頭が [TEST] のものだけ。実行前と実行後に削除する。

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../participant_repository.php';

$failCount = 0;

// 期待した値と、実際の値を比べて、結果を表示する
function check(string $label, mixed $actual, mixed $expected): void
{
    global $failCount;

    if ($actual === $expected) {
        echo 'PASS: ' . $label . "\n";
    } else {
        $failCount = $failCount + 1;
        echo 'FAIL: ' . $label . ' (期待: ' . var_export($expected, true) . ' / 実際: ' . var_export($actual, true) . ")\n";
    }
}

// 日本時間の「今」から、指定した分だけずらした日時を返す(例: '-1 hour')
function jstDateTime(string $modify): DateTime
{
    $dt = new DateTime('now', new DateTimeZone('Asia/Tokyo'));
    $dt->modify($modify);
    return $dt;
}

// テスト用のイベントを作って、idを返す
function createTestEvent(PDO $pdo, string $title, string $eventDate, string $startTime, string $endTime, int $capacity): int
{
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
        ':title' => $title,
        ':description' => 'テスト用',
        ':address' => 'テスト住所',
        ':venue_name' => 'テスト会場',
        ':estimated_time' => '2時間',
        ':participation_fee' => 0,
        ':event_date' => $eventDate,
        ':start_time' => $startTime,
        ':end_time' => $endTime,
        ':capacity' => $capacity,
        ':remaining' => $capacity,
        ':status' => 'published',
        ':precautions' => '',
        ':belongings' => '',
    ]);

    return (int)$stmt->fetchColumn();
}

// テスト用の申込を作って、cancel_token を返す(残り枠も、人数分だけ減らす)
function createTestParticipant(PDO $pdo, int $eventId, string $email, int $guests): string
{
    $token = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare(
        'INSERT INTO participants (event_id, name, email, guests, note, cancel_token, status)
         VALUES (:event_id, :name, :email, :guests, :note, :cancel_token, :status)'
    );
    $stmt->execute([
        ':event_id' => $eventId,
        ':name' => 'テスト太郎',
        ':email' => $email,
        ':guests' => $guests,
        ':note' => '',
        ':cancel_token' => $token,
        ':status' => 'confirmed',
    ]);

    $stmt = $pdo->prepare('UPDATE events SET remaining = remaining - :guests WHERE id = :id');
    $stmt->execute([':guests' => $guests, ':id' => $eventId]);

    return $token;
}

function getRemaining(PDO $pdo, int $eventId): int
{
    $stmt = $pdo->prepare('SELECT remaining FROM events WHERE id = :id');
    $stmt->execute([':id' => $eventId]);
    return (int)$stmt->fetchColumn();
}

function getStatus(PDO $pdo, string $token): string
{
    $stmt = $pdo->prepare('SELECT status FROM participants WHERE cancel_token = :token');
    $stmt->execute([':token' => $token]);
    return (string)$stmt->fetchColumn();
}

function deleteTestEvents(PDO $pdo): void
{
    // participants は、events を消すと、一緒に消える(ON DELETE CASCADE)
    $pdo->exec("DELETE FROM events WHERE title LIKE '[TEST]%'");
}

$pdo = getDb();
deleteTestEvents($pdo);

// 1週間後のイベント(まだ始まっていない)
$futureDate = jstDateTime('+7 days')->format('Y-m-d');
$futureEventId = createTestEvent($pdo, '[TEST] 1週間後のイベント', $futureDate, '10:00:00', '12:00:00', 10);

echo "--- 1. キャンセルできる ---\n";
$token1 = createTestParticipant($pdo, $futureEventId, 'test1@example.com', 3);
check('申込後の残り枠が 7', getRemaining($pdo, $futureEventId), 7);
check('cancelParticipant の結果が ok', cancelParticipant($pdo, $token1), 'ok');
check('status が cancelled になる', getStatus($pdo, $token1), 'cancelled');
check('残り枠が 10 に戻る', getRemaining($pdo, $futureEventId), 10);

echo "--- 2. もう一度キャンセルすると、エラー ---\n";
check('結果が already_cancelled', cancelParticipant($pdo, $token1), 'already_cancelled');
check('残り枠が増えない(10のまま)', getRemaining($pdo, $futureEventId), 10);

echo "--- 3. 存在しないトークン ---\n";
check('結果が not_found', cancelParticipant($pdo, str_repeat('0', 64)), 'not_found');

echo "--- 4. キャンセル後に、同じメールアドレスで、もう一度申し込める ---\n";
check('createParticipant の結果が ok', createParticipant($pdo, $futureEventId, 'テスト太郎', 'test1@example.com', 1, ''), 'ok');
check('残り枠が 9', getRemaining($pdo, $futureEventId), 9);

echo "--- 5. 複数の申込を、順番にキャンセルしても、合計が合う ---\n";
$token2 = createTestParticipant($pdo, $futureEventId, 'test2@example.com', 2);
$token3 = createTestParticipant($pdo, $futureEventId, 'test3@example.com', 3);
check('2つ申込んだあとの残り枠が 4', getRemaining($pdo, $futureEventId), 4);
check('1つ目のキャンセル', cancelParticipant($pdo, $token2), 'ok');
check('2つ目のキャンセル', cancelParticipant($pdo, $token3), 'ok');
check('残り枠が 9 に戻る', getRemaining($pdo, $futureEventId), 9);

echo "--- 6. 開始時刻を過ぎている(日本時間で1時間前に開始) ---\n";
$started = jstDateTime('-1 hour');
$startedEnd = jstDateTime('-1 hour');
$startedEnd->modify('+30 minutes');
$startedEventId = createTestEvent(
    $pdo,
    '[TEST] 1時間前に始まったイベント',
    $started->format('Y-m-d'),
    $started->format('H:i:s'),
    $startedEnd->format('H:i:s'),
    10
);
$token4 = createTestParticipant($pdo, $startedEventId, 'test4@example.com', 2);
check('結果が event_started', cancelParticipant($pdo, $token4), 'event_started');
check('status は confirmed のまま', getStatus($pdo, $token4), 'confirmed');
check('残り枠は 8 のまま', getRemaining($pdo, $startedEventId), 8);

echo "--- 7. まだ始まっていない(日本時間で1時間後に開始) ---\n";
$soon = jstDateTime('+1 hour');
$soonEnd = jstDateTime('+1 hour');
$soonEnd->modify('+30 minutes');
$soonEventId = createTestEvent(
    $pdo,
    '[TEST] 1時間後に始まるイベント',
    $soon->format('Y-m-d'),
    $soon->format('H:i:s'),
    $soonEnd->format('H:i:s'),
    10
);
$token5 = createTestParticipant($pdo, $soonEventId, 'test5@example.com', 2);
check('結果が ok', cancelParticipant($pdo, $token5), 'ok');
check('残り枠が 10 に戻る', getRemaining($pdo, $soonEventId), 10);

deleteTestEvents($pdo);

echo "\n";
if ($failCount === 0) {
    echo "すべて成功しました\n";
    exit(0);
}

echo $failCount . " 件のテストが失敗しました\n";
exit(1);