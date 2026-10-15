#!/bin/bash
for i in 1 2 3 4 5; do
  body=$(printf '{"name":"test%s","email":"user%s@example.com","guests":1,"note":"","_hp":""}' "$i" "$i")
  curl -s -o /dev/null -w "user$i: %{http_code}\n" \
    -X POST http://localhost:8080/api/events/7/participants \
    -H "Content-Type: application/json" \
    -d "$body" &
done
wait