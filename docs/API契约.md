# 喀小竞 后端 API 契约

> 自动提取自 `server/src/routes/*.ts`，共 **326** 个端点，**53** 个挂载点。
> 生成时间：2026-10-01 16:32:21

## 总览

| 方法 | 数量 |
|---|---|
| GET | 181 |
| PUT | 19 |
| POST | 80 |
| DELETE | 35 |
| PATCH | 11 |

## 按模块

### activities  `/api/activities`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/activities/:id` | 公开 | 35 |
| GET | `/api/activities/following` | 登录 | 27 |
| GET | `/api/activities/my` | 登录 | 11 |
| GET | `/api/activities/user/:userId` | 公开 | 19 |

### admin  `/api/admin`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| PUT | `/api/admin/:type/:id/restore` | 管理员 | 316 |
| POST | `/api/admin/announcements` | 管理员 | 116 |
| GET | `/api/admin/awards` | 管理员 | 75 |
| POST | `/api/admin/awards` | 管理员 | 86 |
| DELETE | `/api/admin/awards/:id` | 管理员 | 106 |
| POST | `/api/admin/awards/batch` | 管理员 | 96 |
| GET | `/api/admin/competitions` | 管理员 | 18 |
| POST | `/api/admin/competitions` | 管理员 | 34 |
| DELETE | `/api/admin/competitions/:id` | 管理员 | 128 |
| PUT | `/api/admin/competitions/:id` | 管理员 | 44 |
| GET | `/api/admin/dashboard-stats` | 管理员 | 157 |
| GET | `/api/admin/export` | 管理员 | 167 |
| GET | `/api/admin/logs` | 管理员 | 144 |
| GET | `/api/admin/reviews` | 管理员 | 180 |
| GET | `/api/admin/reviews/:type/:id` | 管理员 | 208 |
| PUT | `/api/admin/reviews/:type/:id/approve` | 管理员 | 228 |
| PUT | `/api/admin/reviews/:type/:id/reject` | 管理员 | 256 |
| POST | `/api/admin/reviews/batch-approve` | 管理员 | 284 |
| GET | `/api/admin/reviews/stats` | 管理员 | 198 |
| POST | `/api/admin/upload/proof` | 管理员 | 294 |
| GET | `/api/admin/users` | 管理员 | 54 |
| PUT | `/api/admin/users/:id/role` | 管理员 | 65 |

### ai  `/api/ai`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/ai/chat` | 公开 | 12 |
| POST | `/api/ai/chat/stream` | 公开 | 38 |
| GET | `/api/ai/history` | 登录 | 87 |
| POST | `/api/ai/history` | 登录 | 75 |
| DELETE | `/api/ai/history/:id` | 登录 | 114 |
| GET | `/api/ai/history/:id` | 登录 | 98 |

### auth  `/api/auth`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/auth/forgot-password` | 公开 | 92 |
| POST | `/api/auth/login` | 公开 | 72 |
| POST | `/api/auth/login-code` | 公开 | 216 |
| POST | `/api/auth/logout` | 登录 | 88 |
| POST | `/api/auth/register` | 公开 | 56 |
| POST | `/api/auth/reset-password` | 公开 | 164 |
| POST | `/api/auth/send-code` | 公开 | 205 |
| POST | `/api/auth/verify-reset-code` | 公开 | 132 |

### awardCert  `/api/award-certs`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/award-certs` | 登录 | 20 |
| POST | `/api/award-certs` | 登录 | 81 |
| DELETE | `/api/award-certs/:id` | 登录 | 109 |
| GET | `/api/award-certs/:id` | 登录 | 68 |
| GET | `/api/award-certs/:id/render` | 登录 | 55 |
| POST | `/api/award-certs/auto-generate` | 登录 | 98 |
| GET | `/api/award-certs/stats` | 登录 | 31 |
| GET | `/api/award-certs/verify/:certNumber` | 公开 | 42 |

### badges  `/api/badges`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/badges/all` | 公开 | 11 |
| POST | `/api/badges/check` | 登录 | 29 |
| GET | `/api/badges/my` | 登录 | 15 |
| GET | `/api/badges/my/all` | 登录 | 22 |
| GET | `/api/badges/user/:userId` | 公开 | 41 |

