/**
 * 前端页面 + 按钮自动化巡检（浏览器内执行）
 * =========================================
 *
 * 用法（由 ui-audit.sh 调用）：
 *   agent-browser eval --stdin < ui-page-audit.js
 *
 * 做两件事：
 *   A. 页面体检：加载后捕获控制台错误、失败请求、错误提示、空白页
 *   B. 按钮体检：枚举可点元素，逐个点击，检测点击后是否报错 / 请求失败
 *
 * 破坏性按钮（删除/退出/提交等）默认**只记录不点击**，避免误伤数据；
 * 需要真点请传入 window.__AUDIT_CLICK_DESTRUCTIVE = true（在副本环境才建议开）。
 *
 * 返回 JSON 字符串，由 ui-report.js 美化。
 */
(async () => {
  const START = Date.now()
  const origPath = location.pathname + location.search

  // ---------- 错误采集 ----------
  const errors = []
  const netFails = []

  if (!window.__auditInstalled) {
    window.__auditInstalled = true
    window.__auditErrors = []
    window.__auditNet = []

    const origError = console.error
    console.error = function (...args) {
      try {
        window.__auditErrors.push(
          args
            .map((a) => (a && a.message ? a.message : typeof a === 'string' ? a : JSON.stringify(a)))
            .join(' ')
            .slice(0, 300),
        )
      } catch (_) {}
      return origError.apply(console, args)
    }

    window.addEventListener('error', (e) => {
      window.__auditErrors.push(`[window.onerror] ${e.message || ''} ${e.filename || ''}:${e.lineno || 0}`)
    })
    window.addEventListener('unhandledrejection', (e) => {
      const r = e.reason
      const msg = (r && (r.message || r)) || 'unknown'
      // 带上堆栈前几行，否则只看到 "Invalid URL" 这类信息无法定位来源
      const stack = r && r.stack ? String(r.stack).split('\n').slice(1, 4).join(' <- ') : ''
      window.__auditErrors.push(`[unhandledrejection] ${msg}${stack ? ' | ' + stack : ''}`.slice(0, 500))
    })

    // 包装 fetch，记录 4xx/5xx
    const origFetch = window.fetch
    if (origFetch) {
      window.fetch = function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0] && args[0].url
        return origFetch.apply(this, args).then((res) => {
          if (!res.ok) window.__auditNet.push({ url: String(url).slice(0, 160), status: res.status })
          return res
        })
      }
    }

    // 包装 XHR（axios 在老浏览器下可能走 XHR）
    const OrigXHR = window.XMLHttpRequest
    if (OrigXHR && OrigXHR.prototype) {
      const origOpen = OrigXHR.prototype.open
      const origSend = OrigXHR.prototype.send
      OrigXHR.prototype.open = function (method, url, ...rest) {
        this.__auditUrl = url
        return origOpen.call(this, method, url, ...rest)
      }
      OrigXHR.prototype.send = function (...args) {
        this.addEventListener('loadend', () => {
          if (this.status >= 400) {
            window.__auditNet.push({ url: String(this.__auditUrl || '').slice(0, 160), status: this.status })
          }
        })
        return origSend.apply(this, args)
      }
    }
  }

  const drain = () => {
    const e = window.__auditErrors.slice()
    const n = window.__auditNet.slice()
    window.__auditErrors.length = 0
    window.__auditNet.length = 0
    return { errors: e, net: n }
  }
  drain() // 丢弃加载期残留，只统计点击引发的

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  // ---------- 导航兜底拦截 ----------
  // 页面上有 <a href="/api/xxx/download" target="_blank"> 这类「下载/导出」链接。
  // 自动化浏览器里 target=_blank 可能退化成当前标签页跳转，一旦整页跳到 /api/，
  // 正在执行的审计脚本 JS 上下文就被销毁 → eval 永远不返回（表现为连接超时）。
  // 在捕获阶段直接拦掉，保证 SPA 不被带走。
  if (window.__auditNavGuard) window.removeEventListener('click', window.__auditNavGuard, true)
  window.__auditNavGuard = (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[href]')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('/api/') || a.hasAttribute('download')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
  window.addEventListener('click', window.__auditNavGuard, true)

  // ---------- 页面体检 ----------
  const pageIssues = []
  const bodyText = (document.body.innerText || '').trim()
  if (bodyText.length < 20) pageIssues.push('页面几乎空白（正文 <20 字）')
  if (document.querySelector('.ant-result-500, .ant-result-error')) pageIssues.push('出现错误结果页')
  if (/页面不存在|404 Not Found/.test(bodyText.slice(0, 200))) pageIssues.push('落到 404 页')

  // ---------- 收集可点元素 ----------
  const DESTRUCTIVE =
    /删除|移除|退出登录|清空|取消报名|退队|解散|提交|发布|发送|保存|确认|支付|举报|拉黑|解绑|撤回|注销|重置|上传|导入|生成/

  const isVisible = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return false
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'
  }

  const describe = (el) => {
    const text = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ')
    const tag = el.tagName.toLowerCase()
    const cls = (el.className || '').toString().split(' ').slice(0, 2).join('.')
    return { text: text.slice(0, 40), tag, cls, href: el.getAttribute && el.getAttribute('href') }
  }

  const SELECTOR = 'button, [role="button"], a[href]'

  /** 每轮重新查询，返回当前可见且可点的元素数组。
   *  必须重新查询：点链接跳转后原 DOM 引用会失效（isConnected=false），
   *  只靠一次性快照会导致大量元素被跳过。 */
  const collect = () => {
    const out = []
    for (const el of document.querySelectorAll(SELECTOR)) {
      if (!isVisible(el)) continue
      if (el.disabled) continue
      if (el.getAttribute('aria-disabled') === 'true') continue
      const href = el.getAttribute('href') || ''
      if (/^(https?:)?\/\//.test(href) && !href.includes(location.host)) continue
      // 跳过下载/接口类链接：点了会跳出 SPA（浏览器直接请求 /api/...），
      // 之后 history.back() 也回不来，会导致后续元素的索引整体错位
      if (href.startsWith('/api/') || href.includes('/download')) continue
      if (el.hasAttribute('download')) continue
      // 新窗口链接会另开标签页，审计会话无法接管
      if (el.getAttribute('target') === '_blank') continue
      out.push(el)
    }
    return out
  }

  const CLICK_DESTRUCTIVE = window.__AUDIT_CLICK_DESTRUCTIVE === true
  // 单页点击上限：数据密集页（如资料库 47 个链接）逐个点击会让单次 eval 超时，
  // 导致整页结果丢失。超出的元素只统计不点击，并在报告里标注。
  const MAX_CLICKS = Number(window.__AUDIT_MAX_CLICKS) || 24
  const total = collect().length
  const results = []
  const skipped = []
  let overflow = 0

  for (let i = 0; i < total; i++) {
    // 确保回到原始页面（上一次点击可能跳走了）
    if (location.pathname + location.search !== origPath) {
      history.back()
      await sleep(500)
      if (location.pathname + location.search !== origPath) {
        history.pushState({}, '', origPath)
        await sleep(300)
      }
    }

    const els = collect()
    const el = els[i]
    if (!el) continue

    const info = describe(el)
    const isDestructive = DESTRUCTIVE.test(info.text)

    if (isDestructive && !CLICK_DESTRUCTIVE) {
      skipped.push(info)
      continue
    }

    // 超出上限的只记录不点击，避免单次 eval 超时丢掉整页结果
    if (results.length >= MAX_CLICKS) {
      overflow++
      continue
    }

    const before = location.pathname + location.search
    // antd 提示条会停留约 3s，而点击间隔只有 450ms，累计计数会虚高
    // （曾出现 2/4/6/6/6 的递增假阳性），因此只统计「本次新增」的提示条
    const toastBefore = document.querySelectorAll('.ant-message-error, .ant-notification-notice-error').length
    try {
      el.scrollIntoView({ block: 'center' })
      el.click()
    } catch (e) {
      results.push({ ...info, ok: false, reason: `点击抛异常: ${e.message}` })
      continue
    }
    await sleep(450)

    const { errors: errs, net } = drain()
    const toastNow = document.querySelectorAll('.ant-message-error, .ant-notification-notice-error').length
    const toasts = Math.max(0, toastNow - toastBefore)
    const after = location.pathname + location.search
    const navigated = after !== before

    const problems = []
    if (errs.length) problems.push(`控制台错误: ${errs.slice(0, 2).join(' | ')}`)
    if (net.length) problems.push(`请求失败: ${net.slice(0, 2).map((n) => `${n.status} ${n.url}`).join(' | ')}`)
    if (toasts) problems.push(`出现 ${toasts} 个错误提示`)

    // 自诊断：点击后如果跳到了 /api/... （下载/导出类端点直接在当前标签页打开了），
    // 说明这个元素本该被过滤却漏了。记录出来便于修正过滤规则，
    // 否则浏览器会停在 JSON 响应页上，导致后续所有元素的索引整体错位。
    const wentToApi = location.pathname.startsWith('/api/')
    if (wentToApi) {
      problems.push(`点击后跳出了 SPA（${location.pathname}）——该元素应加入过滤规则`)
    }

    results.push({
      ...info,
      ok: problems.length === 0,
      navigated,
      to: navigated ? after : undefined,
      reason: problems.join('；') || undefined,
    })

    // 还原现场
    if (wentToApi) {
      // 停在 /api/ 上时 history.back() 与 agent-browser open 都可能失效，用 location.replace 强制复位
      location.replace(origPath)
      await sleep(700)
    } else if (navigated) {
      history.back()
      await sleep(450)
    } else {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await sleep(150)
    }
    drain()
  }

  const failed = results.filter((r) => !r.ok)
  return JSON.stringify({
    page: origPath,
    pageIssues,
    clickable: total,
    clicked: results.length,
    overflow,
    failedCount: failed.length,
    failed,
    skippedCount: skipped.length,
    skipped: skipped.slice(0, 12),
    ms: Date.now() - START,
  })
})()
