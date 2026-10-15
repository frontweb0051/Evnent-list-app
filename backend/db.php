<?php 
declare(strict_types=1);

function getDb():PDO {
  $host     = getenv('DB_HOST');
  $port     = getenv('DB_PORT');
  $name     = getenv('DB_NAME');
  $user     = getenv('DB_USER');
  $password = getenv('DB_PASSWORD');

  // 2. 1つでも読み取れなかったら、ここで止めて原因を伝える
  if ($host === false || $port === false || $name === false || $user === false || $password === false) {
      throw new RuntimeException('DBの環境変数が設定されていません');
  }

  // 3. 接続先を表す文字列(DSN)を作る
  $dsn = 'pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $name;

  // 4. PDOの動作設定
  $options = [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
  ];

  // 5. 接続して、PDOを返す
  $pdo = new PDO($dsn, $user, $password, $options);
  return $pdo;
}