/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/quizSeed.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { DatabaseWrapper } from './database';

export function seedQuizData(db: DatabaseWrapper): void {
    // 检查是否已有数据
    const existing = db.prepare('SELECT COUNT(*) as count FROM quizzes').get();
    if (existing.count > 0)
        return;
    // 为几个竞赛添加题库
    const quizzes = [
        { competition_id: 4, title: '数学建模基础练习', description: '数学建模竞赛基础知识测试', time_limit: 30, pass_score: 60 },
        { competition_id: 9, title: 'ACM算法基础', description: 'ACM-ICPC算法竞赛基础练习', time_limit: 45, pass_score: 60 },
        { competition_id: 10, title: '信息安全基础', description: '信息安全竞赛基础知识测试', time_limit: 30, pass_score: 60 },
        { competition_id: 8, title: '计算机设计基础', description: '计算机设计大赛基础练习', time_limit: 30, pass_score: 60 },
    ];
    const insertQuiz = db.prepare(`
    INSERT INTO quizzes (competition_id, title, description, time_limit, pass_score)
    VALUES (@competition_id, @title, @description, @time_limit, @pass_score)
  `);
    const insertQuestion = db.prepare(`
    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points)
    VALUES (@quiz_id, @question_text, @question_type, @options, @correct_answer, @explanation, @points)
  `);
    // 数学建模题库
    const quiz1 = insertQuiz.run(quizzes[0]);
    const quiz1Id = quiz1.lastInsertRowid;
    const mathQuestions = [
        {
            quiz_id: quiz1Id,
            question_text: '数学建模的基本步骤不包括以下哪项？',
            question_type: 'single',
            options: JSON.stringify(['问题分析', '模型假设', '代码抄袭', '模型求解']),
            correct_answer: '代码抄袭',
            explanation: '数学建模的基本步骤包括：问题分析、模型假设、模型建立、模型求解、模型检验等。',
            points: 10
        },
        {
            quiz_id: quiz1Id,
            question_text: '以下哪种方法常用于优化问题的求解？',
            question_type: 'single',
            options: JSON.stringify(['线性规划', '文本分析', '图像处理', '音频编码']),
            correct_answer: '线性规划',
            explanation: '线性规划是解决优化问题的常用方法，适用于目标函数和约束条件都是线性的情况。',
            points: 10
        },
        {
            quiz_id: quiz1Id,
            question_text: '数学建模竞赛中，论文的哪个部分最重要？',
            question_type: 'single',
            options: JSON.stringify(['摘要', '参考文献', '附录', '致谢']),
            correct_answer: '摘要',
            explanation: '摘要是论文的精华，评委首先阅读摘要来了解整篇论文的核心内容和创新点。',
            points: 10
        },
        {
            quiz_id: quiz1Id,
            question_text: '以下哪些是数学建模常用的软件工具？',
            question_type: 'multiple',
            options: JSON.stringify(['MATLAB', 'Python', 'Photoshop', 'SPSS']),
            correct_answer: JSON.stringify(['MATLAB', 'Python', 'SPSS']),
            explanation: 'MATLAB、Python和SPSS都是数学建模中常用的工具，Photoshop主要用于图像处理。',
            points: 15
        },
        {
            quiz_id: quiz1Id,
            question_text: '灵敏度分析的目的是什么？',
            question_type: 'single',
            options: JSON.stringify(['检验模型对参数变化的稳定性', '提高计算速度', '减少代码量', '美化图表']),
            correct_answer: '检验模型对参数变化的稳定性',
            explanation: '灵敏度分析用于检验模型结果对输入参数变化的敏感程度，评估模型的稳健性。',
            points: 10
        }
    ];
    mathQuestions.forEach(q => insertQuestion.run(q));
    // ACM算法题库
    const quiz2 = insertQuiz.run(quizzes[1]);
    const quiz2Id = quiz2.lastInsertRowid;
    const acmQuestions = [
        {
            quiz_id: quiz2Id,
            question_text: '快速排序的平均时间复杂度是？',
            question_type: 'single',
            options: JSON.stringify(['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)']),
            correct_answer: 'O(n log n)',
            explanation: '快速排序的平均时间复杂度为O(n log n)，最坏情况为O(n²)。',
            points: 10
        },
        {
            quiz_id: quiz2Id,
            question_text: '以下哪种数据结构适合实现优先队列？',
            question_type: 'single',
            options: JSON.stringify(['数组', '链表', '堆', '栈']),
            correct_answer: '堆',
            explanation: '堆是实现优先队列的最佳数据结构，可以在O(log n)时间内完成插入和删除最值操作。',
            points: 10
        },
        {
            quiz_id: quiz2Id,
            question_text: 'Dijkstra算法用于解决什么问题？',
            question_type: 'single',
            options: JSON.stringify(['最小生成树', '单源最短路径', '拓扑排序', '字符串匹配']),
            correct_answer: '单源最短路径',
            explanation: 'Dijkstra算法用于求解带权图中单源最短路径问题，要求边权非负。',
            points: 10
        },
        {
            quiz_id: quiz2Id,
            question_text: '动态规划的核心思想是？',
            question_type: 'single',
            options: JSON.stringify(['分治', '贪心', '记忆化搜索/状态转移', '回溯']),
            correct_answer: '记忆化搜索/状态转移',
            explanation: '动态规划通过将问题分解为子问题，利用状态转移方程和记忆化避免重复计算。',
            points: 10
        },
        {
            quiz_id: quiz2Id,
            question_text: '以下哪些是图论中的经典算法？',
            question_type: 'multiple',
            options: JSON.stringify(['Kruskal', 'KMP', 'Floyd', 'Prim']),
            correct_answer: JSON.stringify(['Kruskal', 'Floyd', 'Prim']),
            explanation: 'Kruskal、Floyd、Prim都是图论算法，KMP是字符串匹配算法。',
            points: 15
        }
    ];
    acmQuestions.forEach(q => insertQuestion.run(q));
    // 信息安全题库
    const quiz3 = insertQuiz.run(quizzes[2]);
    const quiz3Id = quiz3.lastInsertRowid;
    const securityQuestions = [
        {
            quiz_id: quiz3Id,
            question_text: 'SQL注入攻击的防御方法不包括？',
            question_type: 'single',
            options: JSON.stringify(['参数化查询', '输入验证', '使用更长的密码', '最小权限原则']),
            correct_answer: '使用更长的密码',
            explanation: '防御SQL注入主要通过参数化查询、输入验证和最小权限原则，密码长度与SQL注入无关。',
            points: 10
        },
        {
            quiz_id: quiz3Id,
            question_text: 'XSS攻击的全称是？',
            question_type: 'single',
            options: JSON.stringify(['Cross-Site Scripting', 'Cross-Site Security', 'Cross-Server Scripting', 'Cross-System Security']),
            correct_answer: 'Cross-Site Scripting',
            explanation: 'XSS是Cross-Site Scripting（跨站脚本攻击）的缩写。',
            points: 10
        },
        {
            quiz_id: quiz3Id,
            question_text: '以下哪种加密算法是对称加密？',
            question_type: 'single',
            options: JSON.stringify(['RSA', 'AES', 'ECC', 'DSA']),
            correct_answer: 'AES',
            explanation: 'AES是对称加密算法，RSA、ECC、DSA都是非对称加密或签名算法。',
            points: 10
        },
        {
            quiz_id: quiz3Id,
            question_text: 'CTF比赛中常见的题目类型有哪些？',
            question_type: 'multiple',
            options: JSON.stringify(['Web', 'Pwn', 'Reverse', 'Cooking']),
            correct_answer: JSON.stringify(['Web', 'Pwn', 'Reverse']),
            explanation: 'CTF常见题型包括Web、Pwn（二进制漏洞利用）、Reverse（逆向工程）、Crypto（密码学）等。',
            points: 15
        }
    ];
    securityQuestions.forEach(q => insertQuestion.run(q));
    // 计算机设计题库
    const quiz4 = insertQuiz.run(quizzes[3]);
    const quiz4Id = quiz4.lastInsertRowid;
    const designQuestions = [
        {
            quiz_id: quiz4Id,
            question_text: '软件开发中，需求分析阶段的主要产出是？',
            question_type: 'single',
            options: JSON.stringify(['源代码', '需求规格说明书', '测试报告', '用户手册']),
            correct_answer: '需求规格说明书',
            explanation: '需求分析阶段的主要产出是需求规格说明书，明确系统需要实现的功能和约束。',
            points: 10
        },
        {
            quiz_id: quiz4Id,
            question_text: 'UI设计中，以下哪项原则最重要？',
            question_type: 'single',
            options: JSON.stringify(['用户体验', '代码复杂度', '服务器性能', '数据库设计']),
            correct_answer: '用户体验',
            explanation: 'UI设计的核心是用户体验，需要考虑易用性、美观性和交互性。',
            points: 10
        },
        {
            quiz_id: quiz4Id,
            question_text: '以下哪些是常用的前端框架？',
            question_type: 'multiple',
            options: JSON.stringify(['React', 'Vue', 'Spring', 'Angular']),
            correct_answer: JSON.stringify(['React', 'Vue', 'Angular']),
            explanation: 'React、Vue、Angular都是前端框架，Spring是后端Java框架。',
            points: 15
        }
    ];
    designQuestions.forEach(q => insertQuestion.run(q));
    console.log('题库数据初始化完成');
}