// 布局合理性审计（增强版）——在浏览器中执行，返回 JSON 字符串。
// 相比 ui-audit.js，新增：
//   1) 固定底栏遮挡检测（移动端底部导航压住可交互内容）
//   2) 侧栏 / 内容区高度与视口的关系校验
//   3) 顶部导航是否被压缩（子项宽度被压到远小于其自然宽度）
//   4) 内容区有效宽度过窄检测（侧栏 + 内容 挤在中间）
//   5) 空白过多检测（页面主体高度远小于视口）
(() => {
  const R = { url: location.pathname, vw: innerWidth, vh: innerHeight, issues: [], layout: {} };
  const IGNORE_SEL = '.slick-dots, .slick-dots *, .ant-carousel .slick-slider, .anticon, .anticon *, [aria-hidden="true"], .ant-picker-dropdown, .ant-select-dropdown, .ant-dropdown, .ant-modal-root, .ant-tabs-nav-wrap, .ant-tabs-nav-wrap *, .ant-table-content, .ant-table-content *';
  const inSvg = (el) => !!el.closest('svg');
  const ignored = (el) => !!el.closest(IGNORE_SEL) || inSvg(el);
  const rect = (el) => el.getBoundingClientRect();
  const vis = (el) => {
    const cs = getComputedStyle(el);
    const r = rect(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' &&
      parseFloat(cs.opacity || '1') > 0.05 && r.width > 0 && r.height > 0;
  };
  const pathOf = (el) => {
    let path = '', n = el;
    for (let i = 0; i < 3 && n && n.tagName; i++) {
      let c = '';
      if (typeof n.className === 'string' && n.className.trim()) c = '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.');
      path = n.tagName.toLowerCase() + c + (path ? '>' + path : '');
      n = n.parentElement;
    }
    return path.slice(0, 130);
  };
  const push = (type, el, detail) => R.issues.push({
    type, path: pathOf(el), detail, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26),
  });

  // ---------- 1) 页面横向溢出 ----------
  const de = document.documentElement;
  if (de.scrollWidth > innerWidth + 1) {
    R.issues.push({ type: 'page-h-overflow', path: 'html', detail: de.scrollWidth + 'px > viewport ' + innerWidth + 'px', text: '' });
  }

  // ---------- 2) 元素超出视口右边界（非滚动容器内） ----------
  document.querySelectorAll('body *').forEach(el => {
    if (ignored(el) || !vis(el)) return;
    const r = rect(el);
    if (r.right > innerWidth + 2 && r.width < innerWidth) {
      let p = el.parentElement, scrollable = false;
      while (p) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') { scrollable = true; break; } p = p.parentElement; }
      if (!scrollable) push('overflow-right', el, 'right=' + Math.round(r.right) + ' vw=' + innerWidth);
    }
  });

  // ---------- 3) 固定底栏遮挡（移动端核心问题） ----------
  const bottomBars = [...document.querySelectorAll('nav, div, footer')].filter(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed') return false;
    const r = rect(el);
    return r.height > 20 && r.height < 160 && r.bottom > innerHeight - 8 && r.width > innerWidth * 0.5;
  });
  R.layout.bottomBars = bottomBars.map(el => { const r = rect(el); return { h: Math.round(r.height), top: Math.round(r.top), path: pathOf(el) }; });
  if (bottomBars.length) {
    const bar = bottomBars[0];
    const barTop = rect(bar).top;
    // 页面最底部的内容是否被压住
    const de = document.documentElement;
    const bodyBottom = Math.max(de.scrollHeight, document.body.scrollHeight);
    const scrolledToEnd = Math.abs(scrollY + innerHeight - bodyBottom) < 4;
    if (scrolledToEnd) {
      document.querySelectorAll('body *').forEach(el => {
        if (ignored(el) || !vis(el)) return;
        if (el === bar || bar.contains(el)) return;
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.position === 'sticky') return;
        const interactive = el.matches('button, a, input, textarea, select, .ant-btn, .ant-pagination-item, .ant-pagination-next, .ant-pagination-prev, .ant-tag, .ant-switch') ||
          el.classList.contains('ant-btn');
        if (!interactive) return;
        const r = rect(el);
        if (r.bottom > barTop + 1 && r.top < innerHeight) {
          push('bottomnav-cover', el, '底栏 top=' + Math.round(barTop) + '，元素 bottom=' + Math.round(r.bottom));
        }
      });
    }
  }

  // ---------- 4) 侧栏 / 内容区结构 ----------
  const grab = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = rect(e); return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) }; };
  R.layout.header = grab('header');
  R.layout.sider = grab('aside');
  R.layout.content = grab('main');
  R.layout.contentInner = grab('main > div');

  if (R.layout.header && Math.abs(R.layout.header.h - 64) > 2) {
    R.issues.push({ type: 'header-height', path: 'header', detail: '高度 ' + R.layout.header.h + 'px（预期 64）', text: '' });
  }
  if (R.layout.sider) {
    // 视口 <=991 不应出现侧栏
    if (innerWidth <= 991) R.issues.push({ type: 'sider-on-mobile', path: 'aside', detail: '移动端仍渲染侧栏 w=' + R.layout.sider.w, text: '' });
  } else if (innerWidth > 1200) {
    R.issues.push({ type: 'sider-missing', path: 'aside', detail: '宽屏 ' + innerWidth + 'px 下没有侧栏', text: '' });
  }

  // ---------- 5) 顶部导航压缩 ----------
  const header = document.querySelector('header');
  if (header) {
    const nav = header.querySelector('nav');
    if (nav) {
      const links = [...nav.querySelectorAll('a')];
      let compressed = 0;
      links.forEach(a => {
        const r = rect(a);
        // 文本被压扁：宽度小于 40px 或 scrollWidth 明显大于 clientWidth
        if (r.width > 0 && (a.scrollWidth > a.clientWidth + 4)) compressed++;
      });
      if (compressed) R.issues.push({ type: 'header-nav-squeezed', path: 'header>nav', detail: compressed + ' 个导航项被压缩', text: '' });
      const navR = rect(nav);
      R.layout.headerNav = { w: Math.round(navR.width), items: links.length };
      if (navR.width > 0 && navR.width < 260 && innerWidth > 1200) {
        R.issues.push({ type: 'header-nav-too-narrow', path: 'header>nav', detail: '导航区仅 ' + Math.round(navR.width) + 'px（视口 ' + innerWidth + '）', text: '' });
      }
    }
  }

  // ---------- 6) 同行控件对齐 ----------
  const groups = new Map();
  document.querySelectorAll('button, .ant-btn, input, .ant-input, .ant-select-selector, .ant-picker, .ant-switch, .ant-segmented, .ant-radio-button-wrapper').forEach(el => {
    if (ignored(el) || !vis(el)) return;
    const r = rect(el);
    const parentKey = el.parentElement ? (el.parentElement.className || el.parentElement.tagName) : '';
    const key = Math.round(r.top / 10) + '|' + parentKey;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ el, r });
  });
  groups.forEach(items => {
    if (items.length < 2) return;
    const centers = items.map(i => i.r.top + i.r.height / 2);
    const spread = Math.max(...centers) - Math.min(...centers);
    const heights = items.map(i => Math.round(i.r.height));
    const hSpread = Math.max(...heights) - Math.min(...heights);
    const label = items.map(i => (i.el.textContent || i.el.placeholder || i.el.tagName).trim().slice(0, 10)).join(' | ');
    if (spread > 2.5) push('row-vcenter-misalign', items[0].el, '垂直中心相差 ' + spread.toFixed(1) + 'px：' + label);
    if (hSpread > 2) push('row-height-mismatch', items[0].el, '高度 ' + heights.join('/') + 'px：' + label);
  });

  // ---------- 7) 文本被裁剪 ----------
  document.querySelectorAll('body *').forEach(el => {
    if (ignored(el) || el.children.length || !vis(el)) return;
    const cs = getComputedStyle(el);
    if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && cs.textOverflow !== 'ellipsis' && el.clientWidth > 8) {
      if (el.scrollWidth > el.clientWidth + 2) push('text-clipped', el, 'scrollW=' + el.scrollWidth + ' clientW=' + el.clientWidth);
    }
  });

  // ---------- 8) 兄弟元素重叠 ----------
  const isContent = (el) => {
    const t = (el.textContent || '').trim();
    return t.length > 0 || ['IMG', 'CANVAS', 'VIDEO', 'INPUT', 'BUTTON'].includes(el.tagName);
  };
  // antd 固定列（fixed left/right）本来就覆盖在滚动区之上，属正常设计，不报重叠
  const isFixedCell = (el) =>
    !!(el.closest && el.closest('.ant-table-cell-fix-left, .ant-table-cell-fix-right, .ant-table-sticky-holder, .ant-table-sticky-scroll'));
  document.querySelectorAll('body *').forEach(parent => {
    const kids = Array.from(parent.children).filter(k => vis(k) && !ignored(k) && isContent(k));
    if (kids.length < 2 || kids.length > 10) return;
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      if (kids[i].contains(kids[j]) || kids[j].contains(kids[i])) continue;
      if (isFixedCell(kids[i]) || isFixedCell(kids[j])) continue;
      // 表格内的单元格横向滚动时相邻列正常相邻，不做重叠判定
      if (kids[i].closest && kids[i].closest('table') && kids[j].closest && kids[j].closest('table')) continue;
      const posA = getComputedStyle(kids[i]).position, posB = getComputedStyle(kids[j]).position;
      if (['fixed', 'absolute'].includes(posA) || ['fixed', 'absolute'].includes(posB)) continue;
      const a = rect(kids[i]), b = rect(kids[j]);
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 6 && oy > 6) push('overlap', kids[i], '与兄弟重叠 ' + Math.round(ox) + 'x' + Math.round(oy) + 'px');
    }
  });

  // ---------- 9) 内容区过窄 / 空白过多 ----------
  if (R.layout.content && R.layout.sider) {
    const cw = R.layout.content.w;
    if (innerWidth > 1200 && cw < 700) {
      R.issues.push({ type: 'content-too-narrow', path: 'main', detail: '内容区仅 ' + cw + 'px（视口 ' + innerWidth + '，侧栏 ' + R.layout.sider.w + '）', text: '' });
    }
  }
  const bodyH = Math.max(de.scrollHeight, document.body.scrollHeight);
  R.layout.pageHeight = bodyH;
  if (bodyH < innerHeight * 0.55 && !bottomBars.length) {
    R.issues.push({ type: 'page-too-empty', path: 'body', detail: '页面高度 ' + bodyH + 'px / 视口 ' + innerHeight + 'px', text: '' });
  }

  R.count = R.issues.length;
  R.summary = R.issues.reduce((m, i) => (m[i.type] = (m[i.type] || 0) + 1, m), {});
  return JSON.stringify(R);
})()
