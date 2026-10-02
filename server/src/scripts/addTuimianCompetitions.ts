/**
 * 导入推免认定学科竞赛并重建专业推荐映射
 * =========================================
 *
 * 数据来源：《喀什大学 2027 届推免认定学科竞赛项目目录》（85 项）
 *           见 src/db/tuimianCompetitions.ts
 *
 * 本脚本：
 *   1. 把目录中项目竞赛库尚不存在的竞赛（51 项）插入 competitions 表；
 *   2. 调用 buildCompetitionMappings() 全量重建
 *      college_competitions / major_competitions，
 *      使每个学院及其全部专业自动获得对应类别的推荐竞赛；
 *   3. 做完整性校验并打印各学院/专业的推荐竞赛数量。
 *
 * 幂等：按竞赛名称判重，重复运行不会产生重复数据。
 *
 * 用法：
 *   npx ts-node --transpile-only src/scripts/addTuimianCompetitions.ts
 *   npx ts-node --transpile-only src/scripts/addTuimianCompetitions.ts --dry-run
 *
 * ⚠️ 运行前请先停止后端服务：sql.js 在内存中持有数据库副本，
 *    服务退出时会 flush 覆盖磁盘文件，导致本脚本的改动丢失。
 */

import { initializeDatabase, getDb, closeDatabase } from '../db/database';
import { buildCompetitionMappings } from '../db/collegeSeed';
import { tuimianCompetitions } from '../db/tuimianCompetitions';

const DRY_RUN = process.argv.includes('--dry-run');

