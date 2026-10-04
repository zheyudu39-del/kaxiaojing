#!/usr/bin/env bash
# 前端全站页面 + 按钮巡检（逐路由）
# 用法: bash ui-audit-sweep.sh <base-url> [route...]
#   不给 route 时自动从 router 提取全部路由
DIR="$(cd "$(dirname "$0")" && pwd)"
BASE="${1:-http://127.0.0.1:5174}"
shift 2>/dev/null || true
NODE="C:/Users/Administrator/.workbuddy-ai/binaries/node/versions/22.22.2-3/node.exe"
[ -x "$NODE" ] || NODE="node"

if [ "$#" -gt 0 ]; then
  ROUTES="$*"
else
  ROUTES="$(python "$DIR/extract-routes.py")"
fi

echo "================= 前端巡检 @ $BASE ================="
echo "路由数: $(echo $ROUTES | wc -w)"
echo ""

# 登录审计账号（受保护页面需要登录态）
echo "--- 登录审计账号 ---"
timeout 60 agent-browser set viewport 1440 900 >/dev/null 2>&1
timeout 60 agent-browser open "$BASE/login" >/dev/null 2>&1
sleep 6
timeout 90 agent-browser eval "(()=>{
  const ins=[...document.querySelectorAll('input')];
  const set=(el,v)=>{const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};
  set(ins[0],'auditbot@example.com'); set(ins[1],'AuditBot123');
  const b=[...document.querySelectorAll('button')].find(x=>x.textContent.replace(/\s/g,'').includes('登录'));
  if(b) b.click();
  return 'ok';
})()" >/dev/null 2>&1
sleep 7
logged=$(timeout 60 agent-browser eval "!!document.querySelector('header .ant-avatar')" 2>/dev/null | tail -c 10)
echo "登录状态: $logged"
echo ""

for r in $ROUTES; do
  timeout 60 agent-browser set viewport 1440 900 >/dev/null 2>&1
  timeout 60 agent-browser open "$BASE/$r" >/dev/null 2>&1
  timeout 60 agent-browser set viewport 1440 900 >/dev/null 2>&1
  sleep 5
  timeout 240 agent-browser eval --stdin < "$DIR/ui-page-audit.js" 2>&1 \
    | "$NODE" "$DIR/ui-audit-report.js"
done

echo ""
echo "================= 巡检结束 ================="
