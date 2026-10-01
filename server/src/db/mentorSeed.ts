/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/mentorSeed.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { DatabaseWrapper } from './database';

export function seedMentorData(db: DatabaseWrapper): void {
    // 检查是否已有数据
    const existing = db.prepare('SELECT COUNT(*) as count FROM mentors').get();
    if (existing.count > 0)
        return;
    // 首先确保有一些用户可以作为导师
    // 获取现有用户
    const users = db.prepare('SELECT id, username FROM users LIMIT 5').all();
    if (users.length === 0) {
        console.log('没有用户，跳过导师数据初始化');
        return;
    }
    const insertMentor = db.prepare(`
    INSERT INTO mentors (user_id, competition_ids, skills, introduction, achievements, available_time, max_mentees, is_active)
    VALUES (@user_id, @competition_ids, @skills, @introduction, @achievements, @available_time, @max_mentees, @is_active)
  `);
    // 为前几个用户创建导师资料
    const mentorData = [
        {
            competition_ids: JSON.stringify([4]),
            skills: JSON.stringify(['数学建模', '算法设计', '数据分析']),
            introduction: '曾获全国大学生数学建模竞赛一等奖，有丰富的建模经验，擅长优化问题和统计分析。',
            achievements: '国赛一等奖,美赛M奖,省赛特等奖',
            available_time: '周末全天，工作日晚上',
            max_mentees: 5,
            is_active: 1
        },
        {
            competition_ids: JSON.stringify([9]),
            skills: JSON.stringify(['ACM算法', '数据结构', '竞赛编程']),
            introduction: 'ACM-ICPC区域赛金牌选手，熟悉各类算法和数据结构，可以帮助提升编程能力。',
            achievements: 'ICPC区域赛金牌,CCPC银牌,蓝桥杯一等奖',
            available_time: '周末下午，工作日晚上8点后',
            max_mentees: 3,
            is_active: 1
        },
        {
            competition_ids: JSON.stringify([10]),
            skills: JSON.stringify(['信息安全', 'CTF', '渗透测试']),
            introduction: '信息安全竞赛老手，擅长Web安全和逆向工程，可以指导CTF入门和进阶。',
            achievements: '全国信息安全竞赛二等奖,多次CTF比赛前十',
            available_time: '周末全天',
            max_mentees: 4,
            is_active: 1
        },
        {
            competition_ids: JSON.stringify([1, 2, 3]),
            skills: JSON.stringify(['创新创业', '商业计划', '项目管理']),
            introduction: '互联网+大赛金奖获得者，有创业经历，可以帮助完善商业计划书和路演准备。',
            achievements: '互联网+金奖,挑战杯一等奖,创业项目获投资',
            available_time: '需要预约',
            max_mentees: 6,
            is_active: 1
        },
        {
            competition_ids: JSON.stringify([8]),
            skills: JSON.stringify(['软件开发', 'UI设计', '产品设计']),
            introduction: '计算机设计大赛一等奖，擅长全栈开发和用户体验设计，可以指导项目开发。',
            achievements: '计算机设计大赛一等奖,软件杯二等奖',
            available_time: '周末上午，工作日晚上',
            max_mentees: 4,
            is_active: 1
        }
    ];
    users.forEach((user, index) => {
        if (index < mentorData.length) {
            insertMentor.run({
                user_id: user.id,
                ...mentorData[index]
            });
        }
    });
    console.log('导师数据初始化完成');
}