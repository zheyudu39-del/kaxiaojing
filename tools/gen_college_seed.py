#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
由爬取结果生成后端种子文件 collegeSeed.ts
==========================================

输入：docs/ksu_colleges_majors.json（由 scrape_ksu.py 抓取的官方数据）
输出：server/src/db/collegeSeed.ts

生成的种子文件保留原有 seedColleges() 的全部逻辑（学院/专业写入，
以及学院-竞赛、专业-竞赛的映射构建），仅替换：
  1. colleges 数组（学院名单）
  2. majors 数组（学院-专业对应）
  3. categoryCollegeMap（竞赛类别 → 学院映射）

用法
----
    python gen_college_seed.py
    python gen_college_seed.py --data docs/ksu_colleges_majors.json \
                               --out  server/src/db/collegeSeed.ts
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

CST = timezone(timedelta(hours=8))

# 竞赛类别 → 学院映射。
# 注意：'综合类' 由 seedColleges() 内部特殊处理（关联全部学院），此处不列。
# 与旧版差异：
#   - '美术与设计学院' 更正为 '美术学院'（官方数据中二者是独立学院）
#   - '电子信息类'、'机器人类' 增加 '电子与通信工程学院'
#     （电子信息科学与技术、通信工程 实际归属该学院）
CATEGORY_COLLEGE_MAP: dict[str, list[str]] = {
    "计算机类": ["计算机科学与技术学院"],
    "电子信息类": ["电子与通信工程学院", "物理与电气工程学院", "计算机科学与技术学院"],
    "其他工学类": ["土木工程学院", "交通学院", "建筑学院", "化学与环境科学学院", "电子与通信工程学院"],
    "理学类": [
        "数学与统计学院",
        "物理与电气工程学院",
        "化学与环境科学学院",
        "生命与地理科学学院",
    ],
    "经管类": ["经济与管理学院"],
    "艺术类": ["美术学院", "设计学院", "音乐与舞蹈学院"],
    "语言类": ["外国语学院", "人文学院"],
    "医学类": ["医学院"],
    "机器人类": ["计算机科学与技术学院", "物理与电气工程学院", "电子与通信工程学院"],
    "职业技能类": ["土木工程学院", "建筑学院", "交通学院"],
    "农学类": ["现代农学院", "生命与地理科学学院"],
}

# seedColleges() 的函数体（逻辑不变，仅 categoryCollegeMap 由上面生成）
FUNC_TEMPLATE = '''
export function seedColleges(db: DatabaseWrapper): void {{
    // Insert colleges
    const insertCollege = db.prepare('INSERT INTO colleges (name) VALUES (@name)');
    const insertManyColleges = db.transaction<string>((items) => {{
        for (const name of items) {{
            insertCollege.run({{ name }});
        }}
    }});
    insertManyColleges(colleges);

    // Build a lookup map: college name -> college id
    const collegeRows = db.prepare('SELECT id, name FROM colleges').all();
    const collegeIdMap = new Map<string, number>();
    for (const row of collegeRows) {{
        collegeIdMap.set(row.name, row.id);
    }}

    // Insert majors
    const insertMajor = db.prepare('INSERT INTO majors (name, college_id) VALUES (@name, @college_id)');
    const insertManyMajors = db.transaction<MajorSeed>((items) => {{
        for (const item of items) {{
            const collegeId = collegeIdMap.get(item.collegeName);
            if (collegeId !== undefined) {{
                insertMajor.run({{ name: item.majorName, college_id: collegeId }});
            }}
        }}
    }});
    insertManyMajors(majors);

    // --- Competition-College and Competition-Major mappings ---
    // Category-to-college mapping
    const categoryCollegeMap: Record<string, string[]> = {category_map};

    // Query all competitions grouped by category
    const competitionRows = db.prepare('SELECT id, category FROM competitions').all();
    const collegeCompetitionRecords: CollegeCompetitionRecord[] = [];
    const allCollegeIds = Array.from(collegeIdMap.values());

    for (const comp of competitionRows) {{
        if (comp.category === '综合类') {{
            // 综合类 links to ALL colleges
            for (const cId of allCollegeIds) {{
                collegeCompetitionRecords.push({{ college_id: cId, competition_id: comp.id }});
            }}
        }}
        else {{
            const linkedColleges = categoryCollegeMap[comp.category];
            if (linkedColleges) {{
                for (const collegeName of linkedColleges) {{
                    const cId = collegeIdMap.get(collegeName);
                    if (cId !== undefined) {{
                        collegeCompetitionRecords.push({{ college_id: cId, competition_id: comp.id }});
                    }}
                }}
            }}
        }}
    }}

    // Insert college_competitions
    const insertCollegeComp = db.prepare('INSERT INTO college_competitions (college_id, competition_id) VALUES (@college_id, @competition_id)');
    const insertManyCollegeComps = db.transaction<CollegeCompetitionRecord>((items) => {{
        for (const item of items) {{
            insertCollegeComp.run(item);
        }}
    }});
    insertManyCollegeComps(collegeCompetitionRecords);

    // Build major_competitions records
    const majorRows = db.prepare('SELECT id, college_id FROM majors').all();
    const majorsByCollege = new Map<number, number[]>();
    for (const m of majorRows) {{
        const list = majorsByCollege.get(m.college_id) || [];
        list.push(m.id);
        majorsByCollege.set(m.college_id, list);
    }}

    const majorCompetitionRecords: MajorCompetitionRecord[] = [];
    // For each college-competition link, create major-competition links for all majors in that college
    for (const cc of collegeCompetitionRecords) {{
        const collegeMajors = majorsByCollege.get(cc.college_id);
        if (collegeMajors) {{
            for (const majorId of collegeMajors) {{
                majorCompetitionRecords.push({{ major_id: majorId, competition_id: cc.competition_id }});
            }}
        }}
    }}

    // Insert major_competitions
    const insertMajorComp = db.prepare('INSERT INTO major_competitions (major_id, competition_id) VALUES (@major_id, @competition_id)');
    const insertManyMajorComps = db.transaction<MajorCompetitionRecord>((items) => {{
        for (const item of items) {{
            insertMajorComp.run(item);
        }}
    }});
    insertManyMajorComps(majorCompetitionRecords);
}}
'''


