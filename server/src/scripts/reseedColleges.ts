/**
 * 重建学院/专业数据（一次性迁移脚本）
 * =====================================
 *
 * 背景：`collegeSeed.ts` 已依据喀什大学官方数据重新生成
 * （学院 24→25，专业 66→75，修正了「美术与设计学院」→「美术学院」、
 *   补上「电子与通信工程学院」等）。但 `initializeDatabase()` 只在
 *   `colleges` 表为空时才播种，因此已存在的数据库不会自动更新。
 *
 * 本脚本清空学院相关的 4 张表并重新播种：
 *   major_competitions → college_competitions → majors → colleges
 *
 * 安全性：经确认，这 4 张表不被 users 或任何业务表引用（仅相互引用），
 *         清空不会影响用户、竞赛、队伍等其他数据。
 *
 * 用法：
 *   npx ts-node --transpile-only src/scripts/reseedColleges.ts
 *   npx ts-node --transpile-only src/scripts/reseedColleges.ts --dry-run
 *
 * ⚠️ 运行前请先停止后端服务：sql.js 在内存中持有数据库副本，
 *    服务退出时会 flush 覆盖磁盘文件，导致本脚本的改动丢失。
 */

import { initializeDatabase, getDb, closeDatabase } from '../db/database';
import { seedColleges, colleges as seedCollegesList, majors as seedMajorsList } from '../db/collegeSeed';

const DRY_RUN = process.argv.includes('--dry-run');

function counts(): Record<string, number> {
  const db = getDb();
  const q = (sql: string) => (db.prepare(sql).get() as any).c as number;
  return {
    colleges: q('SELECT COUNT(*) as c FROM colleges'),
    majors: q('SELECT COUNT(*) as c FROM majors'),
    college_competitions: q('SELECT COUNT(*) as c FROM college_competitions'),
    major_competitions: q('SELECT COUNT(*) as c FROM major_competitions'),
  };
}

async function main(): Promise<void> {
  console.log('初始化数据库 …');
  await initializeDatabase();

  const before = counts();
  console.log('\n迁移前：', JSON.stringify(before));
  console.log(`种子文件：${seedCollegesList.length} 个学院 / ${seedMajorsList.length} 条专业`);

  if (DRY_RUN) {
    console.log('\n[--dry-run] 仅预览，未做任何修改。');
    closeDatabase();
    return;
  }

  const db = getDb();

  // 按外键依赖顺序清空（先删引用方，再删被引用方）
  console.log('\n清空旧的学院/专业数据 …');
  db.exec('DELETE FROM major_competitions');
  db.exec('DELETE FROM college_competitions');
  db.exec('DELETE FROM majors');
  db.exec('DELETE FROM colleges');

  // 重置自增序列，让 id 从 1 开始（sqlite_sequence 可能不存在，忽略错误）
  try {
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('colleges','majors')");
  } catch {
    /* 表不存在则跳过 */
  }

  console.log('重新播种 …');
  seedColleges(db);

  const after = counts();
  console.log('\n迁移后：', JSON.stringify(after));

  // 校验
  const errors: string[] = [];
  if (after.colleges !== seedCollegesList.length) {
    errors.push(`学院数不符：期望 ${seedCollegesList.length}，实际 ${after.colleges}`);
  }
  if (after.majors !== seedMajorsList.length) {
    errors.push(`专业数不符：期望 ${seedMajorsList.length}，实际 ${after.majors}`);
  }
  if (after.college_competitions === 0) {
    errors.push('college_competitions 为空，竞赛映射未生成');
  }
  if (after.major_competitions === 0) {
    errors.push('major_competitions 为空，竞赛映射未生成');
  }

  // 抽查关键学院是否正确存在
  const check = ['电子与通信工程学院', '美术学院', '设计学院'];
  for (const name of check) {
    const row = db.prepare('SELECT id FROM colleges WHERE name = @name').get({ name });
    if (!row) errors.push(`缺少学院：${name}`);
  }
  const bad = db.prepare("SELECT id FROM colleges WHERE name = '美术与设计学院'").get();
  if (bad) errors.push('仍存在应被移除的旧学院「美术与设计学院」');

  // 打印各学院专业数
  const rows = db.prepare(`
    SELECT c.name, COUNT(m.id) as n
    FROM colleges c LEFT JOIN majors m ON m.college_id = c.id
    GROUP BY c.id ORDER BY n DESC, c.name
  `).all() as any[];
  console.log('\n各学院专业数：');
  for (const r of rows) console.log(`  ${r.name}  ${r.n}`);

  if (errors.length) {
    console.error('\n✗ 校验未通过：');
    for (const e of errors) console.error('  - ' + e);
    closeDatabase();
    process.exit(1);
  }

  console.log('\n✓ 迁移完成，校验通过。');
  closeDatabase();
}

main().catch((e) => {
  console.error('迁移失败：', e);
  process.exit(1);
});