### certPlans  `/api/cert-plans`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/cert-plans` | 登录 | 10 |
| DELETE | `/api/cert-plans/:certificateId` | 登录 | 32 |
| PUT | `/api/cert-plans/:certificateId` | 登录 | 28 |
| POST | `/api/cert-plans/:certificateId/checkin` | 登录 | 37 |
| GET | `/api/cert-plans/:certificateId/checkins` | 登录 | 49 |
| GET | `/api/cert-plans/my` | 登录 | 24 |

### certificates  `/api/certificates`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/certificates` | 公开 | 10 |
| GET | `/api/certificates/:id` | 公开 | 25 |
| GET | `/api/certificates/categories` | 公开 | 20 |

### chat  `/api/teams`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/teams/:teamId/messages` | 登录 | 11 |

### colleges  `/api/colleges`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/colleges` | 公开 | 10 |
| GET | `/api/colleges/:id/competitions` | 公开 | 40 |
| GET | `/api/colleges/:id/majors` | 公开 | 20 |

### competitionCompare  `/api/competitions/compare`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/competitions/compare` | 公开 | 10 |

### competitionExtras  `/api/competitions`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/competitions/:id/awards` | 公开 | 131 |
| GET | `/api/competitions/:id/difficulty` | 公开 | 39 |
| GET | `/api/competitions/:id/group-info` | 公开 | 63 |
| PUT | `/api/competitions/:id/group-info` | 登录 | 79 |
| GET | `/api/competitions/:id/my-review` | 登录 | 235 |
| GET | `/api/competitions/:id/prep-plan` | 公开 | 51 |
| PUT | `/api/competitions/:id/registration-url` | 登录 | 102 |
| DELETE | `/api/competitions/:id/reviews` | 登录 | 218 |
| GET | `/api/competitions/:id/reviews` | 公开 | 152 |
| POST | `/api/competitions/:id/reviews` | 登录 | 186 |
| POST | `/api/competitions/:id/stages` | 登录 | 248 |
| DELETE | `/api/competitions/:id/stages/:stageId` | 登录 | 288 |
| PUT | `/api/competitions/:id/stages/:stageId` | 登录 | 270 |
| GET | `/api/competitions/:id/timeline` | 公开 | 23 |

### competitions  `/api/competitions`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/competitions` | 公开 | 32 |
| POST | `/api/competitions` | 登录 | 97 |
| GET | `/api/competitions/:id` | 公开 | 60 |
| GET | `/api/competitions/:id/related` | 公开 | 87 |
| GET | `/api/competitions/categories` | 公开 | 13 |
| GET | `/api/competitions/deadline-soon` | 公开 | 23 |

### dashboard  `/api/dashboard`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/dashboard` | 公开 | 11 |

### dataDashboard  `/api/data-dashboard`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/data-dashboard/active-users` | 公开 | 84 |
| GET | `/api/data-dashboard/award-distribution` | 公开 | 47 |
| GET | `/api/data-dashboard/competitions-by-category` | 公开 | 20 |
| GET | `/api/data-dashboard/hot-competitions` | 公开 | 74 |
| GET | `/api/data-dashboard/overview` | 公开 | 11 |
| GET | `/api/data-dashboard/participants-by-category` | 公开 | 29 |
| GET | `/api/data-dashboard/participants-by-college` | 公开 | 38 |
| GET | `/api/data-dashboard/registration-trend` | 公开 | 56 |
| GET | `/api/data-dashboard/user-growth` | 公开 | 65 |

### export  `/api/export`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/export/:dataType` | 登录 | 64 |
| GET | `/api/export/admin/batch` | 管理员 | 28 |

### favorites  `/api/favorites`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/favorites` | 登录 | 53 |
| POST | `/api/favorites` | 登录 | 11 |
| DELETE | `/api/favorites/:competitionId` | 登录 | 34 |
| GET | `/api/favorites/:competitionId/tags` | 登录 | 129 |
| POST | `/api/favorites/:competitionId/tags` | 登录 | 81 |
| DELETE | `/api/favorites/:competitionId/tags/:tag` | 登录 | 109 |
| GET | `/api/favorites/by-tag/:tag` | 登录 | 75 |
| GET | `/api/favorites/check/:competitionId` | 登录 | 60 |
| GET | `/api/favorites/tags` | 登录 | 70 |

