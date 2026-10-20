<?php
declare(strict_types=1);

function startSession():void {
  if (session_status() === PHP_SESSION_ACTIVE) {
    return;
  }

  $secure  = false;
  // 本番(HTTPS)だけ true にする。環境変数 SESSION_COOKIE_SECURE=true のときだけ
  if (getenv('SESSION_COOKIE_SECURE') === 'true') {
    $secure = true;
  }

  // サーバーが作っていないセッションIDは受け付けない
  ini_set('session.use_strict_mode', '1');

  session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => $secure,
  ]);

  session_start();
}

function loginUser(int $userId): void {
  startSession();

  // セッションIDを作り直す（古いIDは削除）
  session_regenerate_id(true);

  $_SESSION['user_id'] = $userId;
}

function getLoginUserId(): ?int {
  startSession();

  if (!isset($_SESSION['user_id'])) {
    return null;
  }
  return (int) $_SESSION['user_id'];
}

function logoutUser(): void {
  startSession();

  // セッションの中身を空にする
  $_SESSION = [];

  // 2. ブラウザのCookieを、期限切れにして消させる
  $params = session_get_cookie_params();
  setcookie(session_name(), '', [
      'expires'  => time() - 3600,
      'path'     => $params['path'],
      'domain'   => $params['domain'],
      'secure'   => $params['secure'],
      'httponly' => $params['httponly'],
      'samesite' => $params['samesite'],
  ]);

  // 3. サーバー側のセッションを破棄する
  session_destroy();
}