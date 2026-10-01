/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/stagesSeed.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { DatabaseWrapper } from './database';

const stages = [
    // 1. 中国国际大学生创新大赛 (reg: 4-7)
    { competition_id: 1, stage_name: '校赛选拔', start_month: 4, end_month: 5, description: '各高校组织校内选拔赛', sort_order: 1 },
    { competition_id: 1, stage_name: '省赛', start_month: 5, end_month: 6, description: '省级复赛评审', sort_order: 2 },
    { competition_id: 1, stage_name: '全国总决赛', start_month: 7, end_month: 8, description: '全国现场总决赛', sort_order: 3 },
    // 2. "挑战杯"全国大学生课外学术科技作品竞赛 (reg: 1-5)
    { competition_id: 2, stage_name: '校赛选拔', start_month: 1, end_month: 3, description: '各高校组织校内评审选拔', sort_order: 1 },
    { competition_id: 2, stage_name: '省赛', start_month: 3, end_month: 5, description: '省级评审与推荐', sort_order: 2 },
    { competition_id: 2, stage_name: '全国终审决赛', start_month: 5, end_month: 6, description: '全国终审决赛答辩', sort_order: 3 },
    // 3. "挑战杯"中国大学生创业计划竞赛 (reg: 3-6)
    { competition_id: 3, stage_name: '校赛选拔', start_month: 3, end_month: 4, description: '各高校组织校内创业计划评审', sort_order: 1 },
    { competition_id: 3, stage_name: '省赛', start_month: 4, end_month: 6, description: '省级复赛评审', sort_order: 2 },
    { competition_id: 3, stage_name: '全国决赛', start_month: 6, end_month: 7, description: '全国现场路演决赛', sort_order: 3 },
    // 4. 全国大学生数学建模竞赛 (reg: 6-9)
    { competition_id: 4, stage_name: '报名与培训', start_month: 6, end_month: 8, description: '各校组织报名和赛前培训', sort_order: 1 },
    { competition_id: 4, stage_name: '全国统一竞赛', start_month: 9, end_month: 9, description: '连续72小时建模竞赛', sort_order: 2 },
    { competition_id: 4, stage_name: '评审与颁奖', start_month: 10, end_month: 11, description: '全国统一评审与结果公布', sort_order: 3 },
    // 5. 全国大学生节能减排社会实践与科技竞赛 (reg: 3-7)
    { competition_id: 5, stage_name: '校赛选拔', start_month: 3, end_month: 5, description: '各高校组织校内选拔', sort_order: 1 },
    { competition_id: 5, stage_name: '网评初审', start_month: 5, end_month: 6, description: '全国网络评审初审', sort_order: 2 },
    { competition_id: 5, stage_name: '全国总决赛', start_month: 7, end_month: 8, description: '全国现场答辩决赛', sort_order: 3 },
    // 6. 全国大学生创新创业训练计划年会展示 (reg: 5-10)
    { competition_id: 6, stage_name: '项目申报', start_month: 5, end_month: 7, description: '各校推荐优秀大创项目', sort_order: 1 },
    { competition_id: 6, stage_name: '专家评审', start_month: 8, end_month: 9, description: '全国专家网络评审', sort_order: 2 },
    { competition_id: 6, stage_name: '年会展示', start_month: 10, end_month: 11, description: '全国年会现场展示交流', sort_order: 3 },
    // 7. 世界大学生桥梁设计大赛 (reg: 3-8)
    { competition_id: 7, stage_name: '方案设计', start_month: 3, end_month: 5, description: '桥梁方案设计与提交', sort_order: 1 },
    { competition_id: 7, stage_name: '模型制作', start_month: 5, end_month: 7, description: '桥梁模型制作与测试', sort_order: 2 },
    { competition_id: 7, stage_name: '现场加载决赛', start_month: 8, end_month: 9, description: '现场加载试验与答辩', sort_order: 3 },
    // 8. 中国大学生计算机设计大赛 (reg: 1-5)
    { competition_id: 8, stage_name: '校赛选拔', start_month: 1, end_month: 3, description: '各高校组织校内选拔', sort_order: 1 },
    { competition_id: 8, stage_name: '省赛', start_month: 3, end_month: 5, description: '省级评审与推荐', sort_order: 2 },
    { competition_id: 8, stage_name: '全国决赛', start_month: 7, end_month: 8, description: '全国现场答辩决赛', sort_order: 3 },
    // 9. ACM-ICPC国际大学生程序设计竞赛 (reg: 9-11)
    { competition_id: 9, stage_name: '网络预选赛', start_month: 9, end_month: 10, description: '线上网络预选赛', sort_order: 1 },
    { competition_id: 9, stage_name: '区域赛', start_month: 10, end_month: 12, description: '亚洲区域赛现场赛', sort_order: 2 },
    { competition_id: 9, stage_name: '世界总决赛', start_month: 4, end_month: 5, description: '全球总决赛（次年）', sort_order: 3 },
    // 10. 全国大学生信息安全竞赛 (reg: 3-7)
    { competition_id: 10, stage_name: '校赛/初赛', start_month: 3, end_month: 5, description: '各高校组织初赛选拔', sort_order: 1 },
    { competition_id: 10, stage_name: '半决赛', start_month: 5, end_month: 6, description: '线上半决赛（CTF对抗）', sort_order: 2 },
    { competition_id: 10, stage_name: '全国总决赛', start_month: 7, end_month: 8, description: '全国现场攻防决赛', sort_order: 3 },
    // 11. 全国大学生软件测试大赛 (reg: 3-6)
    { competition_id: 11, stage_name: '初赛', start_month: 3, end_month: 4, description: '线上初赛选拔', sort_order: 1 },
    { competition_id: 11, stage_name: '决赛', start_month: 5, end_month: 6, description: '全国现场决赛', sort_order: 2 },
    // 12. 中国高校计算机大赛-团体程序设计天梯赛 (reg: 1-4)
    { competition_id: 12, stage_name: '报名与训练', start_month: 1, end_month: 3, description: '各校组队报名与赛前训练', sort_order: 1 },
    { competition_id: 12, stage_name: '全国统一竞赛', start_month: 4, end_month: 4, description: '全国同步线上竞赛', sort_order: 2 },
    // 13. 中国高校计算机大赛-大数据挑战赛 (reg: 3-8)
    { competition_id: 13, stage_name: '初赛', start_month: 3, end_month: 5, description: '线上数据分析初赛', sort_order: 1 },
    { competition_id: 13, stage_name: '复赛', start_month: 5, end_month: 7, description: '线上复赛与模型优化', sort_order: 2 },
    { competition_id: 13, stage_name: '全国总决赛', start_month: 7, end_month: 8, description: '现场答辩决赛', sort_order: 3 },
    // 14. 中国高校计算机大赛-网络技术挑战赛 (reg: 4-9)
    { competition_id: 14, stage_name: '初赛', start_month: 4, end_month: 6, description: '线上初赛选拔', sort_order: 1 },
    { competition_id: 14, stage_name: '复赛', start_month: 6, end_month: 8, description: '区域复赛', sort_order: 2 },
    { competition_id: 14, stage_name: '全国决赛', start_month: 8, end_month: 9, description: '全国现场决赛', sort_order: 3 },
    // 15. 中国高校计算机大赛-人工智能创意赛 (reg: 3-8)
    { competition_id: 15, stage_name: '初赛', start_month: 3, end_month: 5, description: '线上提交作品初审', sort_order: 1 },
    { competition_id: 15, stage_name: '复赛', start_month: 5, end_month: 7, description: '线上复赛评审', sort_order: 2 },
    { competition_id: 15, stage_name: '全国总决赛', start_month: 7, end_month: 8, description: '现场演示与答辩', sort_order: 3 },
    // 16. 中国高校计算机大赛-移动应用创新赛 (reg: 4-9)
    { competition_id: 16, stage_name: '初赛', start_month: 4, end_month: 6, description: '线上提交应用初审', sort_order: 1 },
    { competition_id: 16, stage_name: '复赛', start_month: 6, end_month: 8, description: '线上复赛评审', sort_order: 2 },
    { competition_id: 16, stage_name: '全国决赛', start_month: 8, end_month: 9, description: '现场演示与答辩决赛', sort_order: 3 },
    // 17. 全国大学生物联网设计竞赛 (reg: 3-8)
    { competition_id: 17, stage_name: '初赛', start_month: 3, end_month: 5, description: '线上提交方案初审', sort_order: 1 },
    { competition_id: 17, stage_name: '区域赛', start_month: 5, end_month: 7, description: '华东/华北/华南等分区赛', sort_order: 2 },
    { competition_id: 17, stage_name: '全国总决赛', start_month: 8, end_month: 9, description: '全国现场演示决赛', sort_order: 3 },
    // 18. 全国大学生电子设计竞赛 (reg: 5-8)
    { competition_id: 18, stage_name: '赛前培训', start_month: 5, end_month: 7, description: '各校组织赛前集训', sort_order: 1 },
    { competition_id: 18, stage_name: '全国统一竞赛', start_month: 8, end_month: 8, description: '连续4天3夜设计制作', sort_order: 2 },
    { competition_id: 18, stage_name: '综测与评审', start_month: 9, end_month: 10, description: '全国统一测评与评审', sort_order: 3 },
    // 19. 全国大学生智能汽车竞赛 (reg: 1-7)
    { competition_id: 19, stage_name: '备赛与调试', start_month: 1, end_month: 4, description: '智能车设计制作与调试', sort_order: 1 },
    { competition_id: 19, stage_name: '区域赛', start_month: 5, end_month: 7, description: '华东/华北/华南等分区赛', sort_order: 2 },
    { competition_id: 19, stage_name: '全国总决赛', start_month: 7, end_month: 8, description: '全国现场竞速决赛', sort_order: 3 },
    // 20. 全国大学生嵌入式芯片与系统设计竞赛 (reg: 3-8)
    { competition_id: 20, stage_name: '初赛', start_month: 3, end_month: 5, description: '线上提交方案初审', sort_order: 1 },
    { competition_id: 20, stage_name: '区域赛', start_month: 5, end_month: 7, description: '分区域现场评审', sort_order: 2 },
    { competition_id: 20, stage_name: '全国总决赛', start_month: 8, end_month: 9, description: '全国现场演示与答辩', sort_order: 3 },
];
export function seedCompetitionStages(db: DatabaseWrapper): void {
    const insert = db.prepare(`
    INSERT INTO competition_stages (competition_id, stage_name, start_month, end_month, description, sort_order)
    VALUES (@competition_id, @stage_name, @start_month, @end_month, @description, @sort_order)
  `);
    const insertMany = db.transaction((items) => {
        for (const item of items) {
            insert.run(item);
        }
    });
    insertMany(stages);
}