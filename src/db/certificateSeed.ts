/* eslint-disable */
// 本文件由 dist 编译产物重建（服务器上原 src 目录已丢失）。
// 原始路径: src/db/certificateSeed.ts

// ===== 类型定义（自 .d.ts 还原）=====
import type { DatabaseWrapper } from './database';

const certs = [
    // ==================== 计算机等级考试 ====================
    { name: '全国计算机等级考试（NCRE）一级', category: '计算机类', description: '计算机基础及MS Office应用', fee: '80-150元（各省不同）', reg_time: '每年6月和12月', exam_time: '每年3月和9月', official_website: 'https://ncre.neea.edu.cn/', difficulty: '简单', target_audience: '所有大学生' },
    { name: '全国计算机等级考试（NCRE）二级', category: '计算机类', description: '程序设计/办公软件高级应用，含C/Python/Java/Office等', fee: '80-150元（各省不同）', reg_time: '每年6月和12月', exam_time: '每年3月和9月', official_website: 'https://ncre.neea.edu.cn/', difficulty: '中等', target_audience: '所有大学生' },
    { name: '全国计算机等级考试（NCRE）三级', category: '计算机类', description: '网络技术、数据库技术、信息安全技术', fee: '80-150元（各省不同）', reg_time: '每年6月和12月', exam_time: '每年3月和9月', official_website: 'https://ncre.neea.edu.cn/', difficulty: '较难', target_audience: '计算机相关专业' },
    { name: '全国计算机等级考试（NCRE）四级', category: '计算机类', description: '网络工程师、数据库工程师', fee: '80-150元（各省不同）', reg_time: '每年6月和12月', exam_time: '每年3月和9月', official_website: 'https://ncre.neea.edu.cn/', difficulty: '困难', target_audience: '计算机相关专业' },
    // ==================== 软考（初级/中级/高级） ====================
    { name: '程序员（软考初级）', category: '计算机类', description: '程序设计基础能力认证', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '中等', target_audience: '计算机相关专业' },
    { name: '网络管理员（软考初级）', category: '计算机类', description: '网络基础管理能力认证', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '中等', target_audience: '计算机相关专业' },
    { name: '信息处理技术员（软考初级）', category: '计算机类', description: '信息处理基础能力', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '简单', target_audience: '所有大学生' },
    { name: '软件设计师（软考中级）', category: '计算机类', description: '软件开发设计能力认证', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '较难', target_audience: '计算机相关专业' },
    { name: '网络工程师（软考中级）', category: '计算机类', description: '网络规划与设计能力', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '较难', target_audience: '计算机相关专业' },
    { name: '数据库系统工程师（软考中级）', category: '计算机类', description: '数据库设计与管理', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '较难', target_audience: '计算机相关专业' },
    { name: '信息安全工程师（软考中级）', category: '计算机类', description: '信息安全技术与管理', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '较难', target_audience: '信息安全专业' },
    { name: '系统集成项目管理工程师（软考中级）', category: '计算机类', description: 'IT项目管理能力', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '中等', target_audience: '计算机及管理类' },
    { name: '嵌入式系统设计师（软考中级）', category: '计算机类', description: '嵌入式系统开发设计', fee: '每科68-90元', reg_time: '每年8月', exam_time: '每年11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '较难', target_audience: '嵌入式/电子专业' },
    { name: '信息系统项目管理师（软考高级）', category: '计算机类', description: '大型IT项目管理', fee: '每科68-90元', reg_time: '每年3月和8月', exam_time: '每年5月和11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '困难', target_audience: '计算机高年级学生' },
    { name: '系统架构设计师（软考高级）', category: '计算机类', description: '系统架构设计能力', fee: '每科68-90元', reg_time: '每年8月', exam_time: '每年11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '困难', target_audience: '计算机高年级学生' },
    { name: '网络规划设计师（软考高级）', category: '计算机类', description: '大型网络规划设计', fee: '每科68-90元', reg_time: '每年8月', exam_time: '每年11月', official_website: 'https://www.ruankao.org.cn/', difficulty: '困难', target_audience: '网络工程专业' },
    // ==================== 华为认证 ====================
    { name: '华为HCIA-Datacom（初级）', category: 'IT厂商认证', description: '华为数通初级认证，网络基础知识', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '中等', target_audience: '网络/计算机专业' },
    { name: '华为HCIA-Cloud Computing（初级）', category: 'IT厂商认证', description: '华为云计算初级认证', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '中等', target_audience: '云计算/计算机专业' },
    { name: '华为HCIA-AI（初级）', category: 'IT厂商认证', description: '华为人工智能初级认证', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '中等', target_audience: '人工智能/计算机专业' },
    { name: '华为HCIA-Big Data（初级）', category: 'IT厂商认证', description: '华为大数据初级认证', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '中等', target_audience: '大数据/计算机专业' },
    { name: '华为HCIA-Security（初级）', category: 'IT厂商认证', description: '华为安全初级认证', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '中等', target_audience: '信息安全专业' },
    { name: '华为HCIA-Storage（初级）', category: 'IT厂商认证', description: '华为存储初级认证', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '中等', target_audience: '计算机相关专业' },
    { name: '华为HCIP-Datacom（中级）', category: 'IT厂商认证', description: '华为数通中级认证，企业网络高级技术', fee: '300美元（约2100元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '较难', target_audience: '网络/计算机专业' },
    { name: '华为HCIP-Cloud Computing（中级）', category: 'IT厂商认证', description: '华为云计算中级认证', fee: '300美元（约2100元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '较难', target_audience: '云计算/计算机专业' },
    { name: '华为HCIP-AI（中级）', category: 'IT厂商认证', description: '华为人工智能中级认证', fee: '300美元（约2100元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '较难', target_audience: '人工智能/计算机专业' },
    { name: '华为HCIE-Datacom（高级）', category: 'IT厂商认证', description: '华为数通专家级认证，含笔试+实验', fee: '笔试300美元+实验8000元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '困难', target_audience: '网络工程专业' },
    { name: '华为HCIE-Cloud Computing（高级）', category: 'IT厂商认证', description: '华为云计算专家级认证', fee: '笔试300美元+实验8000元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '困难', target_audience: '云计算专业' },
    { name: '华为HCIE-Security（高级）', category: 'IT厂商认证', description: '华为安全专家级认证', fee: '笔试300美元+实验8000元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://e.huawei.com/cn/talent/', difficulty: '困难', target_audience: '信息安全专业' },
    // ==================== 思科认证 ====================
    { name: '思科CCNA', category: 'IT厂商认证', description: '思科网络助理工程师认证', fee: '330美元（约2300元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications.html', difficulty: '中等', target_audience: '网络/计算机专业' },
    { name: '思科CCNP Enterprise', category: 'IT厂商认证', description: '思科网络高级工程师认证', fee: '核心考试400美元+选考300美元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.cisco.com/', difficulty: '较难', target_audience: '网络工程专业' },
    { name: '思科CCIE', category: 'IT厂商认证', description: '思科网络专家认证，业界顶级网络认证', fee: '笔试450美元+实验1600美元', reg_time: '全年可报名', exam_time: '全年预约', official_website: 'https://www.cisco.com/', difficulty: '困难', target_audience: '网络工程专业' },
    // ==================== 微软认证 ====================
    { name: '微软Azure Fundamentals (AZ-900)', category: 'IT厂商认证', description: '微软Azure云基础认证', fee: '165美元（约1150元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://learn.microsoft.com/zh-cn/certifications/', difficulty: '简单', target_audience: '计算机相关专业' },
    { name: '微软Azure Administrator (AZ-104)', category: 'IT厂商认证', description: '微软Azure管理员认证', fee: '165美元（约1150元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://learn.microsoft.com/zh-cn/certifications/', difficulty: '中等', target_audience: '云计算/计算机专业' },
    { name: '微软Azure Developer (AZ-204)', category: 'IT厂商认证', description: '微软Azure开发者认证', fee: '165美元（约1150元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://learn.microsoft.com/zh-cn/certifications/', difficulty: '中等', target_audience: '软件开发专业' },
    { name: '微软Azure AI Engineer (AI-102)', category: 'IT厂商认证', description: '微软Azure AI工程师认证', fee: '165美元（约1150元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://learn.microsoft.com/zh-cn/certifications/', difficulty: '较难', target_audience: '人工智能专业' },
    { name: '微软Azure Data Engineer (DP-203)', category: 'IT厂商认证', description: '微软Azure数据工程师认证', fee: '165美元（约1150元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://learn.microsoft.com/zh-cn/certifications/', difficulty: '较难', target_audience: '数据工程/大数据专业' },
    // ==================== AWS认证 ====================
    { name: 'AWS Cloud Practitioner', category: 'IT厂商认证', description: 'AWS云从业者基础认证', fee: '100美元（约700元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://aws.amazon.com/cn/certification/', difficulty: '简单', target_audience: '计算机相关专业' },
    { name: 'AWS Solutions Architect Associate', category: 'IT厂商认证', description: 'AWS解决方案架构师助理级', fee: '150美元（约1050元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://aws.amazon.com/cn/certification/', difficulty: '中等', target_audience: '云计算/计算机专业' },
    { name: 'AWS Developer Associate', category: 'IT厂商认证', description: 'AWS开发者助理级认证', fee: '150美元（约1050元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://aws.amazon.com/cn/certification/', difficulty: '中等', target_audience: '软件开发专业' },
    // ==================== 其他IT认证 ====================
    { name: '红帽RHCSA', category: 'IT厂商认证', description: '红帽认证系统管理员', fee: '约2400元', reg_time: '全年可报名', exam_time: '全年预约', official_website: 'https://www.redhat.com/zh/services/certification', difficulty: '中等', target_audience: 'Linux/运维专业' },
    { name: '红帽RHCE', category: 'IT厂商认证', description: '红帽认证工程师', fee: '约4800元', reg_time: '全年可报名', exam_time: '全年预约', official_website: 'https://www.redhat.com/zh/services/certification', difficulty: '较难', target_audience: 'Linux/运维专业' },
    { name: 'Oracle OCA (Java SE)', category: 'IT厂商认证', description: 'Oracle Java初级认证', fee: '245美元（约1700元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://education.oracle.com/', difficulty: '中等', target_audience: 'Java开发专业' },
    { name: 'Oracle OCP (Java SE)', category: 'IT厂商认证', description: 'Oracle Java高级认证', fee: '245美元（约1700元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://education.oracle.com/', difficulty: '较难', target_audience: 'Java开发专业' },
    { name: 'Oracle OCP (Database)', category: 'IT厂商认证', description: 'Oracle数据库管理员认证', fee: '245美元（约1700元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://education.oracle.com/', difficulty: '较难', target_audience: '数据库/计算机专业' },
    { name: 'PMP项目管理专业人士', category: 'IT厂商认证', description: 'PMI项目管理专业人士认证', fee: '3900元', reg_time: '全年可报名', exam_time: '全年多次', official_website: 'https://www.pmi.org/', difficulty: '较难', target_audience: '管理/计算机专业' },
    { name: 'Google Cloud Associate', category: 'IT厂商认证', description: '谷歌云助理工程师认证', fee: '200美元（约1400元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://cloud.google.com/certification', difficulty: '中等', target_audience: '云计算/计算机专业' },
    { name: 'Kubernetes CKA', category: 'IT厂商认证', description: 'Kubernetes管理员认证', fee: '395美元（约2750元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.cncf.io/certification/cka/', difficulty: '较难', target_audience: '云原生/运维专业' },
    { name: 'Kubernetes CKAD', category: 'IT厂商认证', description: 'Kubernetes应用开发者认证', fee: '395美元（约2750元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.cncf.io/certification/ckad/', difficulty: '较难', target_audience: '云原生/开发专业' },
    // ==================== 计算机学术认证 ====================
    { name: 'CCF CSP认证', category: '计算机类', description: '中国计算机学会软件能力认证', fee: '免费（CCF会员）/300元', reg_time: '考前一个月', exam_time: '每年3/6/9/12月', official_website: 'https://www.cspro.org/', difficulty: '较难', target_audience: '计算机专业' },
    { name: 'PAT程序设计能力考试（甲级）', category: '计算机类', description: '浙大主办，算法与数据结构', fee: '50元', reg_time: '考前一个月', exam_time: '每年2/5/9月', official_website: 'https://www.patest.cn/', difficulty: '较难', target_audience: '计算机专业' },
    { name: 'PAT程序设计能力考试（乙级）', category: '计算机类', description: '浙大主办，编程基础', fee: '30元', reg_time: '考前一个月', exam_time: '每年2/5/9月', official_website: 'https://www.patest.cn/', difficulty: '中等', target_audience: '计算机专业' },
    // ==================== 英语类 ====================
    { name: '大学英语四级（CET-4）', category: '英语类', description: '全国大学英语四级考试，大部分高校毕业要求', fee: '15-50元（各省不同）', reg_time: '每年3月和9月', exam_time: '每年6月和12月', official_website: 'https://cet.neea.edu.cn/', difficulty: '中等', target_audience: '所有在校大学生' },
    { name: '大学英语六级（CET-6）', category: '英语类', description: '全国大学英语六级考试，考研和就业加分项', fee: '15-50元（各省不同）', reg_time: '每年3月和9月', exam_time: '每年6月和12月', official_website: 'https://cet.neea.edu.cn/', difficulty: '较难', target_audience: '已通过四级的大学生' },
    { name: '英语专业四级（TEM-4）', category: '英语类', description: '英语专业本科生必考', fee: '约50-80元', reg_time: '每年12月', exam_time: '每年4月', official_website: 'http://tem.fltonline.cn/', difficulty: '较难', target_audience: '英语专业大二学生' },
    { name: '英语专业八级（TEM-8）', category: '英语类', description: '英语专业最高级别考试', fee: '约50-80元', reg_time: '每年12月', exam_time: '每年3月', official_website: 'http://tem.fltonline.cn/', difficulty: '困难', target_audience: '英语专业大四学生' },
    { name: '雅思（IELTS）', category: '英语类', description: '国际英语语言测试系统，留学必备', fee: '2170元', reg_time: '全年可报名', exam_time: '每月多场', official_website: 'https://www.chinaielts.org/', difficulty: '较难', target_audience: '有留学计划的学生' },
    { name: '托福（TOEFL iBT）', category: '英语类', description: '北美留学首选英语考试', fee: '2100元', reg_time: '全年可报名', exam_time: '每月多场', official_website: 'https://www.toefl.cn/', difficulty: '较难', target_audience: '有留学计划的学生' },
    { name: 'GRE', category: '英语类', description: '美国研究生入学考试', fee: '1665元', reg_time: '全年可报名', exam_time: '每月多场', official_website: 'https://www.ets.org/gre', difficulty: '困难', target_audience: '计划赴美读研学生' },
    { name: 'GMAT', category: '英语类', description: '商学院研究生入学考试', fee: '250美元（约1750元）', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.mba.com/', difficulty: '困难', target_audience: '计划读MBA学生' },
    { name: '翻译专业资格考试（CATTI）三级笔译', category: '英语类', description: '全国翻译专业资格三级笔译', fee: '每科约70-100元', reg_time: '每年3月和9月', exam_time: '每年6月和11月', official_website: 'https://www.catticenter.com/', difficulty: '较难', target_audience: '英语/翻译专业' },
    { name: '翻译专业资格考试（CATTI）三级口译', category: '英语类', description: '全国翻译专业资格三级口译', fee: '每科约70-100元', reg_time: '每年3月和9月', exam_time: '每年6月和11月', official_website: 'https://www.catticenter.com/', difficulty: '较难', target_audience: '英语/翻译专业' },
    { name: '翻译专业资格考试（CATTI）二级笔译', category: '英语类', description: '全国翻译专业资格二级笔译', fee: '每科约70-100元', reg_time: '每年3月和9月', exam_time: '每年6月和11月', official_website: 'https://www.catticenter.com/', difficulty: '困难', target_audience: '英语/翻译专业' },
    { name: 'BEC商务英语初级', category: '英语类', description: '剑桥商务英语初级证书', fee: '约530元', reg_time: '每年1月和7月', exam_time: '每年5月和11月', official_website: 'http://bec.neea.edu.cn/', difficulty: '中等', target_audience: '商务/英语专业' },
    { name: 'BEC商务英语中级', category: '英语类', description: '剑桥商务英语中级证书', fee: '约660元', reg_time: '每年1月和7月', exam_time: '每年5月和11月', official_website: 'http://bec.neea.edu.cn/', difficulty: '较难', target_audience: '商务/英语专业' },
    { name: 'BEC商务英语高级', category: '英语类', description: '剑桥商务英语高级证书', fee: '约800元', reg_time: '每年1月和7月', exam_time: '每年5月和11月', official_website: 'http://bec.neea.edu.cn/', difficulty: '困难', target_audience: '商务/英语专业' },
    // ==================== 其他语言类 ====================
    { name: '日语能力考试N1', category: '语言类', description: '日本语能力测试最高级', fee: '550元', reg_time: '每年3月和8月', exam_time: '每年7月和12月', official_website: 'https://jlpt.neea.edu.cn/', difficulty: '困难', target_audience: '日语专业学生' },
    { name: '日语能力考试N2', category: '语言类', description: '日本语能力测试二级', fee: '550元', reg_time: '每年3月和8月', exam_time: '每年7月和12月', official_website: 'https://jlpt.neea.edu.cn/', difficulty: '较难', target_audience: '日语专业学生' },
    { name: '韩语TOPIK（中高级）', category: '语言类', description: '韩国语能力考试中高级', fee: '400元', reg_time: '每年1月和6月', exam_time: '每年4月和10月', official_website: 'https://topik.neea.edu.cn/', difficulty: '较难', target_audience: '韩语专业学生' },
    { name: '法语DELF B2', category: '语言类', description: '法语学习文凭B2级', fee: '约1800元', reg_time: '考前2个月', exam_time: '每年3月和6月', official_website: 'http://www.ciep.fr/', difficulty: '较难', target_audience: '法语专业学生' },
    { name: '德语TestDaF', category: '语言类', description: '德福考试，德国留学语言证明', fee: '1800元', reg_time: '考前2个月', exam_time: '每年3/7/11月', official_website: 'https://testdaf.neea.edu.cn/', difficulty: '较难', target_audience: '德语专业/留德学生' },
    { name: '西班牙语DELE B2', category: '语言类', description: '西班牙语水平证书B2级', fee: '约1500元', reg_time: '考前2个月', exam_time: '每年5月和11月', official_website: 'https://dele.neea.edu.cn/', difficulty: '较难', target_audience: '西班牙语专业' },
    { name: '俄语等级考试（四级）', category: '语言类', description: '全国高校俄语专业四级', fee: '约50元', reg_time: '每年3月', exam_time: '每年5月', official_website: '', difficulty: '中等', target_audience: '俄语专业学生' },
    { name: 'HSK汉语水平考试（六级）', category: '语言类', description: '汉语水平考试最高级（留学生）', fee: '550元', reg_time: '考前一个月', exam_time: '全年多次', official_website: 'https://www.chinesetest.cn/', difficulty: '较难', target_audience: '外国留学生' },
    // ==================== 教师资格类 ====================
    { name: '教师资格证（幼儿园）', category: '教师资格类', description: '幼儿园教师资格考试', fee: '笔试每科70元，面试280元', reg_time: '每年1月和9月', exam_time: '笔试3月和10月，面试5月和1月', official_website: 'https://ntce.neea.edu.cn/', difficulty: '中等', target_audience: '学前教育专业' },
    { name: '教师资格证（小学）', category: '教师资格类', description: '小学教师资格考试，笔试+面试', fee: '笔试每科70元，面试280元', reg_time: '每年1月和9月', exam_time: '笔试3月和10月，面试5月和1月', official_website: 'https://ntce.neea.edu.cn/', difficulty: '中等', target_audience: '师范及非师范类' },
    { name: '教师资格证（初中）', category: '教师资格类', description: '初中教师资格考试', fee: '笔试每科70元，面试280元', reg_time: '每年1月和9月', exam_time: '笔试3月和10月，面试5月和1月', official_website: 'https://ntce.neea.edu.cn/', difficulty: '较难', target_audience: '师范及非师范类' },
    { name: '教师资格证（高中）', category: '教师资格类', description: '高中教师资格考试', fee: '笔试每科70元，面试280元', reg_time: '每年1月和9月', exam_time: '笔试3月和10月，面试5月和1月', official_website: 'https://ntce.neea.edu.cn/', difficulty: '较难', target_audience: '师范及非师范类' },
    { name: '普通话水平测试', category: '教师资格类', description: '教师资格认定必备', fee: '约50元', reg_time: '各地不同，全年可报', exam_time: '各地安排不同', official_website: 'https://www.cltt.org/', difficulty: '简单', target_audience: '所有大学生' },
    // ==================== 财会类 ====================
    { name: '初级会计职称', category: '财会类', description: '会计入门证书', fee: '每科56元', reg_time: '每年12月-1月', exam_time: '每年5月', official_website: 'http://kzp.mof.gov.cn/', difficulty: '中等', target_audience: '财会类专业' },
    { name: '中级会计职称', category: '财会类', description: '会计中级资格', fee: '每科56-70元', reg_time: '每年3月', exam_time: '每年9月', official_website: 'http://kzp.mof.gov.cn/', difficulty: '较难', target_audience: '财会类专业' },
    { name: '注册会计师（CPA）', category: '财会类', description: '财会领域含金量最高证书之一', fee: '每科60-100元', reg_time: '每年4月', exam_time: '专业阶段8月', official_website: 'https://cpaexam.cicpa.org.cn/', difficulty: '困难', target_audience: '财会类专业' },
    { name: 'ACCA（国际注册会计师）', category: '财会类', description: '英国特许公认会计师，国际认可', fee: '每科约1500-2500元', reg_time: '全年可报名', exam_time: '每年3/6/9/12月', official_website: 'https://www.accaglobal.com/', difficulty: '困难', target_audience: '财会/金融专业' },
    { name: 'CMA（美国管理会计师）', category: '财会类', description: '美国管理会计师认证', fee: '每科约2500元', reg_time: '全年可报名', exam_time: '每年1/2/5/6/9/10月', official_website: 'https://www.imanet.org/', difficulty: '较难', target_audience: '财会/管理专业' },
    { name: '税务师', category: '财会类', description: '全国税务师职业资格考试', fee: '每科98元', reg_time: '每年5-7月', exam_time: '每年11月', official_website: 'https://ksbm.ecctaa.cn/', difficulty: '较难', target_audience: '财税类专业' },
    { name: '审计师（初级）', category: '财会类', description: '初级审计专业技术资格', fee: '每科约50-70元', reg_time: '每年4-6月', exam_time: '每年9月', official_website: '', difficulty: '中等', target_audience: '审计/财会专业' },
    { name: '统计从业资格', category: '财会类', description: '统计行业入门证书', fee: '每科约50元', reg_time: '每年5-7月', exam_time: '每年9月', official_website: '', difficulty: '中等', target_audience: '统计/经济专业' },
    // ==================== 金融类 ====================
    { name: '证券从业资格', category: '金融类', description: '进入证券行业的入门证书', fee: '每科61元', reg_time: '考前1-2个月', exam_time: '全年多次', official_website: 'https://www.sac.net.cn/', difficulty: '中等', target_audience: '金融/经济类' },
    { name: '基金从业资格', category: '金融类', description: '基金行业入门证书', fee: '每科65元', reg_time: '考前1-2个月', exam_time: '全年多次', official_website: 'https://www.amac.org.cn/', difficulty: '中等', target_audience: '金融/经济类' },
    { name: '银行从业资格', category: '金融类', description: '银行业入门证书', fee: '每科80元', reg_time: '每年3月和8月', exam_time: '每年6月和10月', official_website: 'https://www.china-cba.net/', difficulty: '中等', target_audience: '金融/经济类' },
    { name: '期货从业资格', category: '金融类', description: '期货行业入门证书', fee: '每科65元', reg_time: '考前1-2个月', exam_time: '全年多次', official_website: 'http://www.cfachina.org/', difficulty: '中等', target_audience: '金融/经济类' },
    { name: '保险从业资格', category: '金融类', description: '保险行业入门证书', fee: '每科约60元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '金融/保险专业' },
    { name: 'CFA特许金融分析师（一级）', category: '金融类', description: '全球金融投资领域顶级认证', fee: '约7000-10000元', reg_time: '全年可报名', exam_time: '每年2/5/8/11月', official_website: 'https://www.cfainstitute.org/', difficulty: '困难', target_audience: '金融/经济专业' },
    { name: 'FRM金融风险管理师', category: '金融类', description: '全球风险管理领域权威认证', fee: '约5000-8000元', reg_time: '全年可报名', exam_time: '每年5月和11月', official_website: 'https://www.garp.org/', difficulty: '困难', target_audience: '金融/风险管理专业' },
    { name: '经济师（初级）', category: '金融类', description: '初级经济专业技术资格', fee: '每科约70元', reg_time: '每年7-8月', exam_time: '每年11月', official_website: '', difficulty: '中等', target_audience: '经济/金融专业' },
    // ==================== 法律类 ====================
    { name: '法律职业资格考试（法考）', category: '法律类', description: '从事法律职业的必备证书', fee: '客观题180元，主观题120元', reg_time: '每年6月', exam_time: '客观题9月，主观题10月', official_website: 'http://www.moj.gov.cn/', difficulty: '困难', target_audience: '法学专业' },
    { name: '专利代理师', category: '法律类', description: '专利代理人资格考试', fee: '每科约100元', reg_time: '每年7月', exam_time: '每年11月', official_website: 'http://www.cnipa.gov.cn/', difficulty: '较难', target_audience: '法学/理工科专业' },
    // ==================== 医学类 ====================
    { name: '护士执业资格', category: '医学类', description: '从事护理工作的必备证书', fee: '每人每科约70元', reg_time: '每年12月-1月', exam_time: '每年4月', official_website: 'https://www.21wecan.com/', difficulty: '中等', target_audience: '护理专业' },
    { name: '执业医师资格（临床）', category: '医学类', description: '临床医学执业医师资格', fee: '约500元', reg_time: '每年1月', exam_time: '实践技能6月，综合笔试8月', official_website: 'https://www.nmec.org.cn/', difficulty: '困难', target_audience: '临床医学专业' },
    { name: '执业药师', category: '医学类', description: '药学专业执业资格', fee: '每科约60-80元', reg_time: '每年8月', exam_time: '每年10月', official_website: '', difficulty: '较难', target_audience: '药学专业' },
    { name: '健康管理师（三级）', category: '医学类', description: '健康管理职业技能等级证书', fee: '约2000-4000元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '医学/公共卫生专业' },
    { name: '心理咨询师', category: '医学类', description: '心理咨询职业技能证书', fee: '约3000-5000元', reg_time: '全年可报名', exam_time: '每年5月和11月', official_website: '', difficulty: '中等', target_audience: '心理学专业' },
    { name: '营养师', category: '医学类', description: '公共营养师职业技能证书', fee: '约2000-4000元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '营养/食品专业' },
    // ==================== 工程类 ====================
    { name: '注册电气工程师（基础）', category: '工程类', description: '电气工程师基础考试', fee: '每科约70元', reg_time: '每年8月', exam_time: '每年10月', official_website: '', difficulty: '较难', target_audience: '电气工程专业' },
    { name: '注册结构工程师（基础）', category: '工程类', description: '结构工程师基础考试', fee: '每科约70元', reg_time: '每年8月', exam_time: '每年10月', official_website: '', difficulty: '较难', target_audience: '土木工程专业' },
    { name: '二级建造师', category: '工程类', description: '建筑行业入门级执业资格', fee: '每科约50-70元', reg_time: '每年2-3月', exam_time: '每年6月', official_website: '', difficulty: '中等', target_audience: '土木/建筑专业' },
    { name: '一级建造师', category: '工程类', description: '建筑行业高级执业资格', fee: '每科约50-70元', reg_time: '每年7月', exam_time: '每年9月', official_website: '', difficulty: '困难', target_audience: '土木/建筑专业' },
    { name: '注册消防工程师', category: '工程类', description: '消防安全技术工作资格', fee: '每科约65-80元', reg_time: '每年8-9月', exam_time: '每年11月', official_website: '', difficulty: '困难', target_audience: '消防/安全工程专业' },
    { name: '注册安全工程师', category: '工程类', description: '安全生产管理资格', fee: '每科约60-70元', reg_time: '每年8月', exam_time: '每年10月', official_website: '', difficulty: '较难', target_audience: '安全工程专业' },
    { name: '注册环保工程师（基础）', category: '工程类', description: '环保工程师基础考试', fee: '每科约70元', reg_time: '每年8月', exam_time: '每年10月', official_website: '', difficulty: '较难', target_audience: '环境工程专业' },
    { name: '测量员证书', category: '工程类', description: '工程测量职业技能证书', fee: '约300-500元', reg_time: '全年可报名', exam_time: '各地安排不同', official_website: '', difficulty: '中等', target_audience: '测绘/土木专业' },
    { name: 'CAD工程师认证', category: '工程类', description: 'AutoCAD工程师认证', fee: '约300-500元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: '', difficulty: '中等', target_audience: '工科类专业' },
    { name: 'BIM工程师', category: '工程类', description: '建筑信息模型技术认证', fee: '约350元', reg_time: '考前一个月', exam_time: '每年6月和12月', official_website: '', difficulty: '中等', target_audience: '土木/建筑专业' },
    // ==================== 设计/媒体类 ====================
    { name: 'Adobe Photoshop认证', category: '设计类', description: 'Adobe官方PS认证', fee: '约400-600元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.adobe.com/cn/', difficulty: '中等', target_audience: '设计/艺术专业' },
    { name: 'Adobe Illustrator认证', category: '设计类', description: 'Adobe官方AI认证', fee: '约400-600元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.adobe.com/cn/', difficulty: '中等', target_audience: '设计/艺术专业' },
    { name: 'Adobe Premiere Pro认证', category: '设计类', description: 'Adobe官方视频剪辑认证', fee: '约400-600元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.adobe.com/cn/', difficulty: '中等', target_audience: '影视/传媒专业' },
    { name: 'Adobe After Effects认证', category: '设计类', description: 'Adobe官方特效合成认证', fee: '约400-600元', reg_time: '全年可报名', exam_time: '全年随时预约', official_website: 'https://www.adobe.com/cn/', difficulty: '较难', target_audience: '影视/动画专业' },
    { name: '全国信息化工程师（NACG）', category: '设计类', description: '平面设计/网页设计/三维设计等方向', fee: '约200-400元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '设计/计算机专业' },
    { name: '1+X界面设计职业技能等级证书', category: '设计类', description: 'UI/UX设计职业技能认证', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '设计/计算机专业' },
    // ==================== 实用技能类 ====================
    { name: '机动车驾驶证（C1/C2）', category: '实用技能类', description: '小型汽车驾驶证', fee: '3000-6000元（各地不同）', reg_time: '全年可报名', exam_time: '随报随考', official_website: '', difficulty: '中等', target_audience: '所有大学生' },
    { name: '急救员证（红十字会）', category: '实用技能类', description: '应急救护员培训证书', fee: '约100-200元', reg_time: '全年可报名', exam_time: '各地安排不同', official_website: 'https://www.redcross.org.cn/', difficulty: '简单', target_audience: '所有大学生' },
    { name: '游泳救生员', category: '实用技能类', description: '游泳救生员职业资格', fee: '约800-1500元', reg_time: '每年4-8月', exam_time: '培训后考核', official_website: '', difficulty: '中等', target_audience: '体育/所有大学生' },
    { name: '导游资格证', category: '实用技能类', description: '全国导游人员资格考试', fee: '约200-300元', reg_time: '每年6-8月', exam_time: '每年11月', official_website: '', difficulty: '中等', target_audience: '旅游管理专业' },
    { name: '人力资源管理师（四级）', category: '实用技能类', description: '人力资源管理职业技能', fee: '约300-500元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '人力资源/管理专业' },
    { name: '物流师（初级）', category: '实用技能类', description: '物流管理职业技能证书', fee: '约300-500元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '物流管理专业' },
    { name: '电子商务师（四级）', category: '实用技能类', description: '电子商务职业技能证书', fee: '约300-500元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '中等', target_audience: '电商/市场营销专业' },
    { name: '社会工作者（初级）', category: '实用技能类', description: '社会工作职业资格', fee: '每科约60-80元', reg_time: '每年4月', exam_time: '每年6月', official_website: '', difficulty: '中等', target_audience: '社会工作专业' },
    { name: '秘书证（四级）', category: '实用技能类', description: '秘书职业技能等级证书', fee: '约300元', reg_time: '全年可报名', exam_time: '全年多次', official_website: '', difficulty: '简单', target_audience: '文秘/行政管理专业' },
    { name: '茶艺师', category: '实用技能类', description: '茶艺职业技能等级证书', fee: '约500-1000元', reg_time: '全年可报名', exam_time: '培训后考核', official_website: '', difficulty: '简单', target_audience: '所有大学生' },
    // ==================== 1+X职业技能等级证书 ====================
    { name: '1+X Web前端开发', category: '1+X证书', description: '教育部1+X Web前端开发职业技能等级证书', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '计算机/软件专业' },
    { name: '1+X大数据应用开发', category: '1+X证书', description: '教育部1+X大数据应用开发职业技能等级证书', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '大数据/计算机专业' },
    { name: '1+X云计算平台运维与开发', category: '1+X证书', description: '教育部1+X云计算职业技能等级证书', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '云计算/计算机专业' },
    { name: '1+X网络系统建设与运维', category: '1+X证书', description: '教育部1+X网络运维职业技能等级证书', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '网络工程专业' },
    { name: '1+X智能财税', category: '1+X证书', description: '教育部1+X智能财税职业技能等级证书', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '财会类专业' },
    { name: '1+X电子商务数据分析', category: '1+X证书', description: '教育部1+X电商数据分析职业技能等级证书', fee: '约300元', reg_time: '每学期', exam_time: '每学期末', official_website: '', difficulty: '中等', target_audience: '电商/数据分析专业' },
];
export function seedCertificates(db: DatabaseWrapper): void {
    const stmt = db.prepare(`
    INSERT INTO certificates (name, category, description, fee, reg_time, exam_time, official_website, difficulty, target_audience)
    VALUES (@name, @category, @description, @fee, @regTime, @examTime, @officialWebsite, @difficulty, @targetAudience)
  `);
    for (const cert of certs) {
        stmt.run({
            name: cert.name,
            category: cert.category,
            description: cert.description,
            fee: cert.fee,
            regTime: cert.reg_time,
            examTime: cert.exam_time,
            officialWebsite: cert.official_website,
            difficulty: cert.difficulty,
            targetAudience: cert.target_audience,
        });
    }
}