### feedback  `/api/feedback`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/feedback` | 公开 | 12 |
| GET | `/api/feedback/admin` | 管理员 | 39 |
| POST | `/api/feedback/admin/:id/reply` | 管理员 | 60 |
| PATCH | `/api/feedback/admin/:id/status` | 管理员 | 49 |
| GET | `/api/feedback/my` | 登录 | 31 |

### follows  `/api/follows`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| DELETE | `/api/follows/:userId` | 登录 | 35 |
| POST | `/api/follows/:userId` | 登录 | 22 |
| GET | `/api/follows/:userId/counts` | 公开 | 115 |
| GET | `/api/follows/:userId/followers` | 公开 | 88 |
| GET | `/api/follows/:userId/following` | 公开 | 74 |
| GET | `/api/follows/:userId/status` | 登录 | 128 |
| GET | `/api/follows/check/:userId` | 登录 | 102 |
| GET | `/api/follows/followers` | 登录 | 61 |
| GET | `/api/follows/following` | 登录 | 48 |

### growthReport  `/api/growth-report`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/growth-report` | 登录 | 11 |

### kanban  `/api/kanban`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| DELETE | `/api/kanban/task/:taskId` | 登录 | 89 |
| PATCH | `/api/kanban/task/:taskId` | 登录 | 66 |
| PATCH | `/api/kanban/task/:taskId/status` | 登录 | 45 |
| GET | `/api/kanban/team/:teamId` | 登录 | 11 |
| POST | `/api/kanban/team/:teamId` | 登录 | 23 |

### lobby  `/api/lobby`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/lobby/messages` | 公开 | 13 |
| POST | `/api/lobby/messages` | 登录 | 25 |
| DELETE | `/api/lobby/messages/:id` | 登录 | 63 |

### majors  `/api/majors`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/majors/:id/competitions` | 公开 | 10 |

### mentor  `/api/mentors`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/mentors` | 公开 | 11 |
| GET | `/api/mentors/:id` | 公开 | 55 |
| POST | `/api/mentors/:id/request` | 登录 | 88 |
| POST | `/api/mentors/:id/review` | 登录 | 131 |
| POST | `/api/mentors/apply` | 登录 | 66 |
| GET | `/api/mentors/my/applications` | 登录 | 30 |
| GET | `/api/mentors/my/info` | 登录 | 18 |
| GET | `/api/mentors/my/mentees` | 登录 | 36 |
| GET | `/api/mentors/my/mentors` | 登录 | 42 |
| GET | `/api/mentors/my/requests` | 登录 | 24 |
| PATCH | `/api/mentors/my/status` | 登录 | 48 |
| PATCH | `/api/mentors/request/:id` | 登录 | 115 |

### notebook  `/api/notebook`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/notebook` | 登录 | 20 |
| POST | `/api/notebook` | 登录 | 69 |
| DELETE | `/api/notebook/:id` | 登录 | 97 |
| GET | `/api/notebook/:id` | 登录 | 55 |
| PUT | `/api/notebook/:id` | 登录 | 83 |
| POST | `/api/notebook/:id/pin` | 登录 | 111 |
| GET | `/api/notebook/search` | 登录 | 32 |
| GET | `/api/notebook/stats` | 登录 | 44 |

### notifications  `/api/notifications`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/notifications` | 登录 | 11 |
| DELETE | `/api/notifications/:id` | 登录 | 70 |
| PUT | `/api/notifications/:id/read` | 登录 | 28 |
| DELETE | `/api/notifications/all` | 登录 | 60 |
| DELETE | `/api/notifications/batch` | 登录 | 46 |
| DELETE | `/api/notifications/read` | 登录 | 65 |
| PUT | `/api/notifications/read-all` | 登录 | 23 |
| GET | `/api/notifications/unread-count` | 登录 | 18 |

### onlineStatus  `/api/users/online-status`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/users/online-status` | 公开 | 14 |

