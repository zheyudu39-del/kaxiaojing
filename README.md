# 喀小竞 · 大学生竞赛交流系统

大学生竞赛交流平台，包含后端服务与前端应用。

```
kaxiaojing/
├── server/   后端：Node + Express + TypeScript + SQLite(sql.js) + Socket.IO
├── web/      前端：Vite + React 18 + TypeScript + Ant Design 5（PWA）
└── docs/     API 契约文档
```

---

## 快速开始

### 后端

```bash
cd server
npm install
cp .env.example .env      # 填入 JWT_SECRET 等
npm run build
npm start                 # 默认 5000 端口
```

### 前端

```bash
cd web
npm install
npm run dev               # http://localhost:5173，已配置 /api 代理到 5000
```

生产构建：

```bash
cd web && npm run build   # 产物在 web/dist
```

---

## 文档

- [`docs/API契约.md`](docs/API契约.md) —— 从后端路由自动提取的完整接口清单（326 个端点）
- `server/README.md` —— 后端详细说明（环境变量、数据库、源码来源）

---

## 前端说明

前端由旧版**构建产物**重写而来：原前端源码已丢失，只剩压缩混淆的 `dist`（无 sourcemap、变量名已混淆），
无法还原。因此本仓库的 `web/` 是依据后端 326 个接口契约 + 旧界面截图**重新实现**的版本。

技术栈与原版保持一致（React + Ant Design + react-router + axios + echarts + PWA），
并修复了旧版已知的 UI 问题（移动端底部遮挡、工具栏按钮高度不一致、表头折行等）。

---

## License

未声明。
