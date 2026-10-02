/* eslint-disable */
// 本文件由 tools/gen_college_seed.py 依据喀什大学官方数据自动生成，请勿手工编辑。
// 重新生成：python tools/gen_college_seed.py
//
// 数据源：
//   - 教学机构（学院）列表  https://www.ksu.edu.cn/zzjg/jx_ky_jfdw.htm
//   - 2026年普通本科招生专业与计划  https://xgb.ksu.edu.cn/info/1511/9361.htm
//   - 国家级一流本科专业  https://jwc.ksu.edu.cn/info/1151/2999.htm
//   - 自治区级一流本科专业  https://jwc.ksu.edu.cn/info/1151/2989.htm
// 生成时间：2026-10-02T18:36:46+08:00
// 共 25 个学院 / 75 个专业

import type { DatabaseWrapper } from './database';

interface MajorSeed {
    collegeName: string;
    majorName: string;
}

interface CollegeCompetitionRecord {
    college_id: number;
    competition_id: number;
}

interface MajorCompetitionRecord {
    major_id: number;
    competition_id: number;
}

export const colleges = [
    '化学与环境科学学院',
    '生命与地理科学学院',
    '人文学院',
    '计算机科学与技术学院',
    '交通学院',
    '医学院',
    '教育科学学院',
    '数学与统计学院',
    '经济与管理学院',
    '体育学院',
    '土木工程学院',
    '外国语学院',
    '物理与电气工程学院',
    '现代农学院',
    '电子与通信工程学院',
    '设计学院',
    '建筑学院',
    '新闻传播学院',
    '旅游学院',
    '法政学院',
    '音乐与舞蹈学院',
    '美术学院',
    '马克思主义学院',
    '国学院',
    '继续教育学院',
];

