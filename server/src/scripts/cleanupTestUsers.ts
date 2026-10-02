/**
 * 一次性清理脚本：删除本地验证用的临时账号。
 *
 * 用于端到端验证登录态页面后回收测试数据（例如验证导航菜单需要登录）。
 *
 * 用法：
 *   npx ts-node --transpile-only src/scripts/cleanupTestUsers.ts navtest01 [more...]
 *
 * ⚠️ 运行前请先停止后端服务：sql.js 在内存中持有数据库副本，
 *    服务退出时会 flush 覆盖磁盘文件，导致本脚本的改动丢失。
 */

import { initializeDatabase, getDb, closeDatabase } from '../db/database';

const names = process.argv.slice(2).filter((a) => !a.startsWith('-'));

/** 关联 users 的表（有则清、无则跳过） */
const DEPENDENT_TABLES = [
  'team_members',
  'notifications',
  'favorites',
  'study_checkins',
  'prep_todos',
  'user_badges',
  'follows',
  'posts',
  'registrations',
];

async function main(): Promise<void> {
  if (names.length === 0) {
    console.error('用法: ts-node src/scripts/cleanupTestUsers.ts <username...>');
    process.exit(1);
  }

  console.log('初始化数据库 …');
  await initializeDatabase();
  const db = getDb();

  let removed = 0;
  for (const name of names) {
    const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(name) as
      | { id: number; username: string }
      | undefined;

    if (!user) {
      console.log(`  跳过 ${name}（不存在）`);
      continue;
    }

    const uid = user.id;
    console.log(`\n清理 ${name} (id=${uid})`);

    for (const t of DEPENDENT_TABLES) {
      try {
        const info = db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(uid);
        if (info.changes) console.log(`  ${t}: 删除 ${info.changes} 行`);
      } catch {
        /* 表不存在或无 user_id 列，忽略 */
      }
    }

    const res = db.prepare('DELETE FROM users WHERE id = ?').run(uid);
    console.log(`  users: 删除 ${res.changes} 行`);
    removed += res.changes as number;
  }

  const left = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c as number;
  console.log(`\n共删除 ${removed} 个用户，users 表剩余 ${left} 行`);

  closeDatabase();
  console.log('✓ 清理完成并已写盘');
}

main().catch((e) => {
  console.error('清理失败：', e);
  process.exit(1);
});
