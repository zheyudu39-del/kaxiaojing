# 全量自动化测试工具

对「喀小竞」做两层体检：**后端接口** + **前端页面与按钮**。

## 核心设计：跑在隔离的测试环境上

不碰真实数据。编排脚本会：

1. 把 `data/competition.db` 复制成 `data/audit-test.db`
2. 在副本里建管理员账号 `auditbot / AuditBot123`
3. 起测试后端 `:5001`（`DB_PATH` 指向副本）
4. 起测试前端 `:5174`（`VITE_API_TARGET` 指向 `:5001`）
5. 跑完自动关服务、删副本

因此**连删除类按钮都可以真点**，不会污染正式库。

## 用法

```bash
# 全量（推荐）
bash tools/audit/run-full-audit.sh

# 只跑接口 / 只跑前端
bash tools/audit/run-full-audit.sh --api-only
bash tools/audit/run-full-audit.sh --ui-only

# 跑完保留测试环境，便于人工排查
bash tools/audit/run-full-audit.sh --keep
```

需要正式/测试服务已在跑时单独调用：

```bash
# 接口审计（对任意后端地址）
node tools/audit/api-audit.js --base http://127.0.0.1:5001 --json report.json

# 前端巡检（对任意前端地址）
bash tools/audit/ui-audit-sweep.sh http://127.0.0.1:5174
bash tools/audit/ui-audit-sweep.sh http://127.0.0.1:5174 dashboard lobby   # 指定路由
```

## 各脚本职责

| 文件 | 作用 |
|---|---|
| `run-full-audit.sh` | 总编排：准备副本 → 起测试服务 → 跑三层 → 收尾 |
| `api-audit.js` | 从源码自动枚举全部接口，逐个测「未登录 / 已登录」，判定有无 500 |
| `socket-teamchat-test.js` | socket 回归测试：队伍聊天参数类型（曾导致整个服务进程崩溃） |
| `ui-page-audit.js` | 浏览器内执行：页面体检 + 逐按钮点击，捕获控制台错误与失败请求 |
| `ui-audit-report.js` | 把 `ui-page-audit.js` 的 JSON 美化输出 |
| `ui-audit-sweep.sh` | 逐路由批量调用上面两个 |
| `extract-routes.py` | 从 `router/index.tsx` 提取全部前端路由（路径参数填样例值） |

## 判定标准

**接口**：`500` / 非 JSON / 请求失败 = 失败；`401/403` = 鉴权正常；`400/422` = 参数校验正常；
`404` = 资源不存在（提示级）。

**前端**：控制台错误、失败请求（4xx/5xx）、错误提示条、页面空白 = 失败。

## 已知边界

- **破坏性按钮默认只记录不点击**：文案命中
  `删除|移除|退出登录|清空|提交|发布|发送|保存|确认|支付|举报|拉黑|解绑|撤回|注销|重置|上传|导入|生成`
  的按钮会被跳过。要真点，在浏览器里先执行
  `window.__AUDIT_CLICK_DESTRUCTIVE = true`（仅建议在副本环境）。
- **接口审计的写请求只发空 body**，用于验证鉴权与参数校验，不构造真实业务数据；
  写接口的「happy path」需另外人工验证。
- 逐按钮巡检会逐个点击并还原现场（`history.back()` + Esc 关弹窗），
  单页约 10–30 秒，全站 37 个路由约 15 分钟。
- 后端源码路径自动探测（支持 `kaxiaojing/tools/audit` 与仓库外 `工具/` 两种位置），
  探测失败可用 `--src <路径>` 指定。

## 相关脚本

- `server/src/scripts/auditPrepare.ts` — 准备副本库与审计账号
- `server/src/scripts/cleanupTestUsers.ts` — 回收临时账号
