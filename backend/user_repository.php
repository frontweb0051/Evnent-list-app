<?php
declare(strict_types=1);

function createUser(PDO $pdo, string $name, string $email, string $passwordHash):?int {

  try {
    $stmt = $pdo->prepare(
      'INSERT INTO users (name, email, password_hash)
      VALUES (:name, :email, :password_hash)
      RETURNING id'
    );
    $stmt->execute(
      [
        ':name'          => $name,
        ':email'         => $email,
        ':password_hash' => $passwordHash
      ]
    );
    return (int) $stmt->fetchColumn();
  } catch(PDOException $e) {
    // 23505 : UNIQUE 違反のエラーコード(emailのユニーク設定のエラー受け取り箇所)
    if ($e->getCode() === '23505') {
      return null;
    }
    throw $e;
  }
}

function findUserByEmail(PDO $pdo, string $email): ?array {
  $stmt = $pdo->prepare(
    'SELECT id, name, email, password_hash, role FROM users
    WHERE email = :email'
  );
  $stmt->execute([':email' => $email]);
  $user = $stmt->fetch();

  if ($user === false) {
    return null;
  }
  return $user;
}

// sessionから取得したuser_id情報を元にデータベースにuserが存在するか
function findUserById(PDO $pdo, int $id): ?array {
  $stmt = $pdo->prepare(
    'SELECT id, name, email, role
    FROM users
    WHERE id = :id'
  );
  $stmt->execute([':id' => $id]);
  $user = $stmt->fetch();

  if ($user === false) {
    return null;
  }
  return $user;
}