export const majors = [
    // 化学与环境科学学院
    { collegeName: '化学与环境科学学院', majorName: '化学' },
    { collegeName: '化学与环境科学学院', majorName: '应用化学' },
    { collegeName: '化学与环境科学学院', majorName: '环境科学与工程' },
    { collegeName: '化学与环境科学学院', majorName: '环境科学' },
    { collegeName: '化学与环境科学学院', majorName: '化学工程与工艺' },
    { collegeName: '化学与环境科学学院', majorName: '资源循环科学与工程' },
    // 生命与地理科学学院
    { collegeName: '生命与地理科学学院', majorName: '生物科学' },
    { collegeName: '生命与地理科学学院', majorName: '地理科学' },
    { collegeName: '生命与地理科学学院', majorName: '生物技术' },
    { collegeName: '生命与地理科学学院', majorName: '食品科学与工程' },
    { collegeName: '生命与地理科学学院', majorName: '食品质量与安全' },
    { collegeName: '生命与地理科学学院', majorName: '大气科学' },
    // 人文学院
    { collegeName: '人文学院', majorName: '汉语言文学' },
    { collegeName: '人文学院', majorName: '汉语国际教育' },
    { collegeName: '人文学院', majorName: '中国少数民族语言文学（维吾尔语言文学）' },
    { collegeName: '人文学院', majorName: '中国少数民族语言文学（维吾尔语言）' },
    { collegeName: '人文学院', majorName: '历史学' },
    // 计算机科学与技术学院
    { collegeName: '计算机科学与技术学院', majorName: '网络工程' },
    { collegeName: '计算机科学与技术学院', majorName: '计算机科学与技术' },
    { collegeName: '计算机科学与技术学院', majorName: '数字媒体技术' },
    { collegeName: '计算机科学与技术学院', majorName: '人工智能' },
    { collegeName: '计算机科学与技术学院', majorName: '数据科学与大数据技术' },
    // 交通学院
    { collegeName: '交通学院', majorName: '交通工程' },
    { collegeName: '交通学院', majorName: '物流工程' },
    { collegeName: '交通学院', majorName: '道路桥梁与渡河工程' },
    { collegeName: '交通学院', majorName: '交通运输' },
    // 医学院
    { collegeName: '医学院', majorName: '护理学' },
    { collegeName: '医学院', majorName: '预防医学' },
    { collegeName: '医学院', majorName: '卫生检验与检疫' },
    { collegeName: '医学院', majorName: '临床医学' },
    // 教育科学学院
    { collegeName: '教育科学学院', majorName: '教育学' },
    { collegeName: '教育科学学院', majorName: '学前教育' },
    { collegeName: '教育科学学院', majorName: '小学教育' },
    { collegeName: '教育科学学院', majorName: '心理学' },
    // 数学与统计学院
    { collegeName: '数学与统计学院', majorName: '数学与应用数学' },
    { collegeName: '数学与统计学院', majorName: '信息与计算科学' },
    { collegeName: '数学与统计学院', majorName: '应用统计学' },
    { collegeName: '数学与统计学院', majorName: '金融数学' },
    // 经济与管理学院
    { collegeName: '经济与管理学院', majorName: '经济统计学' },
    { collegeName: '经济与管理学院', majorName: '国际经济与贸易' },
    { collegeName: '经济与管理学院', majorName: '财务管理' },
    { collegeName: '经济与管理学院', majorName: '跨境电子商务' },
    // 体育学院
    { collegeName: '体育学院', majorName: '体育教育' },
    { collegeName: '体育学院', majorName: '体育教育（校园足球方向）' },
    { collegeName: '体育学院', majorName: '社会体育指导与管理' },
    // 土木工程学院
    { collegeName: '土木工程学院', majorName: '土木工程' },
    { collegeName: '土木工程学院', majorName: '给排水科学与工程' },
    { collegeName: '土木工程学院', majorName: '工程造价' },
    // 外国语学院
    { collegeName: '外国语学院', majorName: '英语' },
    { collegeName: '外国语学院', majorName: '俄语' },
    { collegeName: '外国语学院', majorName: '翻译' },
    // 物理与电气工程学院
    { collegeName: '物理与电气工程学院', majorName: '物理学' },
    { collegeName: '物理与电气工程学院', majorName: '电气工程及其自动化' },
    { collegeName: '物理与电气工程学院', majorName: '能源与动力工程' },
    // 现代农学院
    { collegeName: '现代农学院', majorName: '设施农业科学与工程' },
    { collegeName: '现代农学院', majorName: '园艺' },
    { collegeName: '现代农学院', majorName: '植物保护' },
    // 电子与通信工程学院
    { collegeName: '电子与通信工程学院', majorName: '电子信息科学与技术' },
    { collegeName: '电子与通信工程学院', majorName: '通信工程' },
    { collegeName: '电子与通信工程学院', majorName: '信息工程' },
    // 设计学院
    { collegeName: '设计学院', majorName: '艺术设计学' },
    { collegeName: '设计学院', majorName: '环境设计' },
    { collegeName: '设计学院', majorName: '产品设计' },
    // 建筑学院
    { collegeName: '建筑学院', majorName: '建筑学' },
    { collegeName: '建筑学院', majorName: '城乡规划' },
    // 新闻传播学院
    { collegeName: '新闻传播学院', majorName: '广播电视学' },
    { collegeName: '新闻传播学院', majorName: '广告学' },
    // 旅游学院
    { collegeName: '旅游学院', majorName: '酒店管理' },
    { collegeName: '旅游学院', majorName: '旅游管理' },
    // 法政学院
    { collegeName: '法政学院', majorName: '法学' },
    { collegeName: '法政学院', majorName: '社会工作' },
    // 音乐与舞蹈学院
    { collegeName: '音乐与舞蹈学院', majorName: '音乐学' },
    { collegeName: '音乐与舞蹈学院', majorName: '舞蹈表演' },
    // 美术学院
    { collegeName: '美术学院', majorName: '美术学' },
    // 马克思主义学院
    { collegeName: '马克思主义学院', majorName: '思想政治教育' },
];

