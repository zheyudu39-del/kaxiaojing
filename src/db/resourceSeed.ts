/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/resourceSeed.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { DatabaseWrapper } from './database';

const resourceSeeds = [
    // ===== 综合类 (7个竞赛) =====
    // 1. 中国国际大学生创新大赛
    { competition_name: '中国国际大学生创新大赛', title: '大赛项目申报指南与评审标准', description: '中国国际大学生创新大赛项目申报流程、评审标准及备赛攻略', external_url: 'https://cy.ncss.cn/information/index', file_type: 'link' },
    { competition_name: '中国国际大学生创新大赛', title: '历届金奖项目路演视频与商业计划书', description: '历届金奖项目路演视频、商业计划书模板及点评', external_url: 'https://cy.ncss.cn/information/index', file_type: 'link' },
    // 2. "挑战杯"全国大学生课外学术科技作品竞赛
    { competition_name: '"挑战杯"全国大学生课外学术科技作品竞赛', title: '挑战杯特等奖作品案例分析', description: '历届挑战杯特等奖、一等奖作品案例分析，涵盖选题、研究方法、答辩技巧', external_url: 'https://www.tiaozhanbei.net/project/', file_type: 'link' },
    { competition_name: '"挑战杯"全国大学生课外学术科技作品竞赛', title: '学术科技作品撰写规范与模板', description: '挑战杯学术论文、调查报告、科技发明制作的撰写规范和优秀范例', external_url: 'https://www.tiaozhanbei.net/', file_type: 'link' },
    // 3. "挑战杯"中国大学生创业计划竞赛
    { competition_name: '"挑战杯"中国大学生创业计划竞赛', title: '创业计划书撰写指南与模板', description: '挑战杯创业计划竞赛商业计划书撰写规范、模板及优秀范例', external_url: 'https://www.tiaozhanbei.net/project/', file_type: 'link' },
    { competition_name: '"挑战杯"中国大学生创业计划竞赛', title: '创业计划路演PPT制作技巧', description: '路演PPT设计、答辩技巧及评委常见问题汇总', external_url: 'https://www.tiaozhanbei.net/', file_type: 'link' },
    // 4. 全国大学生数学建模竞赛
    { competition_name: '全国大学生数学建模竞赛', title: '历年真题及优秀论文汇编(2015-2024)', description: '全国大学生数学建模竞赛历年A/B题真题及国家一等奖优秀论文', external_url: 'http://www.mcm.edu.cn/html_cn/block/8a76c4d85fa0d468015fdb3c4f7c0012.html', file_type: 'link' },
    { competition_name: '全国大学生数学建模竞赛', title: '数学建模常用算法与MATLAB实现', description: '数学建模竞赛常用算法总结，包含优化算法、预测模型、评价模型等MATLAB代码', external_url: 'https://github.com/personqianduixue/Math_Model', file_type: 'link' },
    // 5. 全国大学生节能减排社会实践与科技竞赛
    { competition_name: '全国大学生节能减排社会实践与科技竞赛', title: '节能减排竞赛优秀作品展示', description: '历届节能减排竞赛获奖作品展示及技术报告范例', external_url: 'http://www.jienengjianpai.org/works.html', file_type: 'link' },
    { competition_name: '全国大学生节能减排社会实践与科技竞赛', title: '节能减排项目选题与申报指南', description: '节能减排竞赛选题方向、项目申报流程及评审要点', external_url: 'http://www.jienengjianpai.org/', file_type: 'link' },
    // 6. 全国大学生创新创业训练计划年会展示
    { competition_name: '全国大学生创新创业训练计划年会展示', title: '大创项目申报与结题指南', description: '国家级大学生创新创业训练计划项目申报、中期检查和结题要求', external_url: 'https://gjcxcy.bjtu.edu.cn/', file_type: 'link' },
    { competition_name: '全国大学生创新创业训练计划年会展示', title: '历届年会优秀项目展示', description: '大创年会历届优秀学术论文、创新创业实践展示项目汇编', external_url: 'https://gjcxcy.bjtu.edu.cn/Index/ItemList', file_type: 'link' },
    // 7. 世界大学生桥梁设计大赛
    { competition_name: '世界大学生桥梁设计大赛', title: '桥梁模型设计与制作指南', description: '桥梁结构设计基础、模型制作工艺及承载力优化方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '世界大学生桥梁设计大赛', title: '历届获奖桥梁设计方案赏析', description: '历届桥梁设计大赛获奖作品的设计理念、结构分析和创新点', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 计算机类 (10个竞赛) =====
    // 8. 中国大学生计算机设计大赛
    { competition_name: '中国大学生计算机设计大赛', title: '计算机设计大赛获奖作品集', description: '历届中国大学生计算机设计大赛各类别获奖作品展示及评审点评', external_url: 'http://jsjds.blcu.edu.cn/zphz/index.htm', file_type: 'link' },
    { competition_name: '中国大学生计算机设计大赛', title: '参赛作品设计文档模板', description: '计算机设计大赛作品设计文档、演示视频制作规范和模板', external_url: 'http://jsjds.blcu.edu.cn/', file_type: 'link' },
    // 9. ACM-ICPC
    { competition_name: 'ACM-ICPC国际大学生程序设计竞赛', title: 'ACM-ICPC历年区域赛真题集', description: 'ACM-ICPC亚洲区域赛历年真题，包含题目、测试数据和标准解法', external_url: 'https://codeforces.com/gyms', file_type: 'link' },
    { competition_name: 'ACM-ICPC国际大学生程序设计竞赛', title: 'OI Wiki算法百科', description: '开源的算法竞赛知识库，涵盖数据结构、图论、数学等所有竞赛知识点', external_url: 'https://oi-wiki.org/', file_type: 'link' },
    // 10. 全国大学生信息安全竞赛
    { competition_name: '全国大学生信息安全竞赛', title: 'CTF入门指南与学习路线', description: 'CTF竞赛入门教程，包含Web、Pwn、Reverse、Crypto等方向学习路线', external_url: 'https://ctf-wiki.org/', file_type: 'link' },
    { competition_name: '全国大学生信息安全竞赛', title: 'CISCN历年真题WriteUp', description: '全国大学生信息安全竞赛历年真题及详细解题思路', external_url: 'https://ctf.bugku.com/', file_type: 'link' },
    // 11. 全国大学生软件测试大赛
    { competition_name: '全国大学生软件测试大赛', title: '软件测试基础理论与方法', description: '软件测试用例设计方法、缺陷报告撰写规范及常用测试工具介绍', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生软件测试大赛', title: '软件测试大赛备赛指南', description: '功能测试和性能测试赛项的备赛策略、评分标准及注意事项', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 12. 中国高校计算机大赛-团体程序设计天梯赛
    { competition_name: '中国高校计算机大赛-团体程序设计天梯赛', title: 'PTA天梯赛历年真题', description: '团体程序设计天梯赛历年真题，按基础级、进阶级、登顶级分级，含详细题解', external_url: 'https://pintia.cn/problem-sets?tab=1', file_type: 'link' },
    { competition_name: '中国高校计算机大赛-团体程序设计天梯赛', title: '天梯赛备赛训练题集', description: 'PTA平台天梯赛专项训练题目集，按知识点分类', external_url: 'https://pintia.cn/', file_type: 'link' },
    // 13. 中国高校计算机大赛-大数据挑战赛
    { competition_name: '中国高校计算机大赛-大数据挑战赛', title: '大数据竞赛入门与实战', description: '大数据分析竞赛常用方法、特征工程技巧及模型调优策略', external_url: 'https://tianchi.aliyun.com/competition/gameList/activeList', file_type: 'link' },
    { competition_name: '中国高校计算机大赛-大数据挑战赛', title: '历届大数据挑战赛优秀方案', description: '历届大数据挑战赛获奖团队的解题方案和技术报告', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 14. 中国高校计算机大赛-网络技术挑战赛
    { competition_name: '中国高校计算机大赛-网络技术挑战赛', title: '网络技术挑战赛备赛资料', description: '网络规划、配置和故障排除技能训练资料及历届赛题分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '中国高校计算机大赛-网络技术挑战赛', title: '网络工程实践指南', description: '企业网络架构设计、路由交换配置及网络安全实践教程', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 15. 中国高校计算机大赛-人工智能创意赛
    { competition_name: '中国高校计算机大赛-人工智能创意赛', title: 'AI创意赛历届优秀作品', description: '人工智能创意赛历届获奖作品展示及技术方案分析', external_url: 'https://aistudio.baidu.com/competition', file_type: 'link' },
    { competition_name: '中国高校计算机大赛-人工智能创意赛', title: 'AI开发实战教程', description: '基于百度飞桨等平台的AI应用开发教程和项目实战', external_url: 'https://aicontest.baidu.com/', file_type: 'link' },
    // 16. 中国高校计算机大赛-移动应用创新赛
    { competition_name: '中国高校计算机大赛-移动应用创新赛', title: '移动应用开发技术指南', description: 'iOS/Android/HarmonyOS移动应用开发技术栈和最佳实践', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '中国高校计算机大赛-移动应用创新赛', title: '移动应用创新赛获奖作品赏析', description: '历届移动应用创新赛获奖作品的创意点和技术实现分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 17. 全国大学生物联网设计竞赛
    { competition_name: '全国大学生物联网设计竞赛', title: '物联网系统设计与开发教程', description: '物联网感知层、网络层、应用层设计方法及常用开发平台介绍', external_url: 'http://iot.sjtu.edu.cn/', file_type: 'link' },
    { competition_name: '全国大学生物联网设计竞赛', title: '物联网竞赛历届获奖作品', description: '历届物联网设计竞赛获奖作品展示及技术报告', external_url: 'http://iot.sjtu.edu.cn/show.aspx?info_lb=36&flag=2', file_type: 'link' },
    // ===== 电子信息类 (10个竞赛) =====
    // 18. 全国大学生电子设计竞赛
    { competition_name: '全国大学生电子设计竞赛', title: '电子设计竞赛历年真题汇编(2015-2023)', description: '近10年电子设计竞赛真题汇总，按控制类、仪器仪表类、通信类分类整理', external_url: 'http://nuedc.xjtu.edu.cn/Item/list.asp?id=1003', file_type: 'link' },
    { competition_name: '全国大学生电子设计竞赛', title: '电子设计竞赛常用电路模块', description: '电子设计竞赛常用电路模块设计，包含电源、放大器、滤波器等', external_url: 'http://nuedc.xjtu.edu.cn/', file_type: 'link' },
    // 19. 全国大学生智能汽车竞赛
    { competition_name: '全国大学生智能汽车竞赛', title: '智能车竞赛技术报告模板', description: '全国大学生智能汽车竞赛技术报告撰写规范和优秀报告范例', external_url: 'https://smartcar.cdstm.cn/index/article/index.html?cid=7', file_type: 'link' },
    { competition_name: '全国大学生智能汽车竞赛', title: '智能车算法与开源项目汇总', description: '智能车摄像头组图像处理、路径规划算法详解及开源代码', external_url: 'https://github.com/ittuann/Awesome-IntelligentCarRace', file_type: 'link' },
    // 20. 全国大学生嵌入式芯片与系统设计竞赛
    { competition_name: '全国大学生嵌入式芯片与系统设计竞赛', title: '嵌入式系统开发入门教程', description: '嵌入式系统开发基础，包含STM32、ARM等平台的开发环境搭建和编程入门', external_url: 'https://www.socchina.net/', file_type: 'link' },
    { competition_name: '全国大学生嵌入式芯片与系统设计竞赛', title: '嵌入式竞赛历届获奖作品', description: '历届嵌入式芯片与系统设计竞赛获奖作品展示及技术方案', external_url: 'https://www.socchina.net/works', file_type: 'link' },
    // 21. 全国大学生FPGA创新设计竞赛
    { competition_name: '全国大学生FPGA创新设计竞赛', title: 'FPGA开发入门与实战', description: 'FPGA开发基础教程，Verilog/VHDL语言入门及常用IP核设计', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生FPGA创新设计竞赛', title: 'FPGA竞赛优秀设计方案', description: '历届FPGA创新设计竞赛获奖作品的设计思路和实现方案', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 22. 全国大学生集成电路创新创业大赛
    { competition_name: '全国大学生集成电路创新创业大赛', title: '集成电路设计基础教程', description: '数字/模拟集成电路设计流程、EDA工具使用及仿真验证方法', external_url: 'https://univ.ciciec.com/', file_type: 'link' },
    { competition_name: '全国大学生集成电路创新创业大赛', title: '集成电路大赛历届获奖作品', description: '历届集成电路创新创业大赛获奖作品展示及评审点评', external_url: 'https://univ.ciciec.com/works', file_type: 'link' },
    // 23. 全国大学生光电设计竞赛
    { competition_name: '全国大学生光电设计竞赛', title: '光电技术基础与实验指南', description: '光电检测、光纤通信、激光技术等光电实验基础教程', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生光电设计竞赛', title: '光电竞赛优秀作品案例', description: '历届光电设计竞赛获奖作品的设计原理和创新点分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 24. 中国大学生电脑鼠走迷宫竞赛
    { competition_name: '中国大学生电脑鼠走迷宫竞赛', title: '电脑鼠设计与迷宫算法', description: '电脑鼠硬件设计、传感器选型及迷宫搜索算法（洪水法等）详解', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '中国大学生电脑鼠走迷宫竞赛', title: '电脑鼠竞赛备赛经验分享', description: '电脑鼠竞赛参赛经验、调试技巧及常见问题解决方案', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 25. 全国大学生通信专题设计竞赛
    { competition_name: '全国大学生通信专题设计竞赛', title: '通信系统设计基础教程', description: '数字通信、无线通信、5G技术基础及通信系统仿真方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生通信专题设计竞赛', title: '通信竞赛历届优秀作品', description: '历届通信专题设计竞赛获奖作品的技术方案和创新点', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 26. 睿抗机器人开发者大赛
    { competition_name: '睿抗机器人开发者大赛', title: '机器人开发入门教程', description: 'RAICOM智能机器人开发基础，包含ROS、机器视觉、运动控制等', external_url: 'https://www.raicom.com.cn/', file_type: 'link' },
    { competition_name: '睿抗机器人开发者大赛', title: '睿抗大赛历届获奖作品', description: '历届睿抗机器人开发者大赛获奖作品展示及技术报告', external_url: 'https://www.raicom.com.cn/works', file_type: 'link' },
    // 27. 全国大学生电子商务"创新、创意及创业"挑战赛
    { competition_name: '全国大学生电子商务"创新、创意及创业"挑战赛', title: '三创赛商业计划书模板', description: '电子商务三创赛商业计划书撰写规范、模板及优秀范例', external_url: 'http://www.3chuang.net/', file_type: 'link' },
    { competition_name: '全国大学生电子商务"创新、创意及创业"挑战赛', title: '三创赛历届获奖作品', description: '历届电子商务三创赛获奖项目展示及路演答辩技巧', external_url: 'http://www.3chuang.net/works', file_type: 'link' },
    // ===== 其他工学类 (10个竞赛) =====
    // 28. 全国大学生机械创新设计大赛
    { competition_name: '全国大学生机械创新设计大赛', title: '机械创新设计方法与案例', description: '机械创新设计方法论、TRIZ创新理论及历届获奖作品案例分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生机械创新设计大赛', title: '机械模型制作工艺指南', description: '机械模型加工制作工艺、3D打印技术应用及装配调试方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 29. 全国大学生工程训练综合能力竞赛
    { competition_name: '全国大学生工程训练综合能力竞赛', title: '工程训练竞赛备赛指南', description: '工程训练综合能力竞赛各赛道规则解读、备赛策略及训练方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生工程训练综合能力竞赛', title: '智能制造与虚拟仿真技术', description: '智能制造基础、虚拟仿真软件使用及工程实践案例', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 30. 全国大学生化工设计竞赛
    { competition_name: '全国大学生化工设计竞赛', title: '化工设计竞赛备赛手册', description: '化工过程设计流程、Aspen Plus仿真软件使用及设计说明书撰写规范', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生化工设计竞赛', title: '化工设计竞赛优秀作品', description: '历届化工设计竞赛获奖作品的工艺流程图和设计方案', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 31. 全国大学生金相技能大赛
    { competition_name: '全国大学生金相技能大赛', title: '金相制备技术与组织识别', description: '金相试样磨制、抛光、腐蚀技术及常见金属组织显微识别方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生金相技能大赛', title: '金相大赛备赛训练指南', description: '金相技能大赛评分标准、训练方法及常见问题解决', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 32. 全国大学生交通运输科技大赛
    { competition_name: '全国大学生交通运输科技大赛', title: '交通运输科技创新选题指南', description: '交通规划、智能交通、运输管理等方向的选题建议和研究方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生交通运输科技大赛', title: '交通科技大赛论文撰写规范', description: '交通运输科技大赛论文格式要求、写作技巧及优秀论文范例', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 33. 全国大学生结构设计竞赛
    { competition_name: '全国大学生结构设计竞赛', title: '结构模型设计与制作技巧', description: '结构模型材料选择、连接方式、加载分析及制作工艺详解', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生结构设计竞赛', title: '结构设计竞赛历届赛题分析', description: '历届结构设计竞赛赛题解读、加载方案分析及获奖作品赏析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 34. 全国大学生水利创新设计大赛
    { competition_name: '全国大学生水利创新设计大赛', title: '水利工程创新设计方法', description: '水利工程创新设计思路、水力学计算方法及模型制作技术', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生水利创新设计大赛', title: '水利大赛获奖作品展示', description: '历届水利创新设计大赛获奖作品的设计方案和技术报告', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 35. 全国大学生先进成图技术与产品信息建模创新大赛
    { competition_name: '全国大学生先进成图技术与产品信息建模创新大赛', title: 'CAD/BIM制图技能训练', description: 'AutoCAD、SolidWorks、Revit等软件操作技巧及工程制图规范', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生先进成图技术与产品信息建模创新大赛', title: '成图大赛历年真题与解析', description: '历届成图大赛机械类和建筑类真题及详细解答', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 36. 全国大学生冶金科技竞赛
    { competition_name: '全国大学生冶金科技竞赛', title: '冶金技术创新研究方法', description: '钢铁冶金、有色冶金领域的研究方法和创新方向', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生冶金科技竞赛', title: '冶金竞赛论文撰写指南', description: '冶金科技竞赛论文格式要求、实验数据分析方法及写作技巧', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 37. 全国大学生船舶能源与动力创新大赛
    { competition_name: '全国大学生船舶能源与动力创新大赛', title: '船舶动力系统设计基础', description: '船舶能源与动力系统基础知识、新能源船舶技术及节能减排方案', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生船舶能源与动力创新大赛', title: '船舶大赛获奖作品分析', description: '历届船舶能源与动力创新大赛获奖作品的技术方案和创新点', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 理学类 (8个竞赛) =====
    // 38. 全国大学生数学竞赛
    { competition_name: '全国大学生数学竞赛', title: '数学竞赛历年真题(2009-2024)', description: '全国大学生数学竞赛初赛、决赛历年真题及详细解答，分数学类和非数学类', external_url: 'http://www.cmathc.cn/list.php?fid=24', file_type: 'link' },
    { competition_name: '全国大学生数学竞赛', title: '数学竞赛核心知识点梳理', description: '大学生数学竞赛核心知识点，包含高等数学、数学分析、线性代数重难点', external_url: 'http://www.cmathc.cn/', file_type: 'link' },
    // 39. 全国大学生物理实验竞赛
    { competition_name: '全国大学生物理实验竞赛', title: '物理实验技能训练指南', description: '大学物理实验基本操作规范、数据处理方法及误差分析技巧', external_url: 'http://www.phylab.cn/', file_type: 'link' },
    { competition_name: '全国大学生物理实验竞赛', title: '物理实验竞赛获奖作品', description: '历届物理实验竞赛获奖作品展示及创新实验设计思路', external_url: 'http://www.phylab.cn/works', file_type: 'link' },
    // 40. 全国大学生化学实验创新设计竞赛
    { competition_name: '全国大学生化学实验创新设计竞赛', title: '化学实验创新设计方法', description: '化学实验创新设计思路、绿色化学理念及实验方案优化方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生化学实验创新设计竞赛', title: '化学实验竞赛备赛指南', description: '化学实验竞赛评分标准、实验操作规范及安全注意事项', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 41. 全国大学生生命科学竞赛
    { competition_name: '全国大学生生命科学竞赛', title: '生命科学实验设计方法', description: '生命科学研究方法、实验设计原则及常用分子生物学技术', external_url: 'http://culsc.cn/', file_type: 'link' },
    { competition_name: '全国大学生生命科学竞赛', title: '生命科学竞赛获奖作品', description: '历届生命科学竞赛获奖作品展示及研究论文范例', external_url: 'http://culsc.cn/works', file_type: 'link' },
    // 42. 全国大学生统计建模大赛
    { competition_name: '全国大学生统计建模大赛', title: '统计建模方法与R/Python实现', description: '常用统计建模方法（回归分析、时间序列、聚类分析等）及代码实现', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生统计建模大赛', title: '统计建模论文撰写规范', description: '统计建模大赛论文格式要求、数据来源说明及结果分析方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 43. 全国大学生市场调查与分析大赛
    { competition_name: '全国大学生市场调查与分析大赛', title: '市场调查方案设计指南', description: '市场调查方案设计、问卷编制、抽样方法及SPSS数据分析教程', external_url: 'http://www.china-cssc.org/', file_type: 'link' },
    { competition_name: '全国大学生市场调查与分析大赛', title: '市场调查大赛获奖报告', description: '历届市场调查与分析大赛获奖团队的调查报告和展示材料', external_url: 'http://www.china-cssc.org/works', file_type: 'link' },
    // 44. 全国大学生天文创新作品竞赛
    { competition_name: '全国大学生天文创新作品竞赛', title: '天文观测与数据处理入门', description: '天文观测基础、望远镜使用方法及天文数据处理软件教程', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生天文创新作品竞赛', title: '天文竞赛创新作品案例', description: '历届天文创新作品竞赛获奖作品展示及创意分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 45. 全国大学生地质技能竞赛
    { competition_name: '全国大学生地质技能竞赛', title: '地质技能训练手册', description: '地质填图、岩矿鉴定、地质报告撰写等基本技能训练方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生地质技能竞赛', title: '地质竞赛备赛经验分享', description: '地质技能竞赛各赛项备赛策略、评分标准及注意事项', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 经管类 (7个竞赛) =====
    // 46. "学创杯"全国大学生创业综合模拟大赛
    { competition_name: '"学创杯"全国大学生创业综合模拟大赛', title: '创业模拟经营策略指南', description: '创业模拟软件操作技巧、市场分析方法及经营决策策略', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '"学创杯"全国大学生创业综合模拟大赛', title: '学创杯备赛训练方案', description: '学创杯竞赛规则解读、团队分工建议及模拟训练计划', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 47. 全国大学生财会大数据应用能力大赛
    { competition_name: '全国大学生财会大数据应用能力大赛', title: '财会大数据分析工具教程', description: 'Python/Excel数据分析在财务领域的应用，包含数据清洗、可视化等', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生财会大数据应用能力大赛', title: '财会大数据竞赛备赛指南', description: '财会大数据竞赛评分标准、常见题型分析及备赛策略', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 48. 全国高校商业精英挑战赛
    { competition_name: '全国高校商业精英挑战赛', title: '商业策划方案撰写指南', description: '商业策划书结构、市场分析方法、营销策略制定及财务预测', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国高校商业精英挑战赛', title: '商业精英赛各赛项备赛', description: '国际贸易、品牌策划、商业谈判等赛项的备赛方法和技巧', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 49. 中国大学生服务外包创新创业大赛
    { competition_name: '中国大学生服务外包创新创业大赛', title: '服务外包大赛选题与开发指南', description: '服务外包大赛A类企业命题解读和B类自选课题选题建议', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '中国大学生服务外包创新创业大赛', title: '服务外包大赛获奖作品', description: '历届服务外包创新创业大赛获奖作品展示及技术方案', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 50. 全国大学生工业工程与精益管理创新大赛
    { competition_name: '全国大学生工业工程与精益管理创新大赛', title: '精益管理方法与工具', description: '精益生产、六西格玛、价值流分析等工业工程核心方法和工具', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生工业工程与精益管理创新大赛', title: '工业工程竞赛案例分析', description: '历届工业工程与精益管理创新大赛获奖方案的案例分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 51. 全国企业竞争模拟大赛
    { competition_name: '全国企业竞争模拟大赛', title: '企业经营模拟决策指南', description: '企业竞争模拟软件操作、战略规划、财务分析及运营决策方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国企业竞争模拟大赛', title: '企业模拟大赛经验分享', description: '企业竞争模拟大赛参赛经验、团队协作技巧及常见决策误区', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 52. 全国大学生会计信息化技能大赛
    { competition_name: '全国大学生会计信息化技能大赛', title: '会计信息化操作技能训练', description: '用友/金蝶财务软件操作、账务处理流程及报表编制方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生会计信息化技能大赛', title: '会计信息化竞赛备赛指南', description: '会计信息化技能大赛评分标准、常见业务处理及备赛策略', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 艺术类 (7个竞赛) =====
    // 53. 全国大学生广告艺术大赛
    { competition_name: '全国大学生广告艺术大赛', title: '广告创意设计方法与技巧', description: '广告创意思维方法、视觉设计原则及各类别作品创作技巧', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生广告艺术大赛', title: '大广赛历届获奖作品赏析', description: '历届全国大学生广告艺术大赛各类别获奖作品展示及创意分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 54. 全国大学生工业设计大赛
    { competition_name: '全国大学生工业设计大赛', title: '工业设计方法与流程', description: '工业产品设计方法论、用户研究、概念设计及效果图表现技法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生工业设计大赛', title: '工业设计大赛获奖作品集', description: '历届工业设计大赛获奖作品的设计理念和创新点分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 55. 全国大学生艺术展演活动
    { competition_name: '全国大学生艺术展演活动', title: '艺术展演活动参赛指南', description: '艺术展演各类别参赛要求、节目编排技巧及作品创作建议', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生艺术展演活动', title: '历届艺术展演优秀作品', description: '历届全国大学生艺术展演活动优秀表演和作品展示', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 56. 全国高校数字艺术设计大赛
    { competition_name: '全国高校数字艺术设计大赛', title: '数字艺术设计工具教程', description: 'Photoshop、Illustrator、After Effects等数字设计工具进阶教程', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国高校数字艺术设计大赛', title: '数字艺术大赛获奖作品', description: '历届数字艺术设计大赛各类别获奖作品展示及设计分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 57. 中国好创意暨全国数字艺术设计大赛
    { competition_name: '中国好创意暨全国数字艺术设计大赛', title: '数字艺术创意方法', description: '数字艺术创意思维训练、新媒体技术应用及跨界设计方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '中国好创意暨全国数字艺术设计大赛', title: '好创意大赛获奖作品赏析', description: '历届中国好创意大赛获奖作品的创意点和技术实现分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 58. 米兰设计周-中国高校设计学科师生优秀作品展
    { competition_name: '米兰设计周-中国高校设计学科师生优秀作品展', title: '国际设计展参展指南', description: '米兰设计周参展流程、作品准备要求及国际设计趋势分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '米兰设计周-中国高校设计学科师生优秀作品展', title: '历届入选作品展示', description: '历届米兰设计周中国高校入选作品展示及设计理念', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 59. 全国大学生环境设计学年奖
    { competition_name: '全国大学生环境设计学年奖', title: '环境设计作品创作指南', description: '室内设计和景观设计作品创作方法、图纸表现技法及设计说明撰写', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生环境设计学年奖', title: '环境设计学年奖获奖作品', description: '历届环境设计学年奖获奖作品的设计方案和效果图展示', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 语言类 (6个竞赛) =====
    // 60. 全国大学生英语竞赛
    { competition_name: '全国大学生英语竞赛', title: 'NECCS历年真题及听力音频', description: '全国大学生英语竞赛A/B/C/D类历年真题、听力音频及参考答案', external_url: 'http://www.chinaneccs.cn/list.php?fid=18', file_type: 'link' },
    { competition_name: '全国大学生英语竞赛', title: '英语竞赛词汇与写作技巧', description: '大学生英语竞赛高频词汇、写作模板和翻译技巧总结', external_url: 'http://www.chinaneccs.cn/', file_type: 'link' },
    // 61. "外研社·国才杯"全国大学生外语能力大赛
    { competition_name: '"外研社·国才杯""理解当代中国"全国大学生外语能力大赛', title: '外研社杯备赛资料', description: '外研社杯写作、阅读、演讲赛项的备赛方法和历届优秀作品', external_url: 'https://uchallenge.unipus.cn/', file_type: 'link' },
    { competition_name: '"外研社·国才杯""理解当代中国"全国大学生外语能力大赛', title: '"理解当代中国"主题学习资料', description: '当代中国政治、经济、文化等主题的英文表达和翻译参考', external_url: 'https://uchallenge.unipus.cn/2023/works/', file_type: 'link' },
    // 62. 中国日报社"21世纪杯"全国英语演讲比赛
    { competition_name: '中国日报社"21世纪杯"全国英语演讲比赛', title: '英语演讲技巧与训练方法', description: '英语演讲稿撰写、发音训练、肢体语言及即兴演讲应对技巧', external_url: 'https://contest.i21st.cn/', file_type: 'link' },
    { competition_name: '中国日报社"21世纪杯"全国英语演讲比赛', title: '21世纪杯历届优秀演讲', description: '历届21世纪杯全国英语演讲比赛获奖选手的演讲视频和文稿', external_url: 'https://contest.i21st.cn/article/index.html', file_type: 'link' },
    // 63. "批改网杯"全国大学生英语写作大赛
    { competition_name: '"批改网杯"全国大学生英语写作大赛', title: '英语写作提升方法', description: '英语写作常见错误分析、高分作文结构及词汇升级技巧', external_url: 'http://www.pigai.org/', file_type: 'link' },
    { competition_name: '"批改网杯"全国大学生英语写作大赛', title: '批改网杯历届优秀作文', description: '历届批改网杯英语写作大赛高分作文范例及点评', external_url: 'http://www.pigai.org/index.php?c=contest&a=list', file_type: 'link' },
    // 64. 全国大学生日语翻译大赛
    { competition_name: '全国大学生日语翻译大赛', title: '日语翻译技巧与练习', description: '日中互译常见难点、翻译技巧及历届大赛真题练习', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生日语翻译大赛', title: '日语翻译大赛备赛指南', description: '日语翻译大赛评分标准、备赛方法及推荐学习资源', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 65. 全国高校学生跨文化能力大赛
    { competition_name: '全国高校学生跨文化能力大赛', title: '跨文化交际理论与案例', description: '跨文化交际基础理论、文化差异分析及典型案例学习', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国高校学生跨文化能力大赛', title: '跨文化能力大赛备赛指南', description: '跨文化能力大赛案例分析方法、情景展示技巧及团队协作建议', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 医学类 (5个竞赛) =====
    // 66. 全国大学生基础医学创新研究暨实验设计论坛
    { competition_name: '全国大学生基础医学创新研究暨实验设计论坛', title: '基础医学实验设计方法', description: '基础医学研究选题、实验设计原则、统计分析方法及论文撰写', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生基础医学创新研究暨实验设计论坛', title: '基础医学竞赛获奖作品', description: '历届基础医学创新研究论坛获奖作品的研究方案和成果展示', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 67. 全国大学生临床技能竞赛
    { competition_name: '全国大学生临床技能竞赛', title: '临床技能操作规范手册', description: '病史采集、体格检查、临床操作等核心技能的标准操作流程', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生临床技能竞赛', title: '临床技能竞赛备赛指南', description: '临床技能竞赛各站点考核要点、评分标准及训练方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 68. 全国大学生药学/中药学实验技能竞赛
    { competition_name: '全国大学生药学/中药学实验技能竞赛', title: '药学实验操作规范', description: '药物分析、药物化学、药剂学等实验的标准操作规程和注意事项', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生药学/中药学实验技能竞赛', title: '药学实验竞赛备赛指南', description: '药学实验技能竞赛评分标准、常见实验项目及备赛训练方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 69. 全国大学生公共卫生综合知识与技能大赛
    { competition_name: '全国大学生公共卫生综合知识与技能大赛', title: '公共卫生核心知识复习', description: '流行病学、卫生统计学、环境卫生学等核心知识点梳理', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生公共卫生综合知识与技能大赛', title: '公卫竞赛技能操作训练', description: '现场流行病学调查、数据分析及公共卫生应急处置技能训练', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 70. 全国大学生护理学本科临床技能大赛
    { competition_name: '全国大学生护理学本科临床技能大赛', title: '护理操作技能训练手册', description: '基础护理、专科护理操作的标准流程和评分要点', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生护理学本科临床技能大赛', title: '护理技能竞赛备赛经验', description: '护理技能竞赛备赛策略、团队配合技巧及常见扣分点分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 机器人类 (6个竞赛) =====
    // 71. 中国机器人大赛暨RoboCup机器人世界杯中国赛
    { competition_name: '中国机器人大赛暨RoboCup机器人世界杯中国赛', title: 'RoboCup各项目技术文档', description: 'RoboCup足球、救援、家庭服务等项目的规则和技术要求', external_url: 'http://www.robocup.org.cn/', file_type: 'link' },
    { competition_name: '中国机器人大赛暨RoboCup机器人世界杯中国赛', title: '机器人开发基础教程', description: 'ROS机器人操作系统、机器视觉、运动规划等基础技术教程', external_url: 'http://www.robocup.org.cn/works', file_type: 'link' },
    // 72. 全国大学生机器人大赛-RoboMaster
    { competition_name: '全国大学生机器人大赛-RoboMaster', title: 'RoboMaster官方技术文档', description: 'RoboMaster机甲大师赛官方技术文档、规则手册及开源代码', external_url: 'https://www.robomaster.com/zh-CN/resource/pages/1035', file_type: 'link' },
    { competition_name: '全国大学生机器人大赛-RoboMaster', title: 'RM视觉识别算法开源', description: 'RoboMaster自瞄算法、装甲板识别等视觉算法开源项目汇总', external_url: 'https://github.com/RoboMaster', file_type: 'link' },
    // 73. 全国大学生机器人大赛-RoboCon
    { competition_name: '全国大学生机器人大赛-RoboCon', title: 'RoboCon历届赛题与技术方案', description: '全国大学生机器人大赛RoboCon历届赛题解读及获奖团队技术方案', external_url: 'http://www.robocon.cn/', file_type: 'link' },
    { competition_name: '全国大学生机器人大赛-RoboCon', title: 'RoboCon机器人设计指南', description: '机器人机械结构设计、电控系统搭建及程序开发指南', external_url: 'http://www.robocon.cn/works', file_type: 'link' },
    // 74. 国际水中机器人大赛
    { competition_name: '国际水中机器人大赛', title: '水中机器人设计与控制', description: '水中机器人防水设计、推进系统、水下通信及自主导航技术', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '国际水中机器人大赛', title: '水中机器人竞赛备赛指南', description: '水中机器人各赛项规则解读、设计要点及调试方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 75. 中国高校智能机器人创意大赛
    { competition_name: '中国高校智能机器人创意大赛', title: '智能机器人创意设计方法', description: '智能机器人创意构思、AI技术集成及人机交互设计方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '中国高校智能机器人创意大赛', title: '智能机器人竞赛获奖作品', description: '历届智能机器人创意大赛获奖作品展示及技术方案分析', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 76. 全国大学生无人机相关竞赛
    { competition_name: '全国大学生无人机相关竞赛', title: '无人机设计与编程飞行', description: '无人机硬件设计、飞控系统、自主飞行编程及航拍技术教程', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生无人机相关竞赛', title: '无人机竞赛安全规范', description: '无人机飞行安全规范、竞赛场地要求及应急处置方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 职业技能类 (5个竞赛) =====
    // 77. 全国职业院校技能大赛
    { competition_name: '全国职业院校技能大赛', title: '职业技能大赛各赛项指南', description: '全国职业院校技能大赛各大类赛项规则、评分标准及备赛方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国职业院校技能大赛', title: '职业技能训练资源库', description: '装备制造、电子信息、交通运输等各赛项的技能训练资源', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 78. 全国大学生测绘学科创新创业智能大赛
    { competition_name: '全国大学生测绘学科创新创业智能大赛', title: '测绘技术与GIS应用教程', description: '测量学基础、GPS/GNSS技术、GIS软件操作及遥感数据处理', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生测绘学科创新创业智能大赛', title: '测绘竞赛备赛指南', description: '测绘竞赛各赛道规则解读、技能训练方法及注意事项', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 79. 全国大学生物流设计大赛
    { competition_name: '全国大学生物流设计大赛', title: '物流系统设计方法', description: '物流网络规划、仓储设计、配送路径优化等物流系统设计方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生物流设计大赛', title: '物流设计大赛获奖方案', description: '历届物流设计大赛获奖团队的设计方案和分析报告', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 80. 全国大学生BIM毕业设计创新大赛
    { competition_name: '全国大学生BIM毕业设计创新大赛', title: 'BIM技术入门与实战', description: 'Revit、Navisworks等BIM软件操作教程及建筑信息模型创建方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生BIM毕业设计创新大赛', title: 'BIM大赛获奖作品展示', description: '历届BIM毕业设计创新大赛获奖作品的模型展示和设计文档', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 81. 全国大学生智能建造与管理创新竞赛
    { competition_name: '全国大学生智能建造与管理创新竞赛', title: '智能建造技术概论', description: 'BIM+物联网+人工智能在建筑工程中的应用及智能建造案例', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生智能建造与管理创新竞赛', title: '智能建造竞赛获奖方案', description: '历届智能建造与管理创新竞赛获奖方案的技术路线和创新点', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // ===== 农学类 (3个竞赛) =====
    // 82. 全国大学生生命科学创新创业大赛
    { competition_name: '全国大学生生命科学创新创业大赛', title: '生命科学研究方法入门', description: '分子生物学、细胞生物学等实验技术及科研论文撰写方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生生命科学创新创业大赛', title: '生命科学创新创业大赛获奖作品', description: '历届生命科学创新创业大赛获奖作品的研究成果和商业计划', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 83. 全国大学生动物科学专业技能大赛
    { competition_name: '全国大学生动物科学专业技能大赛', title: '动物科学专业技能训练', description: '动物解剖、饲料分析、繁殖技术等专业技能操作规范和训练方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生动物科学专业技能大赛', title: '动物科学竞赛备赛指南', description: '动物科学技能大赛各赛项评分标准、备赛策略及注意事项', external_url: 'https://www.saikr.com/', file_type: 'link' },
    // 84. 全国大学生植物保护专业能力大赛
    { competition_name: '全国大学生植物保护专业能力大赛', title: '植物保护基础技能手册', description: '病虫害识别、农药配制、植保方案设计等基本技能训练方法', external_url: 'https://www.saikr.com/', file_type: 'link' },
    { competition_name: '全国大学生植物保护专业能力大赛', title: '植保竞赛备赛经验分享', description: '植物保护专业能力大赛各赛项备赛策略和参赛经验', external_url: 'https://www.saikr.com/', file_type: 'link' },
];
export function seedResources(db: DatabaseWrapper): void {
    // 获取系统用户ID（使用ID=1作为系统用户）
    const systemUser = db.prepare('SELECT id FROM users WHERE id = 1').get();
    if (!systemUser) {
        db.prepare(`INSERT INTO users (id, username, email, password_hash, role) VALUES (1, 'system', 'system@localhost', '', 'admin')`).run();
    }
    const insertResource = db.prepare(`
    INSERT INTO resources (user_id, competition_id, title, description, file_name, file_path, file_type, file_size, external_url, is_external, review_status)
    VALUES (@userId, @competitionId, @title, @description, @fileName, @filePath, @fileType, @fileSize, @externalUrl, @isExternal, 'approved')
  `);
    for (const seed of resourceSeeds) {
        const competition = db.prepare('SELECT id FROM competitions WHERE name = @name').get({ name: seed.competition_name });
        if (competition) {
            insertResource.run({
                userId: 1,
                competitionId: competition.id,
                title: seed.title,
                description: seed.description,
                fileName: seed.title,
                filePath: '',
                fileType: seed.file_type,
                fileSize: 0,
                externalUrl: seed.external_url,
                isExternal: 1,
            });
        }
    }
}