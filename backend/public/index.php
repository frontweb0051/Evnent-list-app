<?php
declare(strict_types=1);

// phpのエラー、警告を画面に出さない
ini_set('display_error', '0');
// 代わりにログに出す
ini_set('log_errors', '1');
// どんな種類のエラーも記録対象にする
error_reporting(E_ALL);

const MAX_GUESTS = 10;
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../event_repository.php';
require_once __DIR__ . '/../participant_repository.php';


function respond(array $data, int $status = 200):never {
  // 型チェックを厳格にする宣言
  http_response_code($status);

  // これから返す中身は、JSONで、文字コードはUTF-8です。とブラウザやフロントに伝える役割
  header('Content-Type: application/json; charset=utf-8');

  // json_encode : phpの配列をjsonに変化する
  // JSON_UNESCAPED_UNICODE : 日本語を文字で出力するオプションつけないと\u3053\u3093になる。動作自体には問題ない
  // JSON_THROW_ON_ERROR : つけないとencodeでエラーがでてもfalseしか返ってこない
  echo json_encode(
    ['data' => $data],
    JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
  );
  exit;
}

function respondError(string $code, string $message, int $status, array $fields = []): never
{
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');

  $error = ['code' => $code, 'message' => $message];

  if ($fields !== []) {
      $error['fields'] = $fields;
  }

  echo json_encode(['error' => $error], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
  exit;
}

try {
  $pdo = getDb();

  // $_SERVER['REQUEST_METHOD']:リクエストのメソッドを取得
  $method = $_SERVER['REQUEST_METHOD'];

  // rtrim(string, '取り除く文字列' ) : 文字列の最後を取り除く関数
  // $_SERVER['REQUEST_URI']　 : ドメインより後ろの部分 
  // parse_url(path, '取得したい箇所') : URLを分解して第二引数で取得したい箇所を指定
  $path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

  // 記事一覧 : GETかつパスが"/api/events"であれば実行
  if ($method === 'GET' && $path === "/api/events") {
    $q = '';
    if (isset($_GET['q'])) {
        $q = trim($_GET['q']);
    }

    if (mb_strlen($q) > 100) {
      respondError('VALIDATION_ERROR', 'q は文字列100文字以内で指定してください', 422);
    }

    $from = '';
    if (isset($_GET['from'])) {
        $from = $_GET['from'];
    }
    if ($from != '') {
      $date = DateTimeImmutable::createFromFormat('!Y-m-d', $from);
      if ($date === false || $date->format('Y-m-d') !== $from) {
        respondError('VALIDATION_ERROR', 'from は YYYY-MM-DD 形式で指定してください', 422);
      }
    }

    $list = findPublishedEvents($pdo, $q, $from);
    respond(array_values($list));

    // is_string : string型か判定
    // if (is_string($q) && $q !== '') {
      // array_filter(array, key) : 配列の要素をフィルタリングする。配列をループ処理するのでアロー関数で一件ずつ値を確認
      // mb_stripost(key, value) : keyに設定した文字列と一致するか？
      // mb_striposで一致しなければfalse。一致したデータだけ$listに格納される 

      // DB側の処理で絞り込みをするので非表示
      // $list = array_filter($list, fn($e) => mb_stripos($e['title'], $q) !== false);
    // } 

    // 指定日以降
    // $from = $_GET['from'] ?? '';
    // if (is_string($from) && $from !== '') {
    //   // DateTimeImmutable::createFromFormat(format, datatime) : datatimeで指定した値をformatで指定した値に変換する
    //   $date = DateTimeImmutable::createFromFormat('!Y-m-d', $from);
    //   if ($date === false || $date->format('Y-m-d') !== $from) {
    //       respondError('VALIDATION_ERROR', 'from は YYYY-MM-DD 形式で指定してください', 422);
    //   }
    //   // DB側の処理で絞り込みをするので非表示
    //   // $list = array_filter($list, fn ($e) => $e['event_date'] >= $from);
    // }
    // array_values : 配列から値のみすべて取り出す
  };

  // 記事詳細 : GETかつパスが/api/events/数字の時
  // preg_match(正規表現, パス, $matched:代入されるパラメーター) : 正規表現によるマッチング処理,$matchedに検索結果が格納される
  if ($method === 'GET' && preg_match('#^/api/events/(\d+)$#', $path, $matches)) {
    // $matched[1] : パスが(例：/api/events/123)の時の'123'を取得
    $id = (int) $matches[1];
    
    $event = findPublishedEventById($pdo, $id);

    if ($event === null) {
      respondError('NOT_FOUND', 'イベントが見つかりません', 404);
    }

    respond($event);
  };

  // フォーム送信
  if ($method === 'POST' && preg_match('#^/api/events/(\d+)/participants$#', $path, $matches)) {
    $eventId = (int) $matches[1];

    // file_get_contents() : ファイルやURLの内容を文字列として読み込む
    // 'php://input' : POSTで送信されたbody部分
    $input = json_decode(file_get_contents('php://input'), true);

    // 配列か確認することでJSONが不正な値で送られてきてないか確認
    if (!is_array($input)) {
      respondError('BAD_REQUEST', "リクエストの形式が正しくありません。", 400);
    } 

    // nullかつ空文字ではない場合
    if (($input['_hp'] ?? '') !== '') {
      respond(['message' => "申込みを受け付けました"], 201);
    }


    // バリデーションチェック
    $errors = [];

    $name = is_string($input['name'] ?? null) ? trim($input['name']) : "";
    if ($name === '' || mb_strlen($name) > 100) {
      $errors['name'] = 'お名前は1〜100文字で入力してください';
    }

    $email = is_string($input['email'] ?? null) ? trim($input['email']) : '';
    if ($email === '' || mb_strlen($email) > 255 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = '正しいメールアドレスを入力してください';
    }

    $guests = $input['guests'] ?? null;
    if (!is_int($guests) || $guests < 1 || $guests > MAX_GUESTS) {
      $errors['guests'] = '参加人数は1〜' . MAX_GUESTS . '名で指定してください';
    }

    $note = $input['note'] ?? '';
    if (!is_string($note) || mb_strlen($note) > 1000) {
        $errors['note'] = '備考は1000文字以内で入力してください';
    }
    
    if ($errors !== []) {
      respondError('VALIDATION_ERROR', '入力内容を確認してください', 422, $errors);
    }


    // メールアドレスは小文字にそろえる(Taro@... と taro@... を同じ人として扱うため)
    $email = mb_strtolower($email);

    $result = createParticipant($pdo, $eventId, $name, $email, $guests, $note);

    if ($result === 'not_found') {
      respondError('NOT_FOUND', 'イベントが見つかりません', 404);
    } else if ($result === 'full') {
      respondError('EVENT_FULL', '残り枠が足りません', 409);
    } else if ($result === 'duplicate') {
      respondError('ALREADY_APPLIED', 'このメールアドレスは、すでに申込済みです', 409);
    }

    respond(['message' => '申し込みを受け付けました'], 201);
  }

  // キャンセル画面
  if ($method === 'GET' && preg_match('#^/api/participants/([0-9a-f]{64})$#', $path, $matches)) {
    $token = (string) $matches[1];
    $paraticipant = findParticipantByToken($pdo, $token);

    if ($paraticipant === null) {
      respondError("NOT_FOUND", "申込みが見つかりません", 404);
    }

    respond($paraticipant);
  } 

  // キャンセル送信
  if ($method === 'POST' && preg_match('#^/api/participants/([0-9a-f]{64})/cancel$#', $path, $matches)) {
    $token = (string) $matches[1];
    $result = cancelParticipant($pdo, $token);
    
    if ($result === 'not_found') {
      respondError('NOT_FOUND', '申込が見つかりません', 404);
    }
    if ($result === 'already_cancelled') {
      respondError('ALREADY_CANCELLED', 'すでにキャンセルされています', 409);
    }
    if ($result === 'event_started') {
      respondError('EVENT_STARTED', '開始時刻を過ぎているため、キャンセルできません', 409);
    }

    respond(['status' => 'cancelled']);
  }

  // 疎通確認 : APIとDBが動いているか
  if ($method === 'GET' && $path === '/api/health') {
    // DBに繋がって、簡単なSQLを実行できるか確認する
    $stmt = $pdo->query('SELECT 1');
    $stmt->fetchColumn();

    respond(['status' => 'ok']);
  }

  // 上記のifに引っ掛からなかった場合の処理（上の処理を通過した場合はexitされるのでここまでこない）405エラー
  // パスはあっているけどPOSTで来た時
  if ($path === '/api/events') {
    // 使えるメソッドを伝える
    header('Allow: GET');
    respondError('METHOD_NOT_ALLOWED', '許可されていないメソッドです', 405);
  }
  if (preg_match('#^/api/events/(\d+)$#', $path)) {
    header('Allow: GET');
    respondError('METHOD_NOT_ALLOWED', '許可されていないメソッドです', 405);
  }
  if (preg_match('#^/api/events/(\d+)/participants$#', $path)) {
    header('Allow: POST');
    respondError('METHOD_NOT_ALLOWED', '許可されていないメソッドです', 405);
  }
  if (preg_match('#^/api/participants/([0-9a-f]{64})$#', $path)) {
    // 使えるメソッドを伝える
    header('Allow: GET');
    respondError('METHOD_NOT_ALLOWED', '許可されていないメソッドです', 405);
  }
  if (preg_match('#^/api/participants/([0-9a-f]{64})/cancel$#', $path)) {
    // 使えるメソッドを伝える
    header('Allow: POST');
    respondError('METHOD_NOT_ALLOWED', '許可されていないメソッドです', 405);
  }

} catch(Throwable $e) {
  // 詳細はログにだけ出す
  error_log($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());

  // 画面には、詳細を出さない
  respondError('INTERNAL_ERROR', 'サーバーエラーが発生しました', 500);
}



// if ($method === 'GET' && $path === '/api/db-check') {
//   try {
//     $pdo = getDb();
//     $stmt = $pdo->query('SELECT COUNT(*) FROM events');
//     $count = $stmt->fetchColumn();
//     respond(['events' => (int) $count]);
//   } catch (PDOException $e) {
//     error_log($e->getMessage());
//     respondError('DB_ERROR', 'DB接続に失敗しました', 500);
//   }
// }
respondError('NOT_FOUND', '見つかりません', 404);
// respondError('DEBUG', "method=$method path=$path", 404);