export function seedColleges(db: DatabaseWrapper): void {
    // Insert colleges
    const insertCollege = db.prepare('INSERT INTO colleges (name) VALUES (@name)');
    const insertManyColleges = db.transaction<string>((items) => {
        for (const name of items) {
            insertCollege.run({ name });
        }
    });
    insertManyColleges(colleges);

    // Build a lookup map: college name -> college id
    const collegeRows = db.prepare('SELECT id, name FROM colleges').all();
    const collegeIdMap = new Map<string, number>();
    for (const row of collegeRows) {
        collegeIdMap.set(row.name, row.id);
    }

    // Insert majors
    const insertMajor = db.prepare('INSERT INTO majors (name, college_id) VALUES (@name, @college_id)');
    const insertManyMajors = db.transaction<MajorSeed>((items) => {
        for (const item of items) {
            const collegeId = collegeIdMap.get(item.collegeName);
            if (collegeId !== undefined) {
                insertMajor.run({ name: item.majorName, college_id: collegeId });
            }
        }
    });
    insertManyMajors(majors);

    // 学院/专业写入后，构建「学院-竞赛」「专业-竞赛」映射
    buildCompetitionMappings(db);
}

/**
 * 依据 competitions 表 + categoryCollegeMap 重建竞赛映射。
 * 会先清空 college_competitions / major_competitions 再全量重建，
 * 因此在新增竞赛之后调用即可让新竞赛自动挂到对应学院与专业。
 */
export function buildCompetitionMappings(db: DatabaseWrapper): void {
    const collegeRows = db.prepare('SELECT id, name FROM colleges').all();
    const collegeIdMap = new Map<string, number>();
    for (const row of collegeRows) {
        collegeIdMap.set(row.name, row.id);
    }

    // Category-to-college mapping
    const categoryCollegeMap: Record<string, string[]> = {
        '计算机类': ['计算机科学与技术学院'],
        '电子信息类': ['电子与通信工程学院', '物理与电气工程学院', '计算机科学与技术学院'],
        '其他工学类': ['土木工程学院', '交通学院', '建筑学院', '化学与环境科学学院', '电子与通信工程学院'],
        '理学类': ['数学与统计学院', '物理与电气工程学院', '化学与环境科学学院', '生命与地理科学学院'],
        '经管类': ['经济与管理学院'],
        '艺术类': ['美术学院', '设计学院', '音乐与舞蹈学院'],
        '语言类': ['外国语学院', '人文学院'],
        '医学类': ['医学院'],
        '机器人类': ['计算机科学与技术学院', '物理与电气工程学院', '电子与通信工程学院'],
        '职业技能类': ['土木工程学院', '建筑学院', '交通学院'],
        '农学类': ['现代农学院', '生命与地理科学学院'],
    };

    // 全量重建：先清空旧映射（注意外键顺序）
    db.exec('DELETE FROM major_competitions');
    db.exec('DELETE FROM college_competitions');

    // Query all competitions grouped by category
    const competitionRows = db.prepare('SELECT id, category FROM competitions').all();
    const collegeCompetitionRecords: CollegeCompetitionRecord[] = [];
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
    const insertManyCollegeComps = db.transaction<CollegeCompetitionRecord>((items) => {
        for (const item of items) {
            insertCollegeComp.run(item);
        }
    });
    insertManyCollegeComps(collegeCompetitionRecords);

    // Build major_competitions records
    const majorRows = db.prepare('SELECT id, college_id FROM majors').all();
    const majorsByCollege = new Map<number, number[]>();
    for (const m of majorRows) {
        const list = majorsByCollege.get(m.college_id) || [];
        list.push(m.id);
        majorsByCollege.set(m.college_id, list);
    }

    const majorCompetitionRecords: MajorCompetitionRecord[] = [];
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
    const insertManyMajorComps = db.transaction<MajorCompetitionRecord>((items) => {
        for (const item of items) {
            insertMajorComp.run(item);
        }
    });
    insertManyMajorComps(majorCompetitionRecords);
}

