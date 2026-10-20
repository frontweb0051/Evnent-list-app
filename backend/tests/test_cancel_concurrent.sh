#!/bin/bash
# 同じ申込を、同時に5回キャンセルするテスト
# 実行: プロジェクトのルート(docker-compose.yaml がある場所)で
#   bash backend/tests/test_cancel_concurrent.sh
#
# 期待する結果:
#   ok が 1 回、already_cancelled が 4 回
#   remaining=10(8 + 2。2回以上、足されていない)、status=cancelled

HELPER="docker compose exec -T app php tests/cancel_helper.php"

# 1. テスト用のイベント(定員10、残り8)と、2名の申込を作る
SETUP=$($HELPER setup)
EVENT_ID=$(echo "$SETUP" | awk '{print $1}')
TOKEN=$(echo "$SETUP" | awk '{print $2}')
echo "テストデータを作成: イベントid=$EVENT_ID"
echo "キャンセル前: $($HELPER check "$EVENT_ID")"

# 2. 5つのキャンセルを、同時に実行する
echo "--- 5件を同時にキャンセル ---"
for i in 1 2 3 4 5; do
  (
    RESULT=$($HELPER cancel "$TOKEN")
    echo "キャンセル $i: $RESULT"
  ) &
done
wait

# 3. 結果を確認して、テストデータを削除する
echo "--- 結果 ---"
echo "キャンセル後: $($HELPER check "$EVENT_ID")"
$HELPER cleanup