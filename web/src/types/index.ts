/** 通用分页响应 */
export interface Page<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
}

/** 用户 */
export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user' | string
  avatar_url?: string | null
  college?: string | null
  major?: string | null
  bio?: string | null
  created_at?: string
  follower_count?: number
  following_count?: number
}

export interface TokenPayload {
  userId: number
  email: string
  role: string
}

/** 学院 / 专业 */
export interface College {
  id: number
  name: string
}

export interface Major {
  id: number
  name: string
  college_id: number
}

/** 竞赛 */
export interface Competition {
  id: number
  name: string
  category: string
  description?: string
  target_audience?: string
  fee?: string
  format?: 'team' | 'individual' | string
  reg_start_month?: number | null
  reg_end_month?: number | null
  requirements?: string
  official_website?: string | null
  past_papers_url?: string | null
  level?: string | null
  difficulty?: number | null
  review_status?: string
  created_at?: string
  team_count?: number
  participant_count?: number
}

export interface CompetitionStage {
  id: number
  competition_id: number
  name: string
  start_date?: string | null
  end_date?: string | null
  description?: string | null
}

/** 队伍 */
export interface Team {
  id: number
  name: string
  competition_id: number
  leader_id: number
  description?: string | null
  max_members?: number
  status?: string
  created_at?: string
  member_count?: number
  leader_name?: string
  competition_name?: string
}

export interface TeamMember {
  id: number
  team_id: number
  user_id: number
  role: string
  joined_at?: string
  username?: string
  avatar_url?: string | null
}

export interface JoinRequest {
  id: number
  team_id: number
  user_id: number
  message?: string
  status: 'pending' | 'approved' | 'rejected' | string
  created_at?: string
  username?: string
  avatar_url?: string | null
}

/** 帖子 / 评论 */
export interface Post {
  id: number
  user_id: number
  title: string
  content: string
  category?: string
  tags?: string
  view_count?: number
  like_count?: number
  comment_count?: number
  review_status?: string
  created_at?: string
  username?: string
  avatar_url?: string | null
}

export interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  created_at?: string
  username?: string
  avatar_url?: string | null
}

/** 资料 */
export interface Resource {
  id: number
  user_id: number
  competition_id?: number | null
  title: string
  description?: string | null
  url?: string | null
  file_path?: string | null
  file_type?: string | null
  file_size?: number | null
  download_count?: number
  rating?: number | null
  review_status?: string
  created_at?: string
  username?: string
  competition_name?: string
}

/** 招募 */
export interface Recruitment {
  id: number
  user_id: number
  competition_id?: number | null
  title: string
  description?: string
  skills_needed?: string
  members_needed?: number
  status?: string
  created_at?: string
  username?: string
}

/** 证书 */
export interface Certificate {
  id: number
  name: string
  category: string
  description?: string
  level?: string
  official_website?: string | null
  exam_fee?: string | null
}

export interface CertPlan {
  id: number
  user_id: number
  certificate_id: number
  status?: string
  progress?: number
  target_date?: string | null
  created_at?: string
  certificate_name?: string
  checkin_count?: number
  streak?: number
}

/** 通知 */
export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  content?: string
  related_id?: number | null
  is_read: number
  created_at?: string
}

/** 徽章 */
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition?: string
  earned?: boolean
  earned_at?: string | null
}

/** 导师 */
export interface Mentor {
  id: number
  user_id: number
  introduction: string
  achievements: string
  skills?: string
  available_time?: string
  max_mentees?: number
  is_active?: number
  username?: string
  avatar_url?: string | null
  rating?: number | null
  mentee_count?: number
}

/** 问答 */
export interface QAQuestion {
  id: number
  user_id: number
  competition_id?: number | null
  title: string
  content: string
  tags?: string
  view_count?: number
  answer_count?: number
  is_solved?: number
  created_at?: string
  username?: string
  avatar_url?: string | null
}

export interface QAAnswer {
  id: number
  question_id: number
  user_id: number
  content: string
  is_accepted?: number
  vote_count?: number
  created_at?: string
  username?: string
  avatar_url?: string | null
}

/** 作品展示 */
export interface Showcase {
  id: number
  user_id: number
  competition_id: number
  title: string
  description?: string
  award_level: string
  award_year: number
  team_members?: string
  project_url?: string | null
  image_urls?: string | null
  like_count?: number
  created_at?: string
  username?: string
  competition_name?: string
}

/** 学习小组 */
export interface StudyGroup {
  id: number
  name: string
  description?: string
  category: string
  creator_id: number
  member_count?: number
  created_at?: string
}

/** 打卡 */
export interface StudyPlan {
  id: number
  user_id: number
  title: string
  description?: string
  daily_goal?: string
  start_date: string
  end_date: string
  status: string
  created_at?: string
}

export interface StudyCheckin {
  id: number
  user_id: number
  plan_id: number
  content?: string
  duration?: number
  checkin_date: string
  created_at?: string
}

/** 私信 */
export interface PrivateMessage {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: number
  created_at?: string
  sender_name?: string
  receiver_name?: string
}

export interface Conversation {
  user_id: number
  username: string
  avatar_url?: string | null
  last_message: string
  last_time: string
  unread_count: number
}

/** 动态 */
export interface Activity {
  id: number
  user_id: number
  activity_type: string
  target_type?: string | null
  target_id?: number | null
  content?: string
  created_at?: string
  username?: string
  avatar_url?: string | null
}

/** 排行 */
export interface RankingItem {
  user_id: number
  username: string
  avatar_url?: string | null
  score: number
  award_count?: number
  competition_count?: number
  rank: number
}

/** 待办 */
export interface PrepTodo {
  id: number
  user_id: number
  competition_id?: number | null
  certificate_id?: number | null
  title: string
  description?: string
  due_date?: string | null
  priority: number
  is_completed: number
  completed_at?: string | null
  created_at?: string
}

/** 看板任务 */
export interface TeamTask {
  id: number
  team_id: number
  creator_id: number
  title: string
  description?: string | null
  assignee_id?: number | null
  status: 'todo' | 'in_progress' | 'done' | string
  priority: 'low' | 'medium' | 'high' | string
  due_date?: string | null
  created_at?: string
  assignee_name?: string
}

/** 消息（队伍群聊 / 大厅） */
export interface ChatMessage {
  id: number
  team_id?: number
  user_id: number
  content: string
  created_at?: string
  username?: string
  avatar_url?: string | null
}
