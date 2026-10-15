<?php
declare(strict_types=1);

// 公開中のイベントを、開催日の昇順で全部取得する
function findPublishedEvents(PDO $pdo, string $q, string $from): array
{
  $sql = 'SELECT id, title, description, address, venue_name, estimated_time, participation_fee,
                  event_date, start_time, end_time, capacity, remaining, precautions, belongings
          FROM events
          WHERE status = \'published\'';
  
  $params = [];

  if ($q != "") {
    // :q_title = :任意の名称、値を格納しておくプレースホルダー
    // ILIKE : 小文字、大文字どちらでも一致させる
    $sql = $sql . 'AND (title ILIKE :q_title OR description ILIKE :q_description)'; 

    // ILIKEを使用したのでエスケープ処理
    $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q);
    
    // タイトルとディスクリプションを検索対象にする。 $escapedに入る値は検索欄で入力された値
    $params[':q_title'] = '%' . $escaped . '%';
    $params[':q_description'] = '%' . $escaped . '%';
  }

  if ($from != "") {
    // 指定した日付より後の日付に絞り込む
    $sql = $sql . 'AND event_date >= :from_date';
    $params[':from_date'] = $from;
  }
    
  $sql = $sql . ' ORDER BY event_date ASC, start_time ASC';

  // prepare() : 実行の事前準備。構文が正しいか、q_titleなどの空欄の状態で渡す
  $stmt = $pdo->prepare($sql);
  // execute() : prepareで準備したSQLに値をはめて実行する。$paramsと空で用意したq_title,q_descriptionの値を照合してvalueをSQLに追加する
  $stmt->execute($params);
  $rows = $stmt->fetchAll();
  return $rows;
}

function findPublishedEventById(PDO $pdo, int $id): ?array {
    $sql = 'SELECT id, title, description, address, venue_name, estimated_time, participation_fee,
                  event_date, start_time, end_time, capacity, remaining, precautions, belongings
          FROM events
          WHERE id = :id AND status = \'published\'';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if ($row === false) {
      return null;
    }
    return $row;
}