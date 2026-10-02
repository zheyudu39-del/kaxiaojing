#!/usr/bin/env bash
# 多视口布局审计
# 用法: ui-layout-sweep.sh <width>x<height> <route1> <route2> ...
export NO_PROXY="localhost,127.0.0.1"
export no_proxy="localhost,127.0.0.1"
NODE="C:/Users/Administrator/.workbuddy-ai/binaries/node/versions/22.22.2-3/node.exe"
DIR="$(cd "$(dirname "$0")" && pwd)"
VP="$1"; shift
W="${VP%x*}"; H="${VP#*x}"

echo "================= 视口 $W x $H ================="
for r in "$@"; do
  echo "########## /$r ##########"
  # 先按目标视口建好会话，再导航，避免"在宽视口渲染完再缩小"的时序竞态
  timeout 60 agent-browser set viewport "$W" "$H" >/dev/null 2>&1
  timeout 60 agent-browser open "http://127.0.0.1:5173/$r" >/dev/null 2>&1
  timeout 60 agent-browser set viewport "$W" "$H" >/dev/null 2>&1
  sleep 4
  timeout 90 agent-browser eval "$(cat "$DIR/ui-layout-audit.js")" 2>&1 | "$NODE" "$DIR/ui-report.js"
done
