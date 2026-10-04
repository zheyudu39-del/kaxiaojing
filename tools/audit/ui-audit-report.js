#!/usr/bin/env node
/**
 * 前端巡检结果美化输出
 * 从 stdin 读取 ui-page-audit.js 返回的 JSON，打印可读结果。
 * 用法: agent-browser eval --stdin < ui-page-audit.js | node ui-audit-report.js
 */

let raw = ''
process.stdin.on('data', (d) => (raw += d))
process.stdin.on('end', () => {
  let txt = raw.trim()
  // agent-browser 会把结果再包一层 JSON 字符串，剥掉
  if (txt.startsWith('"') && txt.endsWith('"')) {
    try {
      txt = JSON.parse(txt)
    } catch (_) {}
  }
  let r
  try {
    r = JSON.parse(txt)
  } catch (e) {
    console.log(`  ⚠ 无法解析巡检结果: ${txt.slice(0, 200)}`)
    return
  }

  const parts = []
  if (r.pageIssues && r.pageIssues.length) parts.push(`页面: ${r.pageIssues.join('；')}`)
  if (r.failedCount) parts.push(`按钮失败 ${r.failedCount}`)

  const head = `  ${r.page} | 可点 ${r.clickable} 已点 ${r.clicked}${
    r.overflow ? ` 超限未点 ${r.overflow}` : ''
  } 跳过 ${r.skippedCount} | ${
    parts.length ? '⚠ ' + parts.join(' / ') : '✓ 全部正常'
  } (${r.ms}ms)`
  console.log(head)

  for (const f of r.failed || []) {
    console.log(`      ✗ 「${f.text || f.cls || f.tag}」${f.reason || ''}`)
  }
})
