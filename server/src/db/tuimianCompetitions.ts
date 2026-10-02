/**
 * 推免认定学科竞赛（补充数据）
 * ============================
 *
 * 数据来源：《喀什大学 2027 届推免认定学科竞赛项目目录》（教务处，85 项，全部为「国赛」）
 * 文件：喀什大学_2027_届推免认定学科竞赛项目目录0830.xls
 *
 * 说明
 * ----
 * 1. 该目录**只有竞赛清单**（序号 / 竞赛名称 / 认定部门 / 备注），**没有专业维度**。
 *    因此「专业 → 竞赛」的推荐关系由 category 经 `categoryCollegeMap`
 *    （见 collegeSeed.ts）映射到学院、再覆盖该学院全部专业，与现有机制一致。
 *
 * 2. 本文件只收录项目原竞赛库中**没有**的竞赛（51 项）。
 *    目录中「“挑战杯 ”中国大学生创业计划大赛」与库中已有
 *    「"挑战杯"中国大学生创业计划竞赛」为同一赛事（名称写法不同），故不重复添加。
 *
 * 3. 目录未提供报名时间、参赛要求、官网等字段，故：
 *    - `reg_start_month: 0` 表示「报名时间待公布」。
 *      （前端 `common.tsx` / `CompetitionDetail.tsx` 对 falsy 值渲染为「待公布」；
 *       日历页按 `reg_start_month === 1..12` 过滤，0 不会落入任何月份，符合预期。）
 *    - `reg_end_month: null`、`requirements: ''`、`official_website` 缺省。
 *
 * 4. `description` 中附上目录里的「认定部门」（校内归口管理部门），便于学生咨询。
 */

export interface TuimianCompetition {
  name: string;
  category: string;
  description: string;
  target_audience: string;
  fee: string;
  format: 'individual' | 'team';
  reg_start_month: number;
  reg_end_month: number | null;
  requirements: string;
}

/** 校内认定部门（目录中「认定部门」列的原值） */
const DEPT_EMPLOYMENT = '就业指导中心';
const DEPT_YOUTH = '校团委';
const DEPT_ACADEMIC = '教务处';

/** 生成「一句话简介 + 认定部门」的描述 */
function desc(text: string, dept: string): string {
  return `${text}（校内认定部门：${dept}）`;
}

const UNDERGRAD = '全日制本科生';

