// 读取 agent-browser eval 的 JSON 输出，打印紧凑报告
let s = '';
process.stdin.on('data', d => s += d).on('end', () => {
  let t = s.trim();
  // agent-browser 会把结果包成 JSON 字符串
  try { if (t.startsWith('"')) t = JSON.parse(t); } catch (e) { }
  let j;
  try { j = JSON.parse(t); } catch (e) { console.log('  [解析失败] ' + s.slice(0, 150)); return; }
  const sum = j.summary || {};
  const keys = Object.keys(sum);
  console.log(`  视口 ${j.vw}x${j.vh} | 问题 ${j.count} 个${keys.length ? ' → ' + keys.map(k => k + ':' + sum[k]).join(', ') : ''}`);
  if (j.layout) console.log(`  布局 header=${JSON.stringify(j.layout.header)} sider=${JSON.stringify(j.layout.sider)} content=${JSON.stringify(j.layout.content)}`);
  const seen = new Set();
  let shown = 0;
  for (const i of j.issues) {
    const k = i.type + '|' + i.path + '|' + i.detail;
    if (seen.has(k)) continue;
    seen.add(k);
    if (shown++ >= 10) { console.log('  ...'); break; }
    console.log(`    · ${i.type} :: ${i.detail}${i.text ? ' ["' + i.text + '"]' : ''}\n      ${i.path}`);
  }
});
