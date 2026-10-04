/**
 * 为自动化审计准备一个独立的测试数据库。
 * =====================================
 *
 * 做两件事：
 *   1. 把真实库 data/competition.db 复制成 data/audit-test.db
 *   2. 在副本里建一个**已知密码的管理员账号**（auditbot / AuditBot123）
 *
 * 为什么要副本：审计脚本会对写接口发真实请求（含删除类），
 * 在副本上跑才不会污染真实数据。
 *
 * ⚠️ 必须在测试后端启动**之前**运行——sql.js 在内存持有 DB 副本，
 *    服务运行期间的外部写入会在服务退出时被覆盖。
 *
 * 用法：npx ts-node --transpile-only src/scripts/auditPrepare.ts
 */

import fs from 'fs';
import path from 'path';
import { initializeDatabase, getDb, closeDatabase } from '../db/database';
import { authService } from '../services/authService';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const SRC_DB = path.join(DATA_DIR, 'competition.db');
const DST_DB = path.join(DATA_DIR, 'audit-test.db');

export const AUDIT_USER = { username: 'auditbot', email: 'auditbot@example.com', password: 'AuditBot123' };

async function main(): Promise<void> {
  if (!fs.existsSync(SRC_DB)) {
    console.error(`源数据库不存在：${SRC_DB}`);
    process.exit(1);
  }

  // 连 -journal/-wal 一起复制，避免拿到半写状态
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const s = SRC_DB + suffix;
    const d = DST_DB + suffix;
    if (fs.existsSync(s)) fs.copyFileSync(s, d);
    else if (fs.existsSync(d)) fs.unlinkSync(d);
  }
  console.log(`已复制数据库 → ${path.basename(DST_DB)}`);

  await initializeDatabase(DST_DB);
  const db = getDb();

  // 清掉可能残留的同名账号，保证脚本可重复运行
  db.prepare('DELETE FROM users WHERE username = ? OR email = ?').run(AUDIT_USER.username, AUDIT_USER.email);

  const user = authService.register(AUDIT_USER.username, AUDIT_USER.email, AUDIT_USER.password);
  // 审计需要覆盖管理端接口，直接提权
  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);

  const check = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(user.id) as any;
  console.log(`审计账号就绪：id=${check.id} username=${check.username} role=${check.role}`);

  const counts = {
    users: (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c,
    competitions: (db.prepare('SELECT COUNT(*) as c FROM competitions').get() as any).c,
  };
  console.log(`副本数据量：users=${counts.users} competitions=${counts.competitions}`);

  closeDatabase();
  console.log('✓ 准备完成');
}

if (require.main === module) {
  main().catch((e) => {
    console.error('准备失败：', e);
    process.exit(1);
  });
}
