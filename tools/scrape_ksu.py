#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
喀什大学「学院 / 专业」数据爬虫
=================================

从喀什大学官方站点抓取真实的院系与本科专业数据，输出结构化 JSON。

数据来源（全部为 ksu.edu.cn 官方站点）
--------------------------------------
1. 教学机构（学院）列表
   https://www.ksu.edu.cn/zzjg/jx_ky_jfdw.htm
   → 学院名称 + 学院官网地址（权威、静态 HTML，可直接解析）

2. 普通本科招生专业与计划（Excel 附件）
   https://xgb.ksu.edu.cn/zsgz/zsjh.htm
   → 自动发现最新年度的公告页 → 解析附件下载地址 → 下载 xlsx → 解析「学院 / 专业名称」
   → 这是「某学院有哪些招生专业」最权威、最完整的来源

3. 一流本科专业一览表（教务处，用于补充专业代码 / 学科门类）
   https://jwc.ksu.edu.cn/info/1151/2999.htm   国家级
   https://jwc.ksu.edu.cn/info/1151/2989.htm   自治区级
   → 提供 专业代码、专业类、学科门类、立项年度

说明：各学院子站（如 ie.ksu.edu.cn）为 JSP 动态页面，正文由脚本加载，
无法稳定静态解析，故不作为数据源。

用法
----
    python scrape_ksu.py                        # 抓取并输出到 ksu_colleges_majors.json
    python scrape_ksu.py -o data/ksu.json       # 指定输出路径
    python scrape_ksu.py --year 2025            # 指定招生计划年份
    python scrape_ksu.py --no-enrich            # 跳过一流专业（不补充专业代码）
    python scrape_ksu.py --cache .cache         # 缓存原始响应，便于离线复跑

依赖
----
    pip install requests beautifulsoup4 lxml openpyxl

作者备注
--------
- Windows 下若出现 CRYPT_E_REVOCATION_OFFLINE（证书吊销服务器不可达），
  脚本默认对 ksu.edu.cn 关闭证书校验（verify=False），仅用于公开数据抓取。
- 若处于代理环境，脚本自动读取 HTTPS_PROXY / HTTP_PROXY 环境变量。
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urljoin, urlparse

import warnings

warnings.filterwarnings("ignore")  # 屏蔽 verify=False 的 urllib3 警告

try:
    import requests
except ImportError:
    sys.exit("缺少依赖：requests。请先执行  pip install requests beautifulsoup4 lxml openpyxl")

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("缺少依赖：beautifulsoup4。请先执行  pip install requests beautifulsoup4 lxml openpyxl")

try:
    import openpyxl
except ImportError:
    openpyxl = None  # 仅在需要解析 Excel 时报错


# --------------------------------------------------------------------------- #
# 常量配置
# --------------------------------------------------------------------------- #

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

BASE_MAIN = "https://www.ksu.edu.cn"
URL_ORG = f"{BASE_MAIN}/zzjg/jx_ky_jfdw.htm"          # 教学机构列表
BASE_XGB = "https://xgb.ksu.edu.cn"
URL_ADMISSION_LIST = f"{BASE_XGB}/zsgz/zsjh.htm"       # 招生计划栏目
BASE_JWC = "https://jwc.ksu.edu.cn"
URL_FIRST_CLASS = {
    "国家级": f"{BASE_JWC}/info/1151/2999.htm",
    "自治区级": f"{BASE_JWC}/info/1151/2989.htm",
}

# 中国标准时区（输出时间戳用）
CST = timezone(timedelta(hours=8))


# --------------------------------------------------------------------------- #
# 数据模型
# --------------------------------------------------------------------------- #

@dataclass
class Major:
    """一个本科专业。"""
    name: str
    code: str | None = None          # 专业代码，如 050101
    category: str | None = None      # 专业类，如 中国语言文学类
    discipline: str | None = None    # 学科门类，如 文学
    level: str | None = None         # 一流专业等级：国家级 / 自治区级

    def key(self) -> str:
        """用于合并的归一化键。"""
        return normalize_major_name(self.name)


@dataclass
class College:
    """一个学院（教学机构）。"""
    name: str
    website: str | None = None
    majors: list[Major] = field(default_factory=list)

    @property
    def major_count(self) -> int:
        return len(self.majors)


# --------------------------------------------------------------------------- #
# 工具函数
# --------------------------------------------------------------------------- #