### posts  `/api/posts`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/posts` | 公开 | 103 |
| POST | `/api/posts` | 登录 | 93 |
| DELETE | `/api/posts/:id` | 登录 | 178 |
| GET | `/api/posts/:id` | 公开 | 130 |
| PUT | `/api/posts/:id` | 登录 | 138 |
| POST | `/api/posts/:id/bookmark` | 登录 | 148 |
| POST | `/api/posts/:id/comments` | 登录 | 158 |
| DELETE | `/api/posts/:id/comments/:commentId` | 登录 | 205 |
| PUT | `/api/posts/:id/comments/:commentId` | 登录 | 193 |
| POST | `/api/posts/:id/like` | 登录 | 168 |
| GET | `/api/posts/bookmarks` | 登录 | 77 |
| POST | `/api/posts/upload-image` | 登录 | 84 |
| GET | `/api/posts/users/search` | 公开 | 65 |

### prepTodos  `/api/prep-todos`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/prep-todos` | 登录 | 11 |
| POST | `/api/prep-todos` | 登录 | 33 |
| DELETE | `/api/prep-todos/:id` | 登录 | 81 |
| PATCH | `/api/prep-todos/:id` | 登录 | 49 |
| POST | `/api/prep-todos/:id/toggle` | 登录 | 70 |
| GET | `/api/prep-todos/stats` | 登录 | 27 |
| GET | `/api/prep-todos/today` | 登录 | 21 |

### privateMessages  `/api/private-messages`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/private-messages` | 登录 | 30 |
| GET | `/api/private-messages/:userId` | 登录 | 61 |
| GET | `/api/private-messages/conversations` | 登录 | 50 |
| GET | `/api/private-messages/users/search` | 登录 | 13 |

### profile  `/api/profile`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/profile` | 登录 | 13 |
| PUT | `/api/profile` | 登录 | 22 |
| GET | `/api/profile/:userId` | 公开 | 136 |
| GET | `/api/profile/:userId/view-stats` | 登录 | 169 |
| POST | `/api/profile/avatar` | 登录 | 31 |
| POST | `/api/profile/awards` | 登录 | 55 |
| DELETE | `/api/profile/awards/:awardId` | 登录 | 65 |
| GET | `/api/profile/skills` | 登录 | 88 |
| POST | `/api/profile/skills` | 登录 | 93 |
| DELETE | `/api/profile/skills/:skill` | 登录 | 103 |
| POST | `/api/profile/upload-proof` | 登录 | 113 |

### qa  `/api/qa`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| DELETE | `/api/qa/answers/:id` | 登录 | 120 |
| PATCH | `/api/qa/answers/:id` | 登录 | 104 |
| GET | `/api/qa/questions` | 公开 | 11 |
| POST | `/api/qa/questions` | 登录 | 46 |
| DELETE | `/api/qa/questions/:id` | 登录 | 74 |
| GET | `/api/qa/questions/:id` | 公开 | 36 |
| PATCH | `/api/qa/questions/:id` | 登录 | 62 |
| GET | `/api/qa/questions/:id/answers` | 公开 | 86 |
| POST | `/api/qa/questions/:id/answers` | 登录 | 92 |
| POST | `/api/qa/questions/:questionId/accept/:answerId` | 登录 | 132 |
| GET | `/api/qa/questions/search` | 公开 | 19 |
| GET | `/api/qa/tags/popular` | 公开 | 30 |
| POST | `/api/qa/vote` | 登录 | 144 |
| POST | `/api/qa/votes/status` | 登录 | 159 |

### quiz  `/api/quiz`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/quiz` | 公开 | 11 |
| POST | `/api/quiz` | 登录 | 100 |
| GET | `/api/quiz/:id` | 公开 | 24 |
| GET | `/api/quiz/:id/leaderboard` | 公开 | 94 |
| GET | `/api/quiz/:id/questions` | 登录 | 34 |
| POST | `/api/quiz/:id/questions` | 登录 | 115 |
| POST | `/api/quiz/:id/submit` | 登录 | 40 |
| GET | `/api/quiz/my/attempts` | 登录 | 17 |

### ranking  `/api/ranking`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/ranking` | 公开 | 12 |
| POST | `/api/ranking/award` | 管理员 | 53 |

