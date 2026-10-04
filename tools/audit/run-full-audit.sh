#!/usr/bin/env bash
# ============================================================================
# 全量自动化测试：后端接口 + 前端页面/按钮
# ============================================================================
#
# 特点：跑在**完全独立的测试环境**上，不碰真实数据——
#   1. 复制真实库 → data/audit-test.db，并在副本里建管理员账号 auditbot
#   2. 起测试后端 :5001（DB_PATH 指向副本）
#   3. 起测试前端 :5174（VITE_API_TARGET 指向 :5001）
#   4. 两层审计：接口全量 + 逐页按钮点击
#   5. 收尾：关掉测试服务、删除副本
#
# 因此连删除类按钮都可以真点，不会污染正式数据。
#
# 用法：
#   bash run-full-audit.sh              # 全量
#   bash run-full-audit.sh --api-only   # 只跑接口
#   bash run-full-audit.sh --ui-only    # 只跑前端
#   bash run-full-audit.sh --keep       # 结束后保留测试环境便于排查
# ============================================================================
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$DIR/../.." && pwd)"
SERVER="$REPO/server"
WEB="$REPO/web"
NODE="C:/Users/Administrator/.workbuddy-ai/binaries/node/versions/22.22.2-3/node.exe"
[ -x "$NODE" ] || NODE="node"

TEST_API_PORT=5001
TEST_WEB_PORT=5174
TEST_DB="./data/audit-test.db"

API_ONLY=0; UI_ONLY=0; KEEP=0
for a in "$@"; do
  case "$a" in
    --api-only) API_ONLY=1 ;;
    --ui-only)  UI_ONLY=1 ;;
    --keep)     KEEP=1 ;;
  esac
done

API_PID=""; WEB_PID=""
cleanup() {
  echo ""
  echo "--- 收尾 ---"
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null && echo "已停止测试后端 (pid $API_PID)"
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null && echo "已停止测试前端 (pid $WEB_PID)"
  sleep 2
  if [ "$KEEP" = "1" ]; then
    echo "（--keep）保留测试数据库 $TEST_DB 便于排查"
  else
    rm -f "$SERVER/data/audit-test.db" "$SERVER/data/audit-test.db-journal" \
          "$SERVER/data/audit-test.db-wal" "$SERVER/data/audit-test.db-shm" 2>/dev/null
    echo "已删除测试数据库副本"
  fi
}
trap cleanup EXIT

echo "============================================================================"
echo "全量自动化测试"
echo "============================================================================"

# ---------- 1. 准备副本库 ----------
echo ""
echo "[1/5] 准备测试数据库副本"
cd "$SERVER" || exit 1
npx ts-node --transpile-only src/scripts/auditPrepare.ts 2>&1 | sed 's/^/      /'
if [ ! -f "$SERVER/data/audit-test.db" ]; then
  echo "✗ 副本库创建失败，中止"; exit 1
fi

# ---------- 2. 起测试后端 ----------
if [ "$UI_ONLY" != "1" ] || [ "$API_ONLY" != "1" ]; then
  echo ""
  echo "[2/5] 启动测试后端 :$TEST_API_PORT"
  DB_PATH="$TEST_DB" RATE_LIMIT_MAX=100000 PORT=$TEST_API_PORT \
    npx ts-node --transpile-only src/index.ts > /tmp/audit-api.log 2>&1 &
  API_PID=$!
  for i in $(seq 1 40); do
    if curl -s --noproxy '*' -o /dev/null "http://127.0.0.1:$TEST_API_PORT/api/colleges" 2>/dev/null; then break; fi
    sleep 2
  done
  code=$(curl -s --noproxy '*' -o /dev/null -w "%{http_code}" "http://127.0.0.1:$TEST_API_PORT/api/colleges" 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "✗ 测试后端未就绪 (HTTP $code)，日志："; tail -20 /tmp/audit-api.log; exit 1
  fi
  echo "      ✓ 测试后端就绪"
fi

# ---------- 3. 起测试前端 ----------
if [ "$API_ONLY" != "1" ]; then
  echo ""
  echo "[3/5] 启动测试前端 :$TEST_WEB_PORT"
  cd "$WEB" || exit 1
  VITE_API_TARGET="http://127.0.0.1:$TEST_API_PORT" \
    npx vite --host 127.0.0.1 --port $TEST_WEB_PORT > /tmp/audit-web.log 2>&1 &
  WEB_PID=$!
  for i in $(seq 1 30); do
    code=$(curl -s --noproxy '*' -o /dev/null -w "%{http_code}" "http://127.0.0.1:$TEST_WEB_PORT/" 2>/dev/null)
    [ "$code" = "200" ] && break
    sleep 2
  done
  if [ "$code" != "200" ]; then
    echo "✗ 测试前端未就绪 (HTTP $code)，日志："; tail -20 /tmp/audit-web.log; exit 1
  fi
  echo "      ✓ 测试前端就绪"
fi

# ---------- 4. 接口审计 ----------
API_FAIL=0
if [ "$UI_ONLY" != "1" ]; then
  echo ""
  echo "[4/6] 后端接口全量审计"
  "$NODE" "$DIR/api-audit.js" --base "http://127.0.0.1:$TEST_API_PORT" \
    --json "$REPO/../docs/api-audit-report.json" 2>&1 | sed 's/^/      /'
  API_FAIL=${PIPESTATUS[0]}

  echo ""
  echo "[5/6] socket 回归测试（队伍聊天参数类型）"
  "$NODE" "$DIR/socket-teamchat-test.js" --base "http://127.0.0.1:$TEST_API_PORT" 2>&1 | sed 's/^/      /'
  SOCK_FAIL=${PIPESTATUS[0]}
fi

# ---------- 6. 前端巡检 ----------
if [ "$API_ONLY" != "1" ]; then
  echo ""
  echo "[6/6] 前端页面 + 按钮巡检"
  bash "$DIR/ui-audit-sweep.sh" "http://127.0.0.1:$TEST_WEB_PORT" 2>&1 | sed 's/^/      /'
fi

echo ""
echo "============================================================================"
if [ "$API_FAIL" = "0" ]; then echo "接口审计: ✓ 通过"; else echo "接口审计: ✗ 有失败项"; fi
echo "============================================================================"