def normalize_major_name(name: str) -> str:
    """
    归一化专业名称，用于跨数据源匹配。

    处理：全角/半角括号统一、去除空白、去除方向说明。
    例：「中国少数民族语言文学（维吾尔语言）」→「中国少数民族语言文学(维吾尔语言)」
    """
    if not name:
        return ""
    s = str(name).strip()
    s = s.replace("（", "(").replace("）", ")")
    s = re.sub(r"\s+", "", s)
    return s


def normalize_college_name(name: str) -> str:
    """归一化学院名称。"""
    return re.sub(r"\s+", "", str(name or "").strip())


def clean_text(s: Any) -> str:
    """清理单元格/节点文本。"""
    if s is None:
        return ""
    return re.sub(r"[\s\u200b\xa0]+", " ", str(s)).strip()


class Fetcher:
    """带重试与缓存的 HTTP 抓取器。"""

    def __init__(self, timeout: int = 25, retries: int = 3, cache_dir: Path | None = None):
        self.timeout = timeout
        self.retries = retries
        self.cache_dir = Path(cache_dir) if cache_dir else None
        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)

        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        })
        # 代理：requests 会自动读取 HTTPS_PROXY/HTTP_PROXY，这里显式兜底一次
        self.proxies = None
        for var in ("HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"):
            if os.environ.get(var):
                self.proxies = {"http": os.environ[var], "https": os.environ[var]}
                break

    def _cache_path(self, url: str) -> Path | None:
        if not self.cache_dir:
            return None
        safe = re.sub(r"[^0-9A-Za-z._-]", "_", url)[:150]
        return self.cache_dir / safe

    def get(self, url: str, *, binary: bool = False, use_cache: bool = True):
        """GET 一个 URL。返回 str（文本）或 bytes（binary=True）。"""
        cp = self._cache_path(url) if use_cache else None
        if cp and cp.exists():
            data = cp.read_bytes()
            return data if binary else decode_bytes(data)

        last_err: Exception | None = None
        for attempt in range(1, self.retries + 1):
            try:
                # verify=False：规避 Windows schannel 吊销检查失败
                r = self.session.get(
                    url, timeout=self.timeout, verify=False,
                    proxies=self.proxies, allow_redirects=True,
                )
                r.raise_for_status()
                data = r.content
                if cp:
                    cp.write_bytes(data)
                return data if binary else decode_bytes(data)
            except Exception as e:  # noqa: BLE001
                last_err = e
                if attempt < self.retries:
                    time.sleep(1.5 * attempt)
        raise RuntimeError(f"请求失败：{url} → {type(last_err).__name__}: {last_err}")