### ratings  `/api/ratings`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/ratings/:competitionId` | 公开 | 28 |
| POST | `/api/ratings/:competitionId` | 登录 | 11 |
| GET | `/api/ratings/:competitionId/my` | 登录 | 34 |

### recommend  `/api/recommend`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/recommend/deadline-soon` | 公开 | 31 |
| GET | `/api/recommend/personalized` | 登录 | 11 |
| GET | `/api/recommend/similar/:competitionId` | 公开 | 18 |
| GET | `/api/recommend/trending` | 公开 | 25 |

### recommendations  `/api/recommendations`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/recommendations` | 登录 | 11 |

### recruitments  `/api/recruitments`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/recruitments` | 公开 | 23 |
| POST | `/api/recruitments` | 登录 | 10 |
| DELETE | `/api/recruitments/:id` | 登录 | 57 |
| GET | `/api/recruitments/:id` | 公开 | 32 |
| GET | `/api/recruitments/:id/applications` | 登录 | 101 |
| POST | `/api/recruitments/:id/apply` | 登录 | 75 |
| PUT | `/api/recruitments/:id/close` | 登录 | 40 |
| PUT | `/api/recruitments/applications/:id` | 登录 | 115 |

### registrations  `/api/registrations`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/registrations` | 登录 | 11 |
| DELETE | `/api/registrations/:competitionId` | 登录 | 26 |
| GET | `/api/registrations/check/:competitionId` | 登录 | 45 |
| GET | `/api/registrations/my` | 登录 | 38 |

### resources  `/api/resources`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/resources` | 公开 | 49 |
| POST | `/api/resources` | 登录 | 13 |
| DELETE | `/api/resources/:id` | 登录 | 100 |
| GET | `/api/resources/:id/download` | 公开 | 59 |
| POST | `/api/resources/:id/rate` | 登录 | 72 |
| GET | `/api/resources/:id/rating` | 公开 | 94 |

### search  `/api/search`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/search` | 公开 | 10 |

### showcases  `/api/showcases`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/showcases` | 公开 | 11 |
| POST | `/api/showcases` | 登录 | 27 |
| GET | `/api/showcases/:showcaseId` | 公开 | 47 |
| DELETE | `/api/showcases/:showcaseId/like` | 登录 | 66 |
| POST | `/api/showcases/:showcaseId/like` | 登录 | 59 |
| GET | `/api/showcases/user/my` | 登录 | 21 |

### statistics  `/api/statistics`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/statistics/award-distribution` | 公开 | 42 |
| GET | `/api/statistics/awards-by-college` | 公开 | 45 |
| GET | `/api/statistics/awards-by-competition` | 公开 | 50 |
| GET | `/api/statistics/college-participation` | 公开 | 12 |
| GET | `/api/statistics/competition-popularity` | 公开 | 15 |
| GET | `/api/statistics/competition/:id` | 公开 | 21 |
| GET | `/api/statistics/monthly-trend` | 公开 | 18 |
| GET | `/api/statistics/overview` | 公开 | 9 |
| GET | `/api/statistics/participants-by-category` | 公开 | 39 |
| GET | `/api/statistics/ranking-by-category` | 公开 | 32 |
| GET | `/api/statistics/ranking-by-college` | 公开 | 29 |
| GET | `/api/statistics/registration-trend` | 公开 | 36 |

### studyBuddy  `/api/study-buddy`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/study-buddy/competition/:competitionId` | 登录 | 23 |
| GET | `/api/study-buddy/match` | 登录 | 12 |

### studyCheckin  `/api/study-checkin`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| DELETE | `/api/study-checkin/checkins/:checkinId` | 登录 | 92 |
| GET | `/api/study-checkin/plans` | 登录 | 22 |
| POST | `/api/study-checkin/plans` | 登录 | 33 |
| GET | `/api/study-checkin/plans/:planId/checkins` | 登录 | 64 |
| POST | `/api/study-checkin/plans/:planId/checkins` | 登录 | 75 |
| PATCH | `/api/study-checkin/plans/:planId/status` | 登录 | 48 |
| GET | `/api/study-checkin/stats` | 登录 | 12 |

