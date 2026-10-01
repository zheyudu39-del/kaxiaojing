/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/collegeSeed.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { DatabaseWrapper } from './database';
interface MajorSeed {
    collegeName: string;
    majorName: string;
}

export const colleges = [
    '马克思主义学院',
    '法政学院',
    '教育科学学院',
    '人文学院',
    '外国语学院',
    '数学与统计学院',
    '物理与电气工程学院',
    '化学与环境科学学院',
    '生命与地理科学学院',
    '计算机科学与技术学院',
    '土木工程学院',
    '经济与管理学院',
    '音乐与舞蹈学院',
    '体育学院',
    '美术与设计学院',
    '医学院',
    '国学院',
    '旅游学院',
    '交通学院',
    '建筑学院',
    '现代农学院',
    '设计学院',
    '继续教育学院',
    '新闻传播学院',
];
export const majors = [
    // 马克思主义学院
    { collegeName: '马克思主义学院', majorName: '思想政治教育' },
    // 法政学院
    { collegeName: '法政学院', majorName: '法学' },
    { collegeName: '法政学院', majorName: '社会工作' },
    // 教育科学学院
    { collegeName: '教育科学学院', majorName: '教育学' },
    { collegeName: '教育科学学院', majorName: '学前教育' },
    { collegeName: '教育科学学院', majorName: '小学教育' },
    { collegeName: '教育科学学院', majorName: '心理学' },
    // 人文学院
    { collegeName: '人文学院', majorName: '汉语言文学' },
    { collegeName: '人文学院', majorName: '汉语言' },
    { collegeName: '人文学院', majorName: '汉语国际教育' },
    { collegeName: '人文学院', majorName: '中国少数民族语言文学' },
    { collegeName: '人文学院', majorName: '历史学' },
    // 外国语学院
    { collegeName: '外国语学院', majorName: '英语' },
    { collegeName: '外国语学院', majorName: '俄语' },
    { collegeName: '外国语学院', majorName: '翻译' },
    // 数学与统计学院
    { collegeName: '数学与统计学院', majorName: '数学与应用数学' },
    { collegeName: '数学与统计学院', majorName: '信息与计算科学' },
    { collegeName: '数学与统计学院', majorName: '统计学' },
    { collegeName: '数学与统计学院', majorName: '应用统计学' },
    { collegeName: '数学与统计学院', majorName: '金融数学' },
    // 物理与电气工程学院
    { collegeName: '物理与电气工程学院', majorName: '物理学' },
    { collegeName: '物理与电气工程学院', majorName: '应用物理学' },
    { collegeName: '物理与电气工程学院', majorName: '电气工程及其自动化' },
    { collegeName: '物理与电气工程学院', majorName: '电子信息科学与技术' },
    { collegeName: '物理与电气工程学院', majorName: '通信工程' },
    // 化学与环境科学学院
    { collegeName: '化学与环境科学学院', majorName: '化学' },
    { collegeName: '化学与环境科学学院', majorName: '应用化学' },
    { collegeName: '化学与环境科学学院', majorName: '环境科学与工程' },
    { collegeName: '化学与环境科学学院', majorName: '环境科学' },
    // 生命与地理科学学院
    { collegeName: '生命与地理科学学院', majorName: '生物科学' },
    { collegeName: '生命与地理科学学院', majorName: '生物技术' },
    { collegeName: '生命与地理科学学院', majorName: '地理科学' },
    { collegeName: '生命与地理科学学院', majorName: '食品科学与工程' },
    { collegeName: '生命与地理科学学院', majorName: '食品质量与安全' },
    // 计算机科学与技术学院
    { collegeName: '计算机科学与技术学院', majorName: '计算机科学与技术' },
    { collegeName: '计算机科学与技术学院', majorName: '网络工程' },
    { collegeName: '计算机科学与技术学院', majorName: '数字媒体技术' },
    { collegeName: '计算机科学与技术学院', majorName: '数据科学与大数据技术' },
    // 土木工程学院
    { collegeName: '土木工程学院', majorName: '土木工程' },
    { collegeName: '土木工程学院', majorName: '给排水科学与工程' },
    // 经济与管理学院
    { collegeName: '经济与管理学院', majorName: '经济统计学' },
    { collegeName: '经济与管理学院', majorName: '国际经济与贸易' },
    { collegeName: '经济与管理学院', majorName: '财务管理' },
    { collegeName: '经济与管理学院', majorName: '跨境电子商务' },
    // 音乐与舞蹈学院
    { collegeName: '音乐与舞蹈学院', majorName: '音乐学' },
    { collegeName: '音乐与舞蹈学院', majorName: '舞蹈表演' },
    // 体育学院
    { collegeName: '体育学院', majorName: '体育教育' },
    { collegeName: '体育学院', majorName: '社会体育指导与管理' },
    { collegeName: '体育学院', majorName: '足球运动' },
    // 美术与设计学院
    { collegeName: '美术与设计学院', majorName: '美术学' },
    { collegeName: '美术与设计学院', majorName: '艺术设计学' },
    // 医学院
    { collegeName: '医学院', majorName: '预防医学' },
    { collegeName: '医学院', majorName: '护理学' },
    { collegeName: '医学院', majorName: '卫生检验与检疫' },
    // 国学院 - 无具体专业，跳过
    // 旅游学院
    { collegeName: '旅游学院', majorName: '旅游管理' },
    { collegeName: '旅游学院', majorName: '酒店管理' },
    // 交通学院
    { collegeName: '交通学院', majorName: '交通工程' },
    { collegeName: '交通学院', majorName: '物流工程' },
    { collegeName: '交通学院', majorName: '道路桥梁与渡河工程' },
    // 建筑学院
    { collegeName: '建筑学院', majorName: '建筑学' },
    { collegeName: '建筑学院', majorName: '城乡规划' },
    // 现代农学院
    { collegeName: '现代农学院', majorName: '设施农业科学与工程' },
    { collegeName: '现代农学院', majorName: '园艺' },
    // 设计学院
    { collegeName: '设计学院', majorName: '环境设计' },
    // 继续教育学院 - 无具体专业，跳过
    // 新闻传播学院
    { collegeName: '新闻传播学院', majorName: '广播电视学' },
    { collegeName: '新闻传播学院', majorName: '广告学' },
];
export function seedColleges(db: DatabaseWrapper): void {
    // Insert colleges
    const insertCollege = db.prepare('INSERT INTO colleges (name) VALUES (@name)');
    const insertManyColleges = db.transaction((items) => {
        for (const name of items) {
            insertCollege.run({ name });
        }
    });
    insertManyColleges(colleges);
    // Build a lookup map: college name -> college id
    const collegeRows = db.prepare('SELECT id, name FROM colleges').all();
    const collegeIdMap = new Map();
    for (const row of collegeRows) {
        collegeIdMap.set(row.name, row.id);
    }
    // Insert majors
    const insertMajor = db.prepare('INSERT INTO majors (name, college_id) VALUES (@name, @college_id)');
    const insertManyMajors = db.transaction((items) => {
        for (const item of items) {
            const collegeId = collegeIdMap.get(item.collegeName);
            if (collegeId !== undefined) {
                insertMajor.run({ name: item.majorName, college_id: collegeId });
            }
        }
    });
    insertManyMajors(majors);
    // --- Competition-College and Competition-Major mappings ---
    // Category-to-college mapping
    const categoryCollegeMap = {
        '计算机类': ['计算机科学与技术学院'],
        '电子信息类': ['物理与电气工程学院', '计算机科学与技术学院'],
        '其他工学类': ['土木工程学院', '交通学院', '建筑学院', '化学与环境科学学院'],
        '理学类': ['数学与统计学院', '物理与电气工程学院', '化学与环境科学学院', '生命与地理科学学院'],
        '经管类': ['经济与管理学院'],
        '艺术类': ['美术与设计学院', '设计学院', '音乐与舞蹈学院'],
        '语言类': ['外国语学院', '人文学院'],
        '医学类': ['医学院'],
        '机器人类': ['计算机科学与技术学院', '物理与电气工程学院'],
        '职业技能类': ['土木工程学院', '建筑学院', '交通学院'],
        '农学类': ['现代农学院', '生命与地理科学学院'],
    };
    // Query all competitions grouped by category
    const competitionRows = db.prepare('SELECT id, category FROM competitions').all();
    const collegeCompetitionRecords = [];
    const allCollegeIds = Array.from(collegeIdMap.values());
    for (const comp of competitionRows) {
        if (comp.category === '综合类') {
            // 综合类 links to ALL colleges
            for (const cId of allCollegeIds) {
                collegeCompetitionRecords.push({ college_id: cId, competition_id: comp.id });
            }
        }
        else {
            const linkedColleges = categoryCollegeMap[comp.category];
            if (linkedColleges) {
                for (const collegeName of linkedColleges) {
                    const cId = collegeIdMap.get(collegeName);
                    if (cId !== undefined) {
                        collegeCompetitionRecords.push({ college_id: cId, competition_id: comp.id });
                    }
                }
            }
        }
    }
    // Insert college_competitions
    const insertCollegeComp = db.prepare('INSERT INTO college_competitions (college_id, competition_id) VALUES (@college_id, @competition_id)');
    const insertManyCollegeComps = db.transaction((items) => {
        for (const item of items) {
            insertCollegeComp.run(item);
        }
    });
    insertManyCollegeComps(collegeCompetitionRecords);
    // Build major_competitions records
    // Query all majors with their college_id
    const majorRows = db.prepare('SELECT id, college_id FROM majors').all();
    // Group majors by college_id
    const majorsByCollege = new Map();
    for (const m of majorRows) {
        const list = majorsByCollege.get(m.college_id) || [];
        list.push(m.id);
        majorsByCollege.set(m.college_id, list);
    }
    const majorCompetitionRecords = [];
    // For each college-competition link, create major-competition links for all majors in that college
    for (const cc of collegeCompetitionRecords) {
        const collegeMajors = majorsByCollege.get(cc.college_id);
        if (collegeMajors) {
            for (const majorId of collegeMajors) {
                majorCompetitionRecords.push({ major_id: majorId, competition_id: cc.competition_id });
            }
        }
    }
    // Insert major_competitions
    const insertMajorComp = db.prepare('INSERT INTO major_competitions (major_id, competition_id) VALUES (@major_id, @competition_id)');
    const insertManyMajorComps = db.transaction((items) => {
        for (const item of items) {
            insertMajorComp.run(item);
        }
    });
    insertManyMajorComps(majorCompetitionRecords);
}