def decode_bytes(data: bytes) -> str:
    """按常见中文编码解码 HTML。"""
    # 优先看 meta charset
    head = data[:2048].decode("ascii", errors="ignore").lower()
    m = re.search(r'charset=["\']?([\w-]+)', head)
    if m:
        enc = m.group(1)
        try:
            return data.decode(enc, errors="replace")
        except LookupError:
            pass
    for enc in ("utf-8-sig", "utf-8", "gb18030", "gbk"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


# --------------------------------------------------------------------------- #
# 数据源 1：教学机构（学院）列表
# --------------------------------------------------------------------------- #

def fetch_colleges(fetcher: Fetcher) -> list[College]:
    """
    解析「组织机构 → 教学机构」页面，返回学院列表。

    页面结构：div.org1-item > div.d-title2 > h3.title （标题，含 img）
              div.org1-item > ul.d-orgUl-1 > li > a （条目）
    """
    html = fetcher.get(URL_ORG)
    soup = BeautifulSoup(html, "lxml")

    colleges: list[College] = []
    for item in soup.find_all("div", class_="org1-item"):
        h3 = item.find("h3", class_="title")
        if not h3:
            continue
        heading = clean_text(h3.get_text())
        if heading != "教学机构":       # 只要教学机构，排除科研机构 / 教辅单位
            continue

        ul = item.find("ul")
        if not ul:
            continue
        for li in ul.find_all("li"):
            a = li.find("a")
            if not a:
                continue
            name = clean_text(a.get_text())
            if not name:
                continue
            href = (a.get("href") or "").strip()
            # 「国学院」的 href 是占位符 "#"
            website = urljoin(URL_ORG, href) if href and href != "#" else None
            colleges.append(College(name=name, website=website))

    if not colleges:
        raise RuntimeError("未能从教学机构页面解析出任何学院，页面结构可能已变更")
    return colleges


# --------------------------------------------------------------------------- #
# 数据源 2：招生专业与计划（Excel 附件）
# --------------------------------------------------------------------------- #

@dataclass
class AdmissionResult:
    year: int
    page_url: str
    file_url: str
    file_name: str
    pairs: list[tuple[str, str]]      # [(学院, 专业名称), ...]


def discover_admission_announcement(fetcher: Fetcher, year: int | None) -> tuple[str, int]:
    """
    在招生计划栏目里找出「喀什大学YYYY年普通本科招生专业与计划」的公告页地址。
    返回 (公告页URL, 年份)。
    """
    html = fetcher.get(URL_ADMISSION_LIST)
    soup = BeautifulSoup(html, "lxml")

    found: list[tuple[int, str]] = []
    for a in soup.find_all("a", href=True):
        title = clean_text(a.get_text())
        m = re.search(r"喀什大学\s*(\d{4})\s*年.*招生专业与计划", title)
        if not m:
            continue
        y = int(m.group(1))
        url = urljoin(URL_ADMISSION_LIST, a["href"])
        found.append((y, url))

    if not found:
        raise RuntimeError("未在招生计划栏目找到「普通本科招生专业与计划」公告")

    if year:
        for y, url in found:
            if y == year:
                return url, y
        raise RuntimeError(f"未找到 {year} 年的招生专业与计划公告")

    y, url = max(found, key=lambda t: t[0])   # 取最新年份
    return url, y


def fetch_admission_majors(fetcher: Fetcher, year: int | None) -> AdmissionResult:
    """下载并解析招生专业 Excel，返回 (学院, 专业) 列表。"""
    if openpyxl is None:
        raise RuntimeError("缺少依赖：openpyxl。请执行  pip install openpyxl")

    page_url, y = discover_admission_announcement(fetcher, year)
    page_html = fetcher.get(page_url)
    soup = BeautifulSoup(page_html, "lxml")

    # 找附件下载链接（download.jsp ... wbfileid=...）
    file_url = file_name = None
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = clean_text(a.get_text())
        if ("download" in href.lower() or "attach" in href.lower()) and re.search(
            r"\.(xlsx?|csv)$", text, re.I
        ):
            file_url = urljoin(page_url, href)
            file_name = text
            break
    if not file_url:
        raise RuntimeError(f"未在公告页找到 Excel 附件：{page_url}")

    raw = fetcher.get(file_url, binary=True)
    pairs = parse_admission_xlsx(raw)

    return AdmissionResult(
        year=y, page_url=page_url, file_url=file_url, file_name=file_name or "", pairs=pairs
    )


def parse_admission_xlsx(raw: bytes) -> list[tuple[str, str]]:
    """
    解析招生专业 Excel。

    表结构（喀什大学历年一致）：
        第 1 行：标题（合并单元格）
        第 2 行：表头「学院 | 专业名称 | 新疆(普通类) | ...」
        第 3 行：小计行
        第 4 行起：数据，「第 1 列 = 学院，第 2 列 = 专业名称」
    """
    wb = openpyxl.load_workbook(BytesIO(raw), data_only=True, read_only=True)
    ws = wb.worksheets[0]

    # 定位表头行（含「学院」和「专业名称」的行）
    header_row = None
    rows = list(ws.iter_rows(values_only=True))
    for idx, row in enumerate(rows[:10]):
        cells = [clean_text(c) for c in row[:4]]
        if "学院" in cells and any("专业" in c for c in cells):
            header_row = idx
            break
    if header_row is None:
        header_row = 2      # 兜底：假定第 3 行是表头

    pairs: list[tuple[str, str]] = []
    for row in rows[header_row + 1:]:
        if len(row) < 2:
            continue
        college = clean_text(row[0])
        major = clean_text(row[1])
        if not college or not major:
            continue
        # 跳过小计/合计行
        if college in {"名称", "总计", "合计", "小计"} or major in {"总计", "合计", "小计"}:
            continue
        pairs.append((college, major))

    wb.close()
    if not pairs:
        raise RuntimeError("招生 Excel 解析结果为空，表结构可能已变更")
    return pairs


# --------------------------------------------------------------------------- #
# 数据源 3：一流本科专业（补充专业代码 / 学科门类）
# --------------------------------------------------------------------------- #

def fetch_first_class_majors(fetcher: Fetcher) -> dict[str, dict[str, str]]:
    """
    解析教务处「一流本科专业一览表」，返回 {归一化专业名: 附加信息}。

    表头：序号 | 专业代码 | 专业名称 | 所在学院 | 专业类 | 学科门类 | 立项年度
    """
    result: dict[str, dict[str, str]] = {}

    for level, url in URL_FIRST_CLASS.items():
        try:
            html = fetcher.get(url)
        except Exception as e:  # noqa: BLE001
            print(f"  ! 跳过{level}一流专业（{e}）", file=sys.stderr)
            continue

        soup = BeautifulSoup(html, "lxml")
        for table in soup.find_all("table"):
            rows = table.find_all("tr")
            if len(rows) < 2:
                continue
            header = [clean_text(c.get_text()) for c in rows[0].find_all(["td", "th"])]
            if not any("专业名称" in h for h in header):
                continue

            idx = {name: i for i, name in enumerate(header)}

            def cell(cells: list[str], key: str) -> str:
                i = idx.get(key)
                return cells[i] if i is not None and i < len(cells) else ""

            for tr in rows[1:]:
                cells = [clean_text(c.get_text()) for c in tr.find_all(["td", "th"])]
                if not cells:
                    continue
                major_name = cell(cells, "专业名称")
                if not major_name:
                    continue
                key = normalize_major_name(major_name)
                # 国家级优先于自治区级
                if key in result and result[key].get("level") == "国家级":
                    continue
                result[key] = {
                    "code": cell(cells, "专业代码"),
                    "category": cell(cells, "专业类"),
                    "discipline": cell(cells, "学科门类"),
                    "level": level,
                    "college": cell(cells, "所在学院"),
                }
    return result


# --------------------------------------------------------------------------- #
# 合并与输出
# --------------------------------------------------------------------------- #

def build_dataset(
    colleges: list[College],
    admission: AdmissionResult,
    first_class: dict[str, dict[str, str]],
) -> dict[str, Any]:
    """把三个数据源合并成一个结构化数据集。"""
    by_name = {normalize_college_name(c.name): c for c in colleges}

    # 1) 把招生专业挂到对应学院
    for college_name, major_name in admission.pairs:
        ckey = normalize_college_name(college_name)
        college = by_name.get(ckey)
        if college is None:
            # 招生表里出现了教学机构列表中没有的学院 → 动态补充并标记
            college = College(name=college_name)
            by_name[ckey] = college
            colleges.append(college)
        if any(m.key() == normalize_major_name(major_name) for m in college.majors):
            continue
        college.majors.append(Major(name=major_name))

    # 2) 用一流专业表补充专业代码 / 学科门类
    for college in colleges:
        for major in college.majors:
            info = first_class.get(major.key())
            if info:
                major.code = info.get("code") or major.code
                major.category = info.get("category") or major.category
                major.discipline = info.get("discipline") or major.discipline
                major.level = info.get("level") or major.level

    # 3) 输出
    colleges_out = []
    for c in sorted(colleges, key=lambda x: (-x.major_count, x.name)):
        colleges_out.append({
            "name": c.name,
            "website": c.website,
            "major_count": c.major_count,
            "majors": [asdict(m) for m in c.majors],
        })

    total_majors = sum(c["major_count"] for c in colleges_out)

    return {
        "source": {
            "university": "喀什大学",
            "generated_at": datetime.now(CST).isoformat(timespec="seconds"),
            "sources": [
                {"name": "教学机构（学院）列表", "url": URL_ORG},
                {"name": f"{admission.year}年普通本科招生专业与计划", "url": admission.page_url},
                {"name": "国家级一流本科专业", "url": URL_FIRST_CLASS["国家级"]},
                {"name": "自治区级一流本科专业", "url": URL_FIRST_CLASS["自治区级"]},
            ],
            "admission_file": admission.file_name,
        },
        "stats": {
            "college_count": len(colleges_out),
            "major_count": total_majors,
            "colleges_with_majors": sum(1 for c in colleges_out if c["major_count"] > 0),
        },
        "colleges": colleges_out,
    }


def print_summary(dataset: dict[str, Any]) -> None:
    """控制台摘要。"""
    st = dataset["stats"]
    print()
    print("=" * 68)
    print(f"  喀什大学 学院 / 专业  抓取完成")
    print("=" * 68)
    print(f"  学院数：{st['college_count']}   专业数：{st['major_count']}"
          f"   含专业学院：{st['colleges_with_majors']}")
    print("-" * 68)
    for c in dataset["colleges"]:
        print(f"  {c['name']}（{c['major_count']}）")
        for m in c["majors"]:
            extra = []
            if m.get("code"):
                extra.append(m["code"])
            if m.get("level"):
                extra.append(f"{m['level']}一流")
            suffix = f"  [{' / '.join(extra)}]" if extra else ""
            print(f"      - {m['name']}{suffix}")
    print("=" * 68)


def compare_with_seed(dataset: dict[str, Any], seed_path: Path) -> None:
    """
    与现有 collegeSeed.ts 对比，列出差异（便于项目更新种子数据）。
    """
    if not seed_path.exists():
        return
    text = seed_path.read_text(encoding="utf-8", errors="replace")

    m = re.search(r"export const colleges\s*=\s*\[(.*?)\]", text, re.S)
    seed_colleges = set(re.findall(r"'([^']+)'", m.group(1))) if m else set()

    seed_majors: set[tuple[str, str]] = set()
    m2 = re.search(r"export const majors\s*=\s*\[(.*?)\n\];", text, re.S)
    if m2:
        for cn, mn in re.findall(
            r"collegeName:\s*'([^']+)'\s*,\s*majorName:\s*'([^']+)'", m2.group(1)
        ):
            seed_majors.add((normalize_college_name(cn), normalize_major_name(mn)))

    real_colleges = {normalize_college_name(c["name"]) for c in dataset["colleges"]}
    real_majors = {
        (normalize_college_name(c["name"]), normalize_major_name(m["name"]))
        for c in dataset["colleges"] for m in c["majors"]
    }

    print()
    print("=" * 68)
    print("  与现有种子数据（collegeSeed.ts）的差异")
    print("=" * 68)
    print(f"  种子学院 {len(seed_colleges)} 个 / 真实学院 {len(real_colleges)} 个")
    print(f"  种子专业 {len(seed_majors)} 条 / 真实专业 {len(real_majors)} 条")

    only_real_c = sorted(real_colleges - seed_colleges)
    only_seed_c = sorted(seed_colleges - real_colleges)
    if only_real_c:
        print(f"\n  [真实有、种子缺] 学院：{', '.join(only_real_c)}")
    if only_seed_c:
        print(f"  [种子有、真实无] 学院：{', '.join(only_seed_c)}")

    only_real_m = sorted(real_majors - seed_majors)
    if only_real_m:
        print(f"\n  [真实有、种子缺] 专业（{len(only_real_m)} 条）：")
        for c, m in only_real_m:
            print(f"      {c} / {m}")
    print("=" * 68)


# --------------------------------------------------------------------------- #
# 入口
# --------------------------------------------------------------------------- #

def main() -> int:
    ap = argparse.ArgumentParser(
        description="爬取喀什大学真实的学院与本科专业数据",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("-o", "--out", default="ksu_colleges_majors.json",
                    help="输出 JSON 路径（默认 ksu_colleges_majors.json）")
    ap.add_argument("--year", type=int, default=None,
                    help="指定招生计划年份（默认自动取最新）")
    ap.add_argument("--timeout", type=int, default=25, help="单次请求超时秒数")
    ap.add_argument("--retries", type=int, default=3, help="请求重试次数")
    ap.add_argument("--no-enrich", action="store_true",
                    help="跳过一流专业表（不补充专业代码/学科门类）")
    ap.add_argument("--cache", default=None,
                    help="缓存目录，缓存原始响应便于离线复跑")
    ap.add_argument("--compare-seed", default=None,
                    help="与指定 collegeSeed.ts 对比差异")
    args = ap.parse_args()

    fetcher = Fetcher(timeout=args.timeout, retries=args.retries, cache_dir=args.cache)

    print("[1/3] 抓取教学机构（学院）列表 …")
    colleges = fetch_colleges(fetcher)
    print(f"      → 解析到 {len(colleges)} 个学院")

    print("[2/3] 抓取招生专业与计划（Excel 附件）…")
    admission = fetch_admission_majors(fetcher, args.year)
    print(f"      → {admission.year} 年，附件：{admission.file_name}")
    print(f"      → 解析到 {len(admission.pairs)} 条「学院 / 专业」记录")

    first_class: dict[str, dict[str, str]] = {}
    if args.no_enrich:
        print("[3/3] 跳过一流专业表（--no-enrich）")
    else:
        print("[3/3] 抓取一流本科专业一览表（补充专业代码）…")
        first_class = fetch_first_class_majors(fetcher)
        print(f"      → 补充 {len(first_class)} 个专业的代码/学科门类")

    dataset = build_dataset(colleges, admission, first_class)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(dataset, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n已写出：{out_path.resolve()}")

    print_summary(dataset)

    if args.compare_seed:
        compare_with_seed(dataset, Path(args.compare_seed))

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as exc:  # noqa: BLE001
        print(f"\n抓取失败：{exc}", file=sys.stderr)
        sys.exit(1)