### studyGroups  `/api/study-groups`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/study-groups` | 公开 | 11 |
| POST | `/api/study-groups` | 登录 | 17 |
| GET | `/api/study-groups/:groupId` | 公开 | 34 |
| POST | `/api/study-groups/:groupId/join` | 登录 | 46 |
| POST | `/api/study-groups/:groupId/leave` | 登录 | 53 |
| GET | `/api/study-groups/:groupId/members` | 公开 | 60 |
| GET | `/api/study-groups/:groupId/messages` | 登录 | 78 |
| POST | `/api/study-groups/:groupId/messages` | 登录 | 66 |
| GET | `/api/study-groups/user/my` | 登录 | 28 |

### subscriptions  `/api/subscriptions`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/subscriptions` | 登录 | 11 |
| DELETE | `/api/subscriptions/:competitionId` | 登录 | 22 |
| GET | `/api/subscriptions/check/:competitionId` | 登录 | 35 |
| GET | `/api/subscriptions/my` | 登录 | 29 |

### teacherCert  `/api/teacher-cert`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/teacher-cert/apply` | 登录 | 12 |
| GET | `/api/teacher-cert/status` | 登录 | 37 |

### teamFiles  `/api/team-files`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| DELETE | `/api/team-files/file/:fileId` | 登录 | 144 |
| GET | `/api/team-files/file/:fileId` | 登录 | 129 |
| GET | `/api/team-files/file/:fileId/download` | 登录 | 110 |
| PATCH | `/api/team-files/file/:fileId/move` | 登录 | 189 |
| PATCH | `/api/team-files/file/:fileId/rename` | 登录 | 164 |
| GET | `/api/team-files/team/:teamId` | 登录 | 69 |
| POST | `/api/team-files/team/:teamId/folder` | 登录 | 82 |
| GET | `/api/team-files/team/:teamId/search` | 登录 | 210 |
| POST | `/api/team-files/team/:teamId/upload` | 登录 | 98 |

### teamMatch  `/api/team-match`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/team-match` | 登录 | 10 |

### teams  `/api/teams`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| POST | `/api/teams` | 登录 | 62 |
| DELETE | `/api/teams/:teamId` | 登录 | 238 |
| GET | `/api/teams/:teamId` | 公开 | 110 |
| GET | `/api/teams/:teamId/invites` | 登录 | 284 |
| POST | `/api/teams/:teamId/invites` | 登录 | 259 |
| DELETE | `/api/teams/:teamId/invites/:inviteId` | 登录 | 308 |
| GET | `/api/teams/:teamId/join-requests` | 登录 | 135 |
| POST | `/api/teams/:teamId/join-requests` | 登录 | 125 |
| PUT | `/api/teams/:teamId/join-requests/:requestId` | 登录 | 155 |
| DELETE | `/api/teams/:teamId/leave` | 登录 | 227 |
| GET | `/api/teams/:teamId/members` | 公开 | 177 |
| DELETE | `/api/teams/:teamId/members/:userId` | 登录 | 194 |
| PUT | `/api/teams/:teamId/transfer-leader` | 登录 | 215 |
| GET | `/api/teams/all` | 公开 | 73 |
| GET | `/api/teams/competition/:competitionId` | 公开 | 100 |
| POST | `/api/teams/join-by-code` | 登录 | 330 |
| GET | `/api/teams/my` | 登录 | 90 |

### timeline  `/api/timeline`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/timeline/my` | 登录 | 17 |
| GET | `/api/timeline/my/growth` | 登录 | 41 |
| GET | `/api/timeline/my/milestones` | 登录 | 53 |
| GET | `/api/timeline/my/stats` | 登录 | 29 |
| GET | `/api/timeline/user/:userId` | 公开 | 11 |
| GET | `/api/timeline/user/:userId/growth` | 公开 | 35 |
| GET | `/api/timeline/user/:userId/milestones` | 公开 | 47 |
| GET | `/api/timeline/user/:userId/stats` | 公开 | 23 |

### weeklyReport  `/api/report`

| 方法 | 路径 | 鉴权 | 行 |
|---|---|---|---|
| GET | `/api/report/monthly` | 登录 | 22 |
| GET | `/api/report/weekly` | 登录 | 12 |
