#!/usr/bin/env node
/**
 * 回归测试：队伍聊天 socket 参数类型（曾导致整个服务进程崩溃）
 * =================================================================
 *
 * 背景：前端 `TeamForum.tsx` 发的是对象 `{ teamId: N }`，
 * 而 socket 处理器早期按数字直接传给 SQL 绑定，
 * sql.js 抛出的异常没有堆栈、未被捕获，**直接崩掉整个 Node 进程**——
 * 也就是说任何人打开队伍聊天页就能把服务打下线（拒绝服务）。
 *
 * 本脚本覆盖三种载荷形态，并断言服务端在测试前后都存活：
 *   1. 对象 { teamId }  —— 前端的真实形态（修复前会崩）
 *   2. 纯数字 teamId     —— 旧客户端形态
 *   3. 非法值（字符串/对象嵌套）—— 应被拒绝而不是崩
 *
 * 用法：
 *   node socket-teamchat-test.js [--base http://127.0.0.1:5001]
 */

const path = require('path')

const argv = process.argv.slice(2)
const i = argv.indexOf('--base')
const BASE = (i >= 0 && argv[i + 1] ? argv[i + 1] : 'http://127.0.0.1:5001').replace(/\/$/, '')

// socket.io-client 装在 web 的依赖里
let io
try {
  io = require(path.resolve(__dirname, '..', '..', 'web', 'node_modules', 'socket.io-client')).io
} catch (e) {
  console.error('找不到 socket.io-client（应在 web/node_modules 下）:', e.message)
  process.exit(2)
}

const CREDS = { email: 'auditbot@example.com', password: 'AuditBot123' }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function alive() {
  try {
    const res = await fetch(`${BASE}/api/colleges`, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDS),
  })
  if (!res.ok) throw new Error(`登录失败 HTTP ${res.status}`)
  const j = await res.json()
  return j.token
}

/** 连一次 socket，发一个载荷，收集服务端返回的 error 事件 */
function probe(token, event, payload) {
  return new Promise((resolve) => {
    const socket = io(BASE, { auth: { token }, transports: ['websocket'] })
    const errors = []
    let settled = false
    const done = (why) => {
      if (settled) return
      settled = true
      try { socket.disconnect() } catch (_) {}
      resolve({ why, errors })
    }
    socket.on('connect', () => {
      socket.emit(event, payload)
      setTimeout(() => done('no-reply'), 1200)
    })
    socket.on('connect_error', (e) => done(`connect_error: ${e.message}`))
    socket.on('error', (e) => errors.push(typeof e === 'string' ? e : e && e.message))
    setTimeout(() => done('timeout'), 6000)
  })
}

async function main() {
  console.log('='.repeat(68))
  console.log('回归测试：队伍聊天 socket 参数类型')
  console.log('='.repeat(68))
  console.log(`目标: ${BASE}\n`)

  if (!(await alive())) {
    console.error('✗ 服务未启动，无法测试')
    process.exit(1)
  }
  const token = await login()
  console.log('✓ 已登录\n')

  const cases = [
    { name: '对象 { teamId: 1 }（前端真实形态）', event: 'join-team-chat', payload: { teamId: 1 } },
    { name: '纯数字 1（旧客户端形态）', event: 'join-team-chat', payload: 1 },
    { name: '非法：字符串 "abc"', event: 'join-team-chat', payload: 'abc' },
    { name: '非法：嵌套对象 { teamId: { a: 1 } }', event: 'join-team-chat', payload: { teamId: { a: 1 } } },
    { name: '对象 { teamId: 1 } 离开房间', event: 'leave-team-chat', payload: { teamId: 1 } },
    {
      name: '对象 { teamId, content } 发消息',
      event: 'send-message',
      payload: { teamId: 1, content: '审计测试消息' },
    },
  ]

  let failed = 0
  for (const c of cases) {
    const before = await alive()
    if (!before) {
      console.log(`  ✗ 测试前服务已不可用，中止`)
      failed++
      break
    }

    const r = await probe(token, c.event, c.payload)
    await sleep(300)
    const after = await alive()

    if (!after) {
      console.log(`  ✗ ${c.name} → **服务进程崩溃**（修复前即此表现）`)
      failed++
      break
    }
    const errText = r.errors.length ? `服务端拒绝: ${r.errors[0]}` : '无错误事件'
    console.log(`  ✓ ${c.name} → 服务存活（${errText}）`)
  }

  console.log('')
  const finalAlive = await alive()
  if (failed === 0 && finalAlive) {
    console.log('✓ 全部通过：任何载荷都不会再打挂服务')
    process.exit(0)
  } else {
    console.log(`✗ 存在 ${failed} 项失败（服务存活=${finalAlive}）`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('测试异常：', e)
  process.exit(2)
})