export const tuimianCompetitions: TuimianCompetition[] = [
  // ==================== 综合类（6） ====================
  {
    name: '全国大学生职业规划大赛',
    category: '综合类',
    description: desc('面向大学生的职业生涯规划类赛事，考察职业目标设定与规划可行性', DEPT_EMPLOYMENT),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '“创青春”全国大学生创业大赛',
    category: '综合类',
    description: desc('共青团系统主办的全国性大学生创业赛事，与“挑战杯”创业计划竞赛相衔接', DEPT_YOUTH),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: 'iCAN大学生创新创业大赛',
    category: '综合类',
    description: desc('以创新创业项目为载体的全国性大学生赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '“田家炳杯”全国师范生教学技能竞赛',
    category: '综合类',
    description: desc('面向师范生的教学技能竞赛，考察教学设计、课堂讲授等师范基本功', DEPT_ACADEMIC),
    target_audience: '师范类专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '高校大学生模拟法庭大赛',
    category: '综合类',
    description: desc('法学类专业赛事，通过模拟庭审考察法律实务能力', DEPT_ACADEMIC),
    target_audience: '法学等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '中国社会工作大学生论坛',
    category: '综合类',
    description: desc('社会工作专业领域的全国性大学生学术论坛', DEPT_ACADEMIC),
    target_audience: '社会工作等相关专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 计算机类（3） ====================
  {
    name: '蓝桥杯全国软件和信息技术专业人才大赛',
    category: '计算机类',
    description: desc('面向软件与信息技术人才的程序设计类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国大学生数字媒体科技作品及创意竞赛',
    category: '计算机类',
    description: desc('数字媒体技术与创意作品类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国大学生信息安全与对抗技术竞赛',
    category: '计算机类',
    description: desc('信息安全攻防对抗类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 电子信息类（2） ====================
  {
    name: '“大唐杯”全国大学生新一代信息通信技术大赛',
    category: '电子信息类',
    description: desc('面向新一代信息通信技术的全国性赛事', DEPT_ACADEMIC),
    target_audience: '通信、电子信息等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '华为ICT大赛',
    category: '电子信息类',
    description: desc('华为主办的ICT领域技术赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 机器人类（1） ====================
  {
    name: '中国机器人及人工智能大赛',
    category: '机器人类',
    description: desc('机器人技术与人工智能应用类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 其他工学类（8） ====================
  {
    name: '“西门子杯”中国智能制造挑战赛',
    category: '其他工学类',
    description: desc('面向智能制造方向的工程类赛事', DEPT_ACADEMIC),
    target_audience: '自动化、机械、电气等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '大学生土地国情调查大赛',
    category: '其他工学类',
    description: desc('围绕土地资源与国情调查的实践类赛事', DEPT_ACADEMIC),
    target_audience: '测绘、地理、土地资源等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国大学生花园设计建造竞赛',
    category: '其他工学类',
    description: desc('风景园林与花园设计建造类赛事', DEPT_ACADEMIC),
    target_audience: '风景园林、园林、建筑等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国高校BIM毕业设计创新大赛',
    category: '其他工学类',
    description: desc('基于BIM技术的建筑类毕业设计赛事', DEPT_ACADEMIC),
    target_audience: '土木、建筑、工程管理等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国三维数字化创新设计大赛',
    category: '其他工学类',
    description: desc('三维数字化设计与创新类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国数字建筑创新应用大赛',
    category: '其他工学类',
    description: desc('数字建筑与建筑信息化应用类赛事', DEPT_ACADEMIC),
    target_audience: '土木、建筑、工程管理等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '中国大学生工程实践与创新能力大赛',
    category: '其他工学类',
    description: desc('面向工程实践与创新能力的综合性工科赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国高等院校大学生乡村规划方案竞赛',
    category: '其他工学类',
    description: desc('乡村规划方案设计类赛事', DEPT_ACADEMIC),
    target_audience: '城乡规划、建筑学等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 理学类（5） ====================
  {
    name: '大学生物理学术竞赛',
    category: '理学类',
    description: desc('以物理问题研究与辩论为形式的学术类赛事', DEPT_ACADEMIC),
    target_audience: '物理学等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国大学生化工实验大赛',
    category: '理学类',
    description: desc('化工实验操作与设计类赛事', DEPT_ACADEMIC),
    target_audience: '化学工程与工艺、化学等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国大学生化学实验创新设计大赛',
    category: '理学类',
    description: desc('化学实验创新与设计类赛事', DEPT_ACADEMIC),
    target_audience: '化学、应用化学等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国周培源大学生力学竞赛',
    category: '理学类',
    description: desc('以力学为基础的全国性学科竞赛', DEPT_ACADEMIC),
    target_audience: '力学、土木、机械等相关专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: 'MathorCup数学应用挑战赛',
    category: '理学类',
    description: desc('数学建模与应用类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 经管类（7） ====================
  {
    name: '“工行杯”全国大学生金融科技创新大赛',
    category: '经管类',
    description: desc('金融科技方向的全国性大学生赛事', DEPT_ACADEMIC),
    target_audience: '金融、经济、计算机等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '“科云杯”全国大学生财会职业能力大赛',
    category: '经管类',
    description: desc('财会职业能力类赛事', DEPT_ACADEMIC),
    target_audience: '会计、财务管理等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国本科院校税收风险管控案例大赛',
    category: '经管类',
    description: desc('税收风险管控案例分析类赛事', DEPT_ACADEMIC),
    target_audience: '财政、税收、会计等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国大学生能源经济学术创意大赛',
    category: '经管类',
    description: desc('能源经济领域的学术创意类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国高等院校数智化企业经营沙盘大赛',
    category: '经管类',
    description: desc('企业经营沙盘模拟类赛事', DEPT_ACADEMIC),
    target_audience: '经济管理类相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国旅游院校(本科)导游服务技能大赛',
    category: '经管类',
    description: desc('旅游管理方向的导游服务技能类赛事', DEPT_ACADEMIC),
    target_audience: '旅游管理等相关专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '中国大学生文商旅经营与策划虚拟仿真大赛',
    category: '经管类',
    description: desc('文商旅经营与策划方向的虚拟仿真类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 艺术类（8） ====================
  {
    name: '全国大学生艺术展演',
    category: '艺术类',
    description: desc('全国性大学生艺术展演活动', DEPT_YOUTH),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '东方创意之星设计大赛',
    category: '艺术类',
    description: desc('创意设计类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '两岸新锐设计竞赛·华灿奖',
    category: '艺术类',
    description: desc('面向两岸青年设计师的设计类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '米兰设计周--中国高校设计学科师生优秀作品展',
    category: '艺术类',
    description: desc('高校设计学科师生作品展示类赛事', DEPT_ACADEMIC),
    target_audience: '设计类相关专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '未来设计师·全国高校数字艺术设计大赛',
    category: '艺术类',
    description: desc('数字艺术设计类赛事', DEPT_ACADEMIC),
    target_audience: '设计类相关专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '第九届CHINA·中国陶瓷艺术设计大赛',
    category: '艺术类',
    description: desc('陶瓷艺术设计类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '“中华杯”中国第十九届优秀（交响）管乐团队展演',
    category: '艺术类',
    description: desc('管乐团队展演类艺术赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '第八届高天杯钢琴大赛',
    category: '艺术类',
    description: desc('钢琴演奏类艺术赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 语言类（5） ====================
  {
    name: '“21世纪杯”全国英语演讲比赛',
    category: '语言类',
    description: desc('全国性英语演讲类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '“外教社杯”全国高校学生跨文化能力大赛',
    category: '语言类',
    description: desc('考察跨文化交际能力的全国性外语赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国高校外语微课大赛',
    category: '语言类',
    description: desc('外语微课设计与制作类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '外研社全国大学生英语系列赛',
    category: '语言类',
    description: desc('含英语演讲、辩论、写作、阅读四项赛事的系列赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '中华经典诵写讲大赛',
    category: '语言类',
    description: desc('含讲解、书写、诵读、篆刻四项赛事的中华经典类赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 医学类（4） ====================
  {
    name: '全国大学生医学创新大赛暨“一带一路”国际竞赛',
    category: '医学类',
    description: desc('原全国大学生基础医学创新研究暨实验设计论坛，医学创新类赛事', DEPT_ACADEMIC),
    target_audience: '医学类相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '中国大学生医学技术技能大赛',
    category: '医学类',
    description: desc('医学技术技能类赛事', DEPT_ACADEMIC),
    target_audience: '医学类相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '中国医学生技术技能大赛',
    category: '医学类',
    description: desc('医学生临床与技术技能类赛事', DEPT_ACADEMIC),
    target_audience: '医学类相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
  {
    name: '全国高等医学院校大学生形态学读片和人体解剖标本辨识技能大赛',
    category: '医学类',
    description: desc('医学形态学读片与解剖标本辨识类技能赛事', DEPT_ACADEMIC),
    target_audience: '医学类相关专业全日制本科生',
    fee: '免费',
    format: 'individual',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 农学类（1） ====================
  {
    name: '国际大学生智能农业装备创新大赛',
    category: '农学类',
    description: desc('智能农业装备方向的创新类赛事', DEPT_ACADEMIC),
    target_audience: '农业工程、农学等相关专业全日制本科生',
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },

  // ==================== 职业技能类（1） ====================
  {
    name: '一带一路暨金砖国家技能发展与技术创新大赛',
    category: '职业技能类',
    description: desc('面向技能发展与技术创新的国际性赛事', DEPT_ACADEMIC),
    target_audience: UNDERGRAD,
    fee: '免费',
    format: 'team',
    reg_start_month: 0,
    reg_end_month: null,
    requirements: '',
  },
];

/** 目录中已存在于项目竞赛库、故未重复收录的竞赛（供核对用） */
export const tuimianAlreadyPresent: string[] = [
  '中国国际大学生创新大赛',
  '"挑战杯"全国大学生课外学术科技作品竞赛',
  '"挑战杯"中国大学生创业计划竞赛（目录中写作「“挑战杯 ”中国大学生创业计划大赛」）',
];

/**
 * 把推免竞赛写入 competitions 表（按名称判重，幂等）。
 *
 * 供 `initializeDatabase()` 在竞赛表为空时调用；须在 `seedColleges()` 之前执行，
 * 因为后者会依据 competitions 全量构建「学院/专业 → 竞赛」映射。
 *
 * @returns 实际插入的条数
 */
export function seedTuimianCompetitions(db: {
  prepare: (sql: string) => { all: () => any[]; run: (params: any) => any };
  transaction: <T>(fn: (items: T[]) => void) => (items: T[]) => void;
}): number {
  const existing = new Set<string>(
    (db.prepare('SELECT name FROM competitions').all() as any[]).map((r) => String(r.name)),
  );

  const stmt = db.prepare(`
    INSERT INTO competitions
      (name, category, description, target_audience, fee, format,
       reg_start_month, reg_end_month, requirements)
    VALUES
      (@name, @category, @description, @targetAudience, @fee, @format,
       @regStartMonth, @regEndMonth, @requirements)
  `);

  let inserted = 0;
  const insertMany = db.transaction<TuimianCompetition>((items) => {
    for (const c of items) {
      if (existing.has(c.name)) continue;
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
      inserted++;
    }
  });
  insertMany(tuimianCompetitions);
  return inserted;
}