def ts_str(s: str) -> str:
    """转义为 TS 单引号字符串。"""
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def build_ts(data: dict) -> str:
    colleges: list[str] = [c["name"] for c in data["colleges"]]
    college_set = set(colleges)

    # 校验映射表引用的学院都真实存在
    for cat, names in CATEGORY_COLLEGE_MAP.items():
        for n in names:
            if n not in college_set:
                print(f"  ! 警告：映射表类别「{cat}」引用了不存在的学院「{n}」", file=sys.stderr)

    src = data.get("source", {})
    generated = src.get("generated_at") or datetime.now(CST).isoformat(timespec="seconds")
    stats = data.get("stats", {})
    sources = src.get("sources", [])

    lines: list[str] = []
    lines.append("/* eslint-disable */")
    lines.append("// 本文件由 tools/gen_college_seed.py 依据喀什大学官方数据自动生成，请勿手工编辑。")
    lines.append("// 重新生成：python tools/gen_college_seed.py")
    lines.append("//")
    lines.append("// 数据源：")
    for s in sources:
        lines.append(f"//   - {s.get('name')}  {s.get('url')}")
    lines.append(f"// 生成时间：{generated}")
    lines.append(
        f"// 共 {stats.get('college_count', len(colleges))} 个学院 / "
        f"{stats.get('major_count', 0)} 个专业"
    )
    lines.append("")
    lines.append("import type { DatabaseWrapper } from './database';")
    lines.append("")
    lines.append("interface MajorSeed {")
    lines.append("    collegeName: string;")
    lines.append("    majorName: string;")
    lines.append("}")
    lines.append("")
    lines.append("interface CollegeCompetitionRecord {")
    lines.append("    college_id: number;")
    lines.append("    competition_id: number;")
    lines.append("}")
    lines.append("")
    lines.append("interface MajorCompetitionRecord {")
    lines.append("    major_id: number;")
    lines.append("    competition_id: number;")
    lines.append("}")
    lines.append("")

    # colleges
    lines.append("export const colleges = [")
    for c in colleges:
        lines.append(f"    {ts_str(c)},")
    lines.append("];")
    lines.append("")

    # majors（按学院分组，保留 JSON 中的顺序）
    lines.append("export const majors = [")
    for col in data["colleges"]:
        if not col["majors"]:
            continue
        lines.append(f"    // {col['name']}")
        for m in col["majors"]:
            lines.append(
                f"    {{ collegeName: {ts_str(col['name'])}, "
                f"majorName: {ts_str(m['name'])} }},"
            )
    lines.append("];")
    lines.append("")

    # categoryCollegeMap 序列化
    map_lines = ["{"]
    for cat, names in CATEGORY_COLLEGE_MAP.items():
        inner = ", ".join(ts_str(n) for n in names)
        map_lines.append(f"        {ts_str(cat)}: [{inner}],")
    map_lines.append("    }")
    category_map_ts = "\n".join(map_lines)

    lines.append(FUNC_TEMPLATE.format(category_map=category_map_ts).lstrip("\n"))
    lines.append("")

    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="由爬取数据生成 collegeSeed.ts")
    ap.add_argument("--data", default="docs/ksu_colleges_majors.json",
                    help="输入 JSON（默认 docs/ksu_colleges_majors.json）")
    ap.add_argument("--out", default="server/src/db/collegeSeed.ts",
                    help="输出 TS（默认 server/src/db/collegeSeed.ts）")
    args = ap.parse_args()

    data_path = Path(args.data)
    if not data_path.exists():
        print(f"输入文件不存在：{data_path}", file=sys.stderr)
        return 1

    data = json.loads(data_path.read_text(encoding="utf-8"))
    ts = build_ts(data)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(ts, encoding="utf-8")

    n_colleges = len(data["colleges"])
    n_majors = sum(len(c["majors"]) for c in data["colleges"])
    print(f"已生成：{out_path.resolve()}")
    print(f"  学院 {n_colleges} 个 / 专业 {n_majors} 条")
    print(f"  竞赛类别映射 {len(CATEGORY_COLLEGE_MAP)} 条")
    return 0


if __name__ == "__main__":
    sys.exit(main())
