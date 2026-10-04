#!/usr/bin/env node
/**
 * 后端接口全量审计
 * ================
 *
 * 从 server/src 源码里**自动枚举**所有接口（不靠人工维护清单），逐个发请求，
 * 检查是否有 500、是否返回合法 JSON、鉴权是否生效。
 *
 * 每个接口测两种身份：
 *   - 未登录：期望 401/403 或公开数据；出现 500 即失败
 *   - 已登录：期望 2xx / 4xx；出现 500 即失败
 *
 * 写接口（POST/PUT/PATCH/DELETE）只发空 body，用于验证参数校验与鉴权，
 * 不做真实的写操作构造。要在副本库上做完整写入测试请配合 run-full-audit.sh。
 *
 * 用法：
 *   node api-audit.js [--base http://127.0.0.1:5001] [--json report.json]
 *   node api-audit.js --base http://127.0.0.1:5000 --no-auth-only
 */

const fs = require('fs')
const path = require('path')

// ---------- 参数 ----------
const argv = process.argv.slice(2)
const getArg = (name, def) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def
}
const BASE = getArg('--base', 'http://127.0.0.1:5001').replace(/\/$/, '')
const JSON_OUT = getArg('--json', '')
const ONLY_NOAUTH = argv.includes('--no-auth-only')

/**
 * 定位 server/src。脚本在 kaxiaojing/tools/audit/ 下，也可能被复制到仓库外的 工具/，
 * 因此按候选路径依次探测，找不到就用 --src 显式指定。
 */
function resolveServerSrc() {
  const explicit = getArg('--src', '')
  const candidates = [
    explicit,
    path.resolve(__dirname, '..', '..', 'server', 'src'),
    path.resolve(__dirname, '..', '..', 'kaxiaojing', 'server', 'src'),
    path.resolve(process.cwd(), 'server', 'src'),
    path.resolve(process.cwd(), 'kaxiaojing', 'server', 'src'),
  ].filter(Boolean)
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'app.ts'))) return c
  }
  console.error('找不到 server/src/app.ts，请用 --src <路径> 指定')
  process.exit(2)
}
const SERVER_SRC = resolveServerSrc()
const CREDS = { email: 'auditbot@example.com', password: 'AuditBot123' }

/** 路径参数取样值：尽量给真实存在的 id，减少无意义的 404 */
const PARAM_SAMPLE = {
  id: '1',
  userId: '2',
  teamId: '1',
  competitionId: '1',
  postId: '1',
  messageId: '1',
  questionId: '1',
  answerId: '1',
  groupId: '1',
  resourceId: '1',
  recruitmentId: '1',
  certId: '1',
  certificateId: '1',
  todoId: '1',
  notificationId: '1',
  fileId: '1',
  cardId: '1',
  stageId: '1',
  reviewId: '1',
  awardId: '1',
  commentId: '1',
  majorId: '21',
  collegeId: '4',
  username: '32142',
}

// ---------- 1. 从源码枚举接口 ----------
function parseApp() {
  const appPath = path.join(SERVER_SRC, 'app.ts')
  const src = fs.readFileSync(appPath, 'utf8')

  // import name from './routes/file';
  const importMap = {}
  const impRe = /import\s+(\w+)\s+from\s+'\.\/routes\/([\w.]+)'/g
  let m
  while ((m = impRe.exec(src))) importMap[m[1]] = m[2]

  // app.use('/api/xxx', name);
  const mounts = []
  const useRe = /app\.use\(\s*'(\/api[^']*)'\s*,\s*(\w+)\s*\)/g
  while ((m = useRe.exec(src))) {
    const prefix = m[1].replace(/\/+$/, '')
    const file = importMap[m[2]]
    if (file) mounts.push({ prefix, file })
  }
  return mounts
}

function parseRouteFile(file) {
  const p = path.join(SERVER_SRC, 'routes', `${file}.ts`)
  if (!fs.existsSync(p)) return []
  const src = fs.readFileSync(p, 'utf8')
  const out = []
  const re = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]*)['"]/g
  let m
  while ((m = re.exec(src))) out.push({ method: m[1].toUpperCase(), sub: m[2] })
  return out
}

