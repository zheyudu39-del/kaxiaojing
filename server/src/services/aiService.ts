/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/services/aiService.ts

import { getDb } from '../db/database';

// ===== 类型定义（自 .d.ts 还原）=====
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
function buildCompetitionKnowledge() {
    const db = getDb();
    const competitions = db.prepare('SELECT id, name, category, description, target_audience, fee, format, reg_start_month, reg_end_month, requirements, official_website, past_papers_url FROM competitions ORDER BY category, id').all();
    const categories = db.prepare('SELECT DISTINCT category FROM competitions ORDER BY category').all();
    const stages = db.prepare('SELECT competition_id, stage_name, start_month, end_month, description, sort_order FROM competition_stages ORDER BY competition_id, sort_order').all();
    const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    let knowledge = `## 竞赛数据库（共${competitions.length}项竞赛，${categories.length}个类别）\n\n`;
    for (const cat of categories) {
        const catComps = competitions.filter(c => c.category === cat.category);
        knowledge += `### ${cat.category}（${catComps.length}项）\n`;
        for (const c of catComps) {
            // reg_start_month 为 0 表示「报名时间待公布」（推免目录未提供报名时间）
            const regPeriod = !c.reg_start_month
                ? '待公布'
                : c.reg_end_month
                    ? `${monthNames[c.reg_start_month]}-${monthNames[c.reg_end_month]}`
                    : `${monthNames[c.reg_start_month]}`;
            knowledge += `- **${c.name}**（ID:${c.id}）：${c.description}。参赛对象：${c.target_audience}。形式：${c.format === 'team' ? '团队赛' : '个人赛'}。报名时间：${regPeriod}。费用：${c.fee}。\n`;
            if (c.requirements) {
                knowledge += `  参赛要求：${c.requirements.replace(/\n/g, '；')}\n`;
            }
            if (c.official_website)
                knowledge += `  官网：${c.official_website}\n`;
            if (c.past_papers_url)
                knowledge += `  历年真题/作品：${c.past_papers_url}\n`;
            // 竞赛阶段
            const compStages = stages.filter((s) => s.competition_id === c.id);
            if (compStages.length > 0) {
                knowledge += `  赛程阶段：${compStages.map((s) => `${s.stage_name}(${monthNames[s.start_month]}-${monthNames[s.end_month]}:${s.description})`).join(' → ')}\n`;
            }
        }
        knowledge += '\n';
    }
    return knowledge;
}
function buildCertificateKnowledge() {
    const db = getDb();
    const certs = db.prepare('SELECT name, category, description, fee, reg_time, exam_time, official_website, difficulty, target_audience FROM certificates ORDER BY category, id').all();
    const certCategories = db.prepare('SELECT DISTINCT category FROM certificates ORDER BY category').all();
    let knowledge = `## 证书考取数据库（共${certs.length}项证书，${certCategories.length}个类别）\n\n`;
    for (const cat of certCategories) {
        const catCerts = certs.filter(c => c.category === cat.category);
        knowledge += `### ${cat.category}（${catCerts.length}项）\n`;
        for (const c of catCerts) {
            knowledge += `- **${c.name}**：${c.description}。难度：${c.difficulty}。费用：${c.fee}。报名时间：${c.reg_time}。考试时间：${c.exam_time}。适合人群：${c.target_audience}。`;
            if (c.official_website)
                knowledge += `官网：${c.official_website}`;
            knowledge += '\n';
        }
        knowledge += '\n';
    }
    return knowledge;
}
function buildCollegeMajorMappings() {
    const db = getDb();
    const colleges = db.prepare('SELECT id, name FROM colleges ORDER BY id').all();
    const majors = db.prepare('SELECT id, name, college_id FROM majors ORDER BY college_id, id').all();
    const collegeComps = db.prepare(`
    SELECT cc.college_id, c.name as comp_name FROM college_competitions cc
    JOIN competitions c ON cc.competition_id = c.id ORDER BY cc.college_id
  `).all();
    const majorComps = db.prepare(`
    SELECT mc.major_id, c.name as comp_name FROM major_competitions mc
    JOIN competitions c ON mc.competition_id = c.id ORDER BY mc.major_id
  `).all();
    let knowledge = `## 喀什大学学院-专业-竞赛推荐映射（共${colleges.length}个学院）\n\n`;
    for (const col of colleges) {
        const colMajors = majors.filter((m) => m.college_id === col.id);
        const colComps = collegeComps.filter((cc) => cc.college_id === col.id).map((cc) => cc.comp_name);
        knowledge += `### ${col.name}\n`;
        if (colComps.length > 0)
            knowledge += `  学院推荐竞赛：${colComps.join('、')}\n`;
        for (const m of colMajors) {
            const mComps = majorComps.filter((mc) => mc.major_id === m.id).map((mc) => mc.comp_name);
            if (mComps.length > 0) {
                knowledge += `  - ${m.name}：${mComps.join('、')}\n`;
            }
            else {
                knowledge += `  - ${m.name}\n`;
            }
        }
        knowledge += '\n';
    }
    return knowledge;
}
function buildSystemPrompt(userProfile) {
    const competitionKnowledge = buildCompetitionKnowledge();
    const certificateKnowledge = buildCertificateKnowledge();
    const collegeMappings = buildCollegeMajorMappings();
    const currentMonth = new Date().getMonth() + 1;
    const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    let systemPrompt = `你是"喀小竞"，喀什大学竞赛交流系统的AI智能助手。你专注于帮助大学生了解各类学科竞赛和证书考取、推荐适合的竞赛和证书、制定备赛/备考计划。

## 你的身份与性格
- 你是一个热情、专业、耐心的竞赛与考证顾问
- 你熟悉中国大学生各类学科竞赛的规则、流程和备赛方法
- 你熟悉各类职业资格证书、IT认证、语言考试的报考流程和备考方法
- 你了解喀什大学24个学院的专业设置和对应的竞赛推荐
- 你说话亲切友好，像一个经验丰富的学长/学姐
- 你会用emoji让对话更生动 🎯🏆📚📝
- 当前时间：${monthNames[currentMonth]}

## 你的核心能力
1. **竞赛咨询**：回答关于各类竞赛的规则、报名时间、参赛要求、赛程阶段等问题
2. **证书咨询**：回答关于各类证书考试的报名时间、考试时间、费用、难度等问题
3. **个性化推荐**：根据用户的学院、专业、兴趣、技能水平推荐适合的竞赛和证书
4. **备赛规划**：为用户制定详细的竞赛备赛计划，包括时间安排、学习资源、技能提升路径
5. **备考规划**：为用户制定证书备考计划，包括学习阶段、重点知识、刷题策略
6. **经验分享**：分享竞赛技巧、注意事项和常见问题解答
7. **团队建议**：对于团队赛，提供组队建议和团队协作技巧
8. **学院匹配**：根据喀什大学各学院专业特点推荐最相关的竞赛

## 推荐竞赛时的原则
- 优先推荐当前月份或即将开始报名的竞赛
- 根据用户所在学院和专业匹配相关类别的竞赛（参考学院-专业-竞赛映射表）
- 考虑竞赛难度和用户经验水平
- 团队赛和个人赛都要考虑
- 给出推荐理由
- 提供竞赛的赛程阶段信息帮助用户规划时间

## 推荐证书时的原则
- 根据用户专业推荐最相关的证书
- 考虑证书难度和用户当前水平
- 优先推荐性价比高、认可度广的证书
- 说明证书对就业/升学的帮助
- 提供合理的考证时间规划

## 制定备赛计划时的原则
- 根据竞赛报名时间和赛程阶段倒推备赛时间线
- 分阶段规划：基础学习→专项训练→模拟实战→赛前冲刺
- 推荐具体的学习资源和练习方法
- 考虑用户的课业负担，合理安排时间
- 设置阶段性目标和检查点

## 备赛攻略通用模板
### 数学建模类竞赛备赛攻略
- 基础阶段（2-3个月）：学习MATLAB/Python编程、概率统计、线性代数复习
- 论文写作：学习LaTeX排版，阅读优秀论文模板
- 模型学习：掌握常用模型（线性规划、回归分析、层次分析法、灰色预测、神经网络等）
- 实战训练：做历年真题，每周一次模拟训练
- 团队配合：明确分工（建模手、编程手、论文手），磨合协作

### 程序设计类竞赛备赛攻略
- 基础阶段：掌握C++/Java/Python，学习数据结构与算法
- 刷题平台：LeetCode、洛谷、Codeforces、牛客网
- 重点算法：动态规划、图论、搜索、贪心、数论、字符串
- 每日训练：至少2-3道题，参加周赛/月赛
- 团队训练（ACM）：3人配合，练习读题分工和代码审查

### 电子设计类竞赛备赛攻略
- 基础阶段：学习模拟电路、数字电路、单片机编程
- 工具掌握：Altium Designer/KiCad画PCB、示波器/万用表使用
- 模块练习：电源设计、信号处理、传感器应用、无线通信
- 实战训练：复现历年赛题，限时完成

### 创新创业类竞赛备赛攻略
- 选题：关注社会热点、技术前沿，结合专业特长
- 商业计划书：市场分析、商业模式、财务预测、团队介绍
- PPT制作：简洁美观，突出亮点，控制在15页以内
- 路演训练：反复练习演讲，准备常见问题回答
- 项目落地：有实际产品/原型会大大加分

## 回答规范
- 回答要准确，基于竞赛和证书数据库中的真实信息
- 如果用户问的竞赛或证书不在数据库中，诚实说明并尽量提供你知道的信息
- 不要编造不存在的竞赛或虚假信息
- 回答要有条理，适当使用列表和分段
- 对于不确定的信息，要明确标注
- 当用户提到学院或专业时，参考学院-专业-竞赛映射表给出精准推荐

${competitionKnowledge}
${certificateKnowledge}
${collegeMappings}`;
    if (userProfile) {
        systemPrompt += `\n## 当前用户信息\n`;
        systemPrompt += `- 用户名：${userProfile.username}\n`;
        if (userProfile.college)
            systemPrompt += `- 学院：${userProfile.college}\n`;
        if (userProfile.major)
            systemPrompt += `- 专业：${userProfile.major}\n`;
        if (userProfile.bio)
            systemPrompt += `- 个人简介：${userProfile.bio}\n`;
        if (userProfile.skills && userProfile.skills.length > 0) {
            systemPrompt += `- 技能：${userProfile.skills.join('、')}\n`;
        }
        if (userProfile.registrations && userProfile.registrations.length > 0) {
            systemPrompt += `- 已报名竞赛：${userProfile.registrations.join('、')}\n`;
        }
        if (userProfile.awards && userProfile.awards.length > 0) {
            systemPrompt += `- 获奖记录：${userProfile.awards.join('、')}\n`;
        }
        if (userProfile.certPlans && userProfile.certPlans.length > 0) {
            systemPrompt += `- 正在备考的证书：${userProfile.certPlans.join('、')}\n`;
        }
        systemPrompt += `\n请根据该用户的背景信息进行个性化回答和推荐。\n`;
    }
    return systemPrompt;
}
function getUserProfile(userId) {
    try {
        const db = getDb();
        const user = db.prepare('SELECT username, college, major, bio FROM users WHERE id = @id').get({ id: userId });
        if (!user)
            return undefined;
        const skills = db.prepare('SELECT skill FROM user_skills WHERE user_id = @userId').all({ userId });
        const registrations = db.prepare(`
      SELECT c.name FROM registrations r
      JOIN competitions c ON r.competition_id = c.id
      WHERE r.user_id = @userId AND r.status = 'registered'
    `).all({ userId });
        const awards = db.prepare(`
      SELECT c.name, a.award_level FROM awards a
      JOIN competitions c ON a.competition_id = c.id
      WHERE a.user_id = @userId
    `).all({ userId });
        const certPlans = db.prepare(`
      SELECT cert.name FROM cert_study_plans cp
      JOIN certificates cert ON cp.certificate_id = cert.id
      WHERE cp.user_id = @userId AND cp.status = 'studying'
    `).all({ userId });
        return {
            username: user.username,
            college: user.college,
            major: user.major,
            bio: user.bio,
            skills: skills.map(s => s.skill),
            registrations: registrations.map(r => r.name),
            awards: awards.map(a => `${a.name}(${a.award_level})`),
            certPlans: certPlans.map(c => c.name),
        };
    }
    catch {
        return undefined;
    }
}
export async function chatWithAI(userMessage: string, conversationHistory: ChatMessage[], userId?: number): Promise<string> {
    if (!DEEPSEEK_API_KEY) {
        return '⚠️ AI服务暂未配置，请联系管理员设置 DEEPSEEK_API_KEY 环境变量。';
    }
    const userProfile = userId ? getUserProfile(userId) : undefined;
    const systemPrompt = buildSystemPrompt(userProfile);
    const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // 保留最近10条对话历史
        { role: 'user', content: userMessage },
    ];
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: false,
            }),
            signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) {
            const errText = await response.text();
            console.error('DeepSeek API error:', response.status, errText);
            return '😅 AI服务暂时不可用，请稍后再试。';
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '抱歉，我没有生成有效的回复。';
    }
    catch (err) {
        console.error('AI service error:', err.message);
        return '😅 网络连接出现问题，请稍后再试。';
    }
}
async function* streamChatWithAI(userMessage, conversationHistory, userId) {
    if (!DEEPSEEK_API_KEY) {
        yield '⚠️ AI服务暂未配置，请联系管理员设置 DEEPSEEK_API_KEY 环境变量。';
        return;
    }
    const userProfile = userId ? getUserProfile(userId) : undefined;
    const systemPrompt = buildSystemPrompt(userProfile);
    const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10),
        { role: 'user', content: userMessage },
    ];
    let reader;
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: true,
            }),
            signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) {
            yield '😅 AI服务暂时不可用，请稍后再试。';
            return;
        }
        reader = response.body?.getReader();
        if (!reader) {
            yield '读取响应失败';
            return;
        }
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: '))
                    continue;
                const data = trimmed.slice(6);
                if (data === '[DONE]')
                    return;
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content)
                        yield content;
                }
                catch { /* skip invalid JSON */ }
            }
        }
    }
    catch (err) {
        console.error('AI stream error:', err.message);
        yield '😅 网络连接出现问题，请稍后再试。';
    }
    finally {
        if (reader) {
            try {
                reader.releaseLock();
            }
            catch { /* reader 已释放或仍有未完成读取 */ }
        }
    }
}
export { streamChatWithAI };