/** 竞赛名归一化，用于判重（统一引号、去空白、去「第X届」） */
function normName(s: string): string {
  return String(s || '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/[·•—–─]/g, '')
    .replace(/[、，]/g, ',')
    .replace(/[①-⑩]/g, '')
    .replace(/^第[一二三四五六七八九十\d]+届/, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function count(sql: string): number {
  return (getDb().prepare(sql).get() as any).c as number;
}

async function main(): Promise<void> {
  console.log('初始化数据库 …');
  await initializeDatabase();
  const db = getDb();

  const before = {
    competitions: count('SELECT COUNT(*) as c FROM competitions'),
    college_competitions: count('SELECT COUNT(*) as c FROM college_competitions'),
    major_competitions: count('SELECT COUNT(*) as c FROM major_competitions'),
  };
  console.log('\n导入前：', JSON.stringify(before));
  console.log(`待导入竞赛：${tuimianCompetitions.length} 项`);

  // 现有竞赛名（归一化）
  const existingRows = db.prepare('SELECT id, name FROM competitions').all() as any[];
  const existing = new Map<string, number>();
  for (const r of existingRows) existing.set(normName(r.name), r.id);

  const toInsert = tuimianCompetitions.filter((c) => !existing.has(normName(c.name)));
  const skipped = tuimianCompetitions.filter((c) => existing.has(normName(c.name)));

  if (skipped.length) {
    console.log(`\n已存在、跳过 ${skipped.length} 项：`);
    for (const s of skipped) console.log(`  - ${s.name}`);
  }

  if (!toInsert.length) {
    console.log('\n没有需要新增的竞赛。');
  } else {
    console.log(`\n将新增 ${toInsert.length} 项：`);
    for (const c of toInsert) console.log(`  [${c.category}] ${c.name}`);
  }

  if (DRY_RUN) {
    console.log('\n[--dry-run] 仅预览，未做任何修改。');
    closeDatabase();
    return;
  }

  // ---- 插入 ----
  if (toInsert.length) {
    const stmt = db.prepare(`
      INSERT INTO competitions
        (name, category, description, target_audience, fee, format,
         reg_start_month, reg_end_month, requirements)
      VALUES
        (@name, @category, @description, @targetAudience, @fee, @format,
         @regStartMonth, @regEndMonth, @requirements)
    `);
    const insertMany = db.transaction<any>((items) => {
      for (const c of items) {
        stmt.run({
          name: c.name,
          category: c.category,
          description: c.description,
          targetAudience: c.target_audience,
          fee: c.fee,
          format: c.format,
          regStartMonth: c.reg_start_month,
          regEndMonth: c.reg_end_month,
          requirements: c.requirements,
        });
      }
    });
    insertMany(toInsert);
    console.log(`\n已插入 ${toInsert.length} 项竞赛。`);
  }

  // ---- 重建映射 ----
  console.log('\n重建学院/专业 → 竞赛映射 …');
  buildCompetitionMappings(db);

  const after = {
    competitions: count('SELECT COUNT(*) as c FROM competitions'),
    college_competitions: count('SELECT COUNT(*) as c FROM college_competitions'),
    major_competitions: count('SELECT COUNT(*) as c FROM major_competitions'),
  };
  console.log('\n导入后：', JSON.stringify(after));
  console.log(
    `  competitions ${before.competitions}→${after.competitions}，` +
      `college_competitions ${before.college_competitions}→${after.college_competitions}，` +
      `major_competitions ${before.major_competitions}→${after.major_competitions}`,
  );

  // ---- 校验 ----
  const errors: string[] = [];
  if (after.competitions !== before.competitions + toInsert.length) {
    errors.push(`竞赛总数不符：期望 ${before.competitions + toInsert.length}，实际 ${after.competitions}`);
  }
  if (after.college_competitions === 0) errors.push('college_competitions 为空');
  if (after.major_competitions === 0) errors.push('major_competitions 为空');

  // 每个新竞赛都应至少关联 1 个学院
  for (const c of toInsert) {
    const row = db
      .prepare(`
        SELECT COUNT(*) as c FROM college_competitions cc
        JOIN competitions c ON c.id = cc.competition_id
        WHERE c.name = @name
      `)
      .get({ name: c.name }) as any;
    if (!row.c) errors.push(`新竞赛未关联任何学院：${c.name}`);
  }

  // 抽查：每个专业都应有推荐竞赛
  const majorWithout = db
    .prepare(`
      SELECT COUNT(*) as c FROM majors m
      WHERE NOT EXISTS (SELECT 1 FROM major_competitions mc WHERE mc.major_id = m.id)
    `)
    .get() as any;
  if (majorWithout.c > 0) errors.push(`有 ${majorWithout.c} 个专业没有任何推荐竞赛`);

  // 打印统计
  const byCat = db
    .prepare('SELECT category, COUNT(*) as n FROM competitions GROUP BY category ORDER BY n DESC')
    .all() as any[];
  console.log('\n竞赛类别分布：');
  for (const r of byCat) console.log(`  ${r.category}  ${r.n}`);

  const perMajor = db
    .prepare(`
      SELECT MIN(n) as min, MAX(n) as max, ROUND(AVG(n), 1) as avg FROM (
        SELECT m.id, COUNT(mc.competition_id) as n
        FROM majors m LEFT JOIN major_competitions mc ON mc.major_id = m.id
        GROUP BY m.id
      )
    `)
    .get() as any;
  console.log(`\n每个专业的推荐竞赛数：最少 ${perMajor.min}，最多 ${perMajor.max}，平均 ${perMajor.avg}`);

  const sample = db
    .prepare(`
      SELECT m.name as major, c.name as college, COUNT(mc.competition_id) as n
      FROM majors m
      JOIN colleges c ON c.id = m.college_id
      LEFT JOIN major_competitions mc ON mc.major_id = m.id
      GROUP BY m.id ORDER BY n DESC LIMIT 5
    `)
    .all() as any[];
  console.log('\n推荐竞赛最多的专业（前 5）：');
  for (const r of sample) console.log(`  ${r.college} / ${r.major}：${r.n} 项`);

  if (errors.length) {
    console.error('\n✗ 校验未通过：');
    for (const e of errors) console.error('  - ' + e);
    closeDatabase();
    process.exit(1);
  }

  console.log('\n✓ 导入完成，校验通过。');
  closeDatabase();
}

main().catch((e) => {
  console.error('导入失败：', e);
  process.exit(1);
});
