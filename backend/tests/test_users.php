<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../user_repository.php';

$pdo = getDb();
$email = 'test-user@example.com';

$pdo->exec("DELETE FROM users WHERE email = 'test-user@example.com'");

$id = createUser($pdo, 'テスト太郎', $email, password_hash('password123', PASSWORD_DEFAULT));
echo is_int($id) ? "PASS: 登録できて id が返る ({$id})\n" : "FAIL: id が返らない\n";

$second = createUser($pdo, 'テスト次郎', $email, password_hash('password123', PASSWORD_DEFAULT));
echo $second === null ? "PASS: 同じメールは null\n" : "FAIL: 2回目も登録できてしまった\n";

$pdo->exec("DELETE FROM users WHERE email = 'test-user@example.com'");