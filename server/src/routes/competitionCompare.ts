/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/routes/competitionCompare.ts

import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();
// 获取多个竞赛的对比数据
router.get('/', (req, res) => {
    const ids = req.query.ids;
    if (!ids) {
        res.status(400).json({ error: '请提供竞赛ID列表' });
        return;
    }
    const idList = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (idList.length < 2 || idList.length > 5) {
        res.status(400).json({ error: '请选择2-5个竞赛进行对比' });
        return;
    }
    const db = getDb();
    const placeholders = idList.map(() => '?').join(',');
    // 获取竞赛基本信息
    const competitions = db.prepare(`
    SELECT c.id, c.name, c.category, c.description, c.target_audience, c.fee, c.format,
      c.reg_start_month, c.reg_end_month, c.requirements, c.official_website,
      (SELECT COUNT(*) FROM favorites WHERE competition_id = c.id) as favorite_count,
      (SELECT COUNT(*) FROM registrations WHERE competition_id = c.id) as registration_count,
      (SELECT COUNT(*) FROM teams WHERE competition_id = c.id) as team_count,
      (SELECT COUNT(*) FROM awards WHERE competition_id = c.id) as award_count,
      (SELECT COUNT(*) FROM resources WHERE competition_id = c.id AND review_status = 'approved') as resource_count,
      (SELECT AVG(rating) FROM competition_reviews WHERE competition_id = c.id) as avg_rating,
      (SELECT COUNT(*) FROM competition_reviews WHERE competition_id = c.id) as review_count
    FROM competitions c
    WHERE c.id IN (${placeholders}) AND c.deleted_at IS NULL
  `).all(...idList);
    // 获取每个竞赛的阶段信息
    const stages = db.prepare(`
    SELECT competition_id, stage_name, start_month, end_month, description
    FROM competition_stages
    WHERE competition_id IN (${placeholders})
    ORDER BY sort_order
  `).all(...idList);
    // 按竞赛ID分组阶段
    const stagesByComp = {};
    for (const stage of stages) {
        if (!stagesByComp[stage.competition_id]) {
            stagesByComp[stage.competition_id] = [];
        }
        stagesByComp[stage.competition_id].push(stage);
    }
    // 合并数据
    const result = competitions.map(comp => ({
        ...comp,
        stages: stagesByComp[comp.id] || []
    }));
    res.json(result);
});
export default router;
