# 喀小竞 · 大学生竞赛交流系统（后端服务）

大学生竞赛交流平台的服务端，提供竞赛信息、组队、经验分享、资料库、证书考取、导师、学习打卡、AI 助手等模块的 REST API 与实时通信能力。

> 本仓库为**后端服务**。前端（Vite + React + Ant Design，PWA）的源码未包含在本仓库中。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 运行时 | Node.js |
| 语言 | TypeScript 5 |
| Web 框架 | Express 4 |
| 数据库 | SQLite（通过 **sql.js**，包装为 better-sqlite3 兼容的同步 API） |
| 实时通信 | Socket.IO |
| 认证 | JWT + bcryptjs |
| 参数校验 | Zod |
| 文件上传 | Multer + Sharp |
| 邮件 | Nodemailer |
| 定时任务 | node-cron |
| 报表导出 | ExcelJS |

---

## 目录结构

```
src/
├── index.ts          入口：初始化数据库、Socket.IO、启动 HTTP 服务
├── app.ts            Express 应用装配（中间件、路由挂载、静态托管）
├── config/           环境变量加载、CORS 配置
├── db/               SQLite 封装、建表迁移、种子数据
├── middleware/       认证、鉴权、日志、错误处理、上传、校验
├── routes/           53 个路由模块（按业务域拆分）
├── services/         57 个业务服务（路由层之下的实际逻辑）
├── schemas/          Zod 校验 schema
└── socket/           Socket.IO 事件处理
```

分层约定：`routes/` 只做参数解析与响应，业务逻辑集中在 `services/`。

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（见下方）
cp .env.example .env
#    然后编辑 .env 填入真实值

# 3. 编译
npm run build

# 4. 启动
npm start          # 等价于 node dist/index.js
```

启动成功后输出：

```
数据库初始化完成
Socket.io 初始化完成
服务器已启动，端口: 5000
```

默认监听 **5000** 端口，可通过环境变量 `PORT` 覆盖。

开发模式（免编译，直接跑 TS）：

```bash
npm run dev        # ts-node src/index.ts
```

### 前端

后端会托管前端静态文件，路径写死为 `<部署根>/opt/client/dist`（见 `src/app.ts`）。
把前端构建产物放到该位置即可单进程跑全站；不部署前端也不影响 API 使用。

---

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | JWT 签名密钥，缺失会直接启动失败。**务必使用随机长字符串** |
| `PORT` | | `5000` | HTTP 监听端口 |
| `DB_PATH` | | `./data/competition.db` | SQLite 数据库文件路径 |
| `CORS_ORIGINS` | | `http://localhost:3000` | 允许的跨域来源 |
| `NODE_ENV` | | `development` | 运行环境 |
| `DEEPSEEK_API_KEY` | | 空 | AI 助手所依赖的大模型 API Key |
| `SMTP_HOST` | | `smtp.qq.com` | 邮件服务器 |
| `SMTP_PORT` | | `465` | 邮件端口 |
| `SMTP_USER` | | 空 | 发信邮箱 |
| `SMTP_PASS` | | 空 | 邮箱授权码（非登录密码） |
| `BACKUP_CRON` | | `0 2 * * *` | 数据库自动备份的 cron 表达式 |
| `BACKUP_DIR` | | `./data/backups` | 备份目录 |
| `BACKUP_MAX` | | `7` | 保留备份份数 |
| `RATE_LIMIT_WINDOW_MS` | | `900000` | 全局限流窗口（毫秒） |
| `RATE_LIMIT_MAX` | | `200` | 窗口内最大请求数 |
| `AUTH_RATE_LIMIT_MAX` | | `20` | 认证接口限流阈值 |

> ⚠️ **不要提交 `.env`**。仓库已通过 `.gitignore` 排除，只提交 `.env.example` 模板。

---

## 数据库

SQLite 单文件数据库，**无需手动导入**——首次启动会自动建表并写入种子数据（竞赛、学院、专业、证书、题库、导师等）。

数据库文件与用户上传目录均属运行时数据，不纳入版本控制：

```
data/
├── competition.db      # 数据库
├── uploads/            # 用户上传（头像、资料、凭证）
└── backups/            # 自动备份
```

---

## 关于本仓库源码的来源

本仓库的 `src/` 是**从服务器上遗留的编译产物逆向重建**得到的，而非原始工程文件：

- 原始 `src/` 已丢失，服务器上只保留了 `dist/`（131 个 `.js` + `.js.map` + `.d.ts`）
- 重建依据：`sourcemap` 的 `sources` 字段还原原路径、`.js` 保留的注释与结构还原逻辑、`.d.ts` 还原类型签名
- 保真度已验证：重建源码重新编译后与服务器原始 `dist/` 产物**逐字节比对，131 个文件中 126 个完全一致**，其余为语义等价的结构差异；运行后 API 正常返回数据

### 已知限制

`npm run build` 会报告约 **296 个类型错误**，全部源于 TypeScript 编译过程擦除的信息：

- **类型断言被擦除**（如 `parseInt(req.query.page as string)` 编译后只剩 `req.query.page`）
- **函数内部/局部变量的类型注解被擦除**

这些信息无法从编译产物反推。**不影响运行时**——`tsc` 默认 `noEmitOnError: false`，仍会正常产出 `dist/`，编译结果与线上版本一致。

如需零错误构建，按报错位置逐个补回类型断言即可。

---

## License

未声明。