function buildEndpoints() {
  const eps = []
  for (const { prefix, file } of parseApp()) {
    for (const { method, sub } of parseRouteFile(file)) {
      const raw = (prefix + '/' + sub.replace(/^\/+/, '')).replace(/\/+$/, '') || prefix
      const filled = raw.replace(/:(\w+)/g, (_, name) => PARAM_SAMPLE[name] ?? '1')
      eps.push({ method, path: filled, raw, file, params: /:\w+/.test(raw) })
    }
  }
  // 去重（同一 method+path 可能被多个文件挂载）
  const seen = new Set()
  return eps.filter((e) => {
    const k = `${e.method} ${e.path}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ---------- 2. 请求 ----------
async function call(method, url, token, body) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const opts = { method, headers, signal: AbortSignal.timeout(15000) }
  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const started = Date.now()
  try {
    const res = await fetch(url, opts)
    const text = await res.text()
    let json = null
    let jsonErr = null
    if (text) {
      try {
        json = JSON.parse(text)
      } catch (e) {
        jsonErr = e.message
      }
    }
    return {
      status: res.status,
      ms: Date.now() - started,
      json,
      jsonErr,
      isHtml: /^\s*<(!DOCTYPE|html)/i.test(text),
      len: text.length,
      snippet: text.slice(0, 200),
    }
  } catch (e) {
    return { status: 0, ms: Date.now() - started, error: e.name === 'TimeoutError' ? '超时(15s)' : e.message }
  }
}

async function login() {
  const r = await call('POST', `${BASE}/api/auth/login`, null, CREDS)
  if (r.status === 200 && r.json && r.json.token) return r.json.token
  return null
}

// ---------- 3. 判定 ----------
function classify(r, hasAuth) {
  if (r.status === 0) return { level: 'fail', why: r.error || '请求失败' }
  if (r.status >= 500) return { level: 'fail', why: `HTTP ${r.status}` }
  if (r.isHtml) return { level: 'fail', why: '返回了 HTML 而不是 JSON' }
  if (r.jsonErr && r.len > 0) return { level: 'warn', why: `响应不是合法 JSON：${r.jsonErr}` }
  if (r.status === 401 || r.status === 403) return { level: 'ok', why: '需要鉴权（符合预期）' }
  if (r.status === 200 || r.status === 201 || r.status === 204) return { level: 'ok', why: '成功' }
  if (r.status === 400 || r.status === 422) return { level: 'ok', why: '参数校验拦截（符合预期）' }
  if (r.status === 404) return { level: 'info', why: '资源不存在' }
  if (r.status === 429) return { level: 'warn', why: '被限流' }
  return { level: 'info', why: `HTTP ${r.status}` }
}

// ---------- 4. 主流程 ----------
async function main() {
  console.log('='.repeat(72))
  console.log('后端接口全量审计')
  console.log('='.repeat(72))
  console.log(`目标: ${BASE}`)
  console.log(`源码: ${SERVER_SRC}`)

  const endpoints = buildEndpoints()
  const byFile = {}
  for (const e of endpoints) byFile[e.file] = (byFile[e.file] || 0) + 1
  console.log(`枚举到接口: ${endpoints.length} 个，来自 ${Object.keys(byFile).length} 个路由文件\n`)

  const token = ONLY_NOAUTH ? null : await login()
  console.log(token ? '✓ 已获取审计账号 token（含管理员权限）\n' : '⚠ 未登录，仅测匿名访问\n')

  const results = []
  let done = 0
  for (const ep of endpoints) {
    const url = BASE + ep.path
    const isWrite = ep.method !== 'GET'

    const anon = await call(ep.method, url, null, isWrite ? {} : undefined)
    const a = classify(anon, false)
    results.push({ ...ep, who: 'anon', status: anon.status, ms: anon.ms, level: a.level, why: a.why, snippet: anon.snippet })

    if (token) {
      const auth = await call(ep.method, url, token, isWrite ? {} : undefined)
      const b = classify(auth, true)
      results.push({ ...ep, who: 'auth', status: auth.status, ms: auth.ms, level: b.level, why: b.why, snippet: auth.snippet })
    }

    done++
    if (done % 40 === 0) process.stdout.write(`  已测 ${done}/${endpoints.length}\r`)
  }
  process.stdout.write(' '.repeat(40) + '\r')

  // ---------- 汇总 ----------
  const fails = results.filter((r) => r.level === 'fail')
  const warns = results.filter((r) => r.level === 'warn')
  const infos = results.filter((r) => r.level === 'info')
  const oks = results.filter((r) => r.level === 'ok')

  console.log('='.repeat(72))
  console.log('结果汇总')
  console.log('='.repeat(72))
  console.log(`  请求总数 : ${results.length}`)
  console.log(`  ✓ 正常   : ${oks.length}`)
  console.log(`  ! 警告   : ${warns.length}`)
  console.log(`  i 提示   : ${infos.length}`)
  console.log(`  ✗ 失败   : ${fails.length}`)
  console.log()

  if (fails.length) {
    console.log('--- 失败明细（服务器错误 / 非 JSON / 请求失败）---')
    for (const f of fails) {
      console.log(`  ✗ [${f.who}] ${f.method} ${f.raw} → ${f.why}  (${f.file})`)
      if (f.snippet) console.log(`      ${f.snippet.replace(/\s+/g, ' ').slice(0, 150)}`)
    }
    console.log()
  }
  if (warns.length) {
    console.log('--- 警告明细 ---')
    for (const w of warns) console.log(`  ! [${w.who}] ${w.method} ${w.raw} → ${w.why}  (${w.file})`)
    console.log()
  }

  // 鉴权可疑项：带 token 反而 401/403
  const authRejected = results.filter((r) => r.who === 'auth' && (r.status === 401 || r.status === 403))
  if (authRejected.length) {
    console.log(`--- 带 token 仍被拒（${authRejected.length} 个，可能是权限或 token 问题）---`)
    for (const r of authRejected.slice(0, 25)) console.log(`  - ${r.method} ${r.raw} → ${r.status}  (${r.file})`)
    if (authRejected.length > 25) console.log(`  … 其余 ${authRejected.length - 25} 个见 JSON 报告`)
    console.log()
  }

  // 匿名可访问的写接口（潜在越权）
  const anonWrite = results.filter(
    (r) => r.who === 'anon' && r.method !== 'GET' && r.status >= 200 && r.status < 300,
  )
  if (anonWrite.length) {
    console.log(`--- ⚠ 未登录即可调用成功的写接口（${anonWrite.length} 个，需人工确认是否越权）---`)
    for (const r of anonWrite) console.log(`  ! ${r.method} ${r.raw} → ${r.status}  (${r.file})`)
    console.log()
  }

  if (JSON_OUT) {
    fs.writeFileSync(
      JSON_OUT,
      JSON.stringify({ base: BASE, total: results.length, fails: fails.length, warns: warns.length, results }, null, 2),
    )
    console.log(`完整结果已写入 ${JSON_OUT}`)
  }

  console.log(fails.length === 0 ? '✓ 未发现服务器错误' : `✗ 存在 ${fails.length} 项失败，需修复`)
  process.exit(fails.length === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('审计脚本异常：', e)
  process.exit(2)
})
