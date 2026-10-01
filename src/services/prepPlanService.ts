/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/prepPlanService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
interface PrepPhase {
    name: string;
    duration_days: number;
    start_offset: number;
    tasks: string[];
}

const templates = {
    '计算机类': { phases: [
            { name: '基础学习', ratio: 0.3, tasks: ['学习编程语言基础', '掌握数据结构与算法', '阅读相关教材'] },
            { name: '专项训练', ratio: 0.4, tasks: ['刷题练习', '参加模拟赛', '学习竞赛常用技巧'] },
            { name: '冲刺准备', ratio: 0.3, tasks: ['历年真题练习', '团队配合训练', '查漏补缺'] },
        ] },
    '综合类': { phases: [
            { name: '选题调研', ratio: 0.25, tasks: ['确定项目方向', '市场调研分析', '组建团队'] },
            { name: '方案设计', ratio: 0.35, tasks: ['撰写商业计划书', '制作项目原型', '准备展示材料'] },
            { name: '打磨完善', ratio: 0.4, tasks: ['完善项目细节', '模拟路演答辩', '准备评委可能提问'] },
        ] },
    '电子信息类': { phases: [
            { name: '理论学习', ratio: 0.25, tasks: ['学习电路设计基础', '掌握相关软件工具', '阅读技术文档'] },
            { name: '设计制作', ratio: 0.45, tasks: ['电路设计与仿真', '硬件制作与调试', '软件编程与测试'] },
            { name: '测试优化', ratio: 0.3, tasks: ['系统联调测试', '性能优化', '撰写技术报告'] },
        ] },
    default: { phases: [
            { name: '基础准备', ratio: 0.3, tasks: ['了解竞赛规则和要求', '学习相关基础知识', '收集参考资料'] },
            { name: '核心训练', ratio: 0.4, tasks: ['针对性练习', '团队协作训练', '模拟竞赛环境'] },
            { name: '冲刺阶段', ratio: 0.3, tasks: ['查漏补缺', '模拟实战', '调整状态'] },
        ] },
};
export class PrepPlanService {
    generatePlan(competitionId: number): { competition_name: any; total_days: number; phases: PrepPhase[]; } {
        const db = getDb();
        const comp = db.prepare('SELECT name, category, reg_end_month FROM competitions WHERE id = @competitionId').get({ competitionId });
        if (!comp)
            throw new Error('竞赛不存在');
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        let endMonth = comp.reg_end_month || currentMonth + 3;
        let totalDays = Math.max(30, (endMonth >= currentMonth ? endMonth - currentMonth : endMonth + 12 - currentMonth) * 30);
        const template = templates[comp.category] || templates['default'];
        let offset = 0;
        const phases = template.phases.map(p => {
            const days = Math.round(totalDays * p.ratio);
            const phase = { name: p.name, duration_days: days, start_offset: offset, tasks: p.tasks };
            offset += days;
            return phase;
        });
        // 调整最后一个阶段确保总天数一致
        const sum = phases.reduce((s, p) => s + p.duration_days, 0);
        if (sum !== totalDays && phases.length > 0) {
            phases[phases.length - 1].duration_days += totalDays - sum;
        }
        return { competition_name: comp.name, total_days: totalDays, phases };
    }
}
export const prepPlanService: PrepPlanService = new PrepPlanService();