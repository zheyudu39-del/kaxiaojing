import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Avatar, Button, Card, Divider, Empty, Input, List, Space, Tag, Typography, App,
} from 'antd'
import {
  ArrowLeftOutlined, CommentOutlined, DeleteOutlined, EyeOutlined, LikeFilled, LikeOutlined,
  StarFilled, StarOutlined, UserOutlined,
} from '@ant-design/icons'
import { postApi } from '@/api/community'
import { Loading } from '@/components/common'
import { useAuthStore } from '@/stores/auth'

const { Title, Text, Paragraph } = Typography

export default function PostDetail() {
  const { id = '' } = useParams()
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const me = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p: any = await postApi.detail(id)
      setPost(p)
      setLiked(!!p?.liked)
      setBookmarked(!!p?.bookmarked)
      const cs: any = await postApi.comments(id).catch(() => [])
      setComments(Array.isArray(cs) ? cs : (cs?.comments ?? []))
    } catch {
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const toggleLike = async () => {
    if (!token) return message.warning('请先登录')
    try {
      const res: any = await postApi.like(id)
      setLiked(!!res?.liked)
      setPost((p: any) => ({ ...p, like_count: res?.like_count ?? p?.like_count }))
    } catch {
      /* ignore */
    }
  }

  const toggleBookmark = async () => {
    if (!token) return message.warning('请先登录')
    try {
      const res: any = await postApi.bookmark(id)
      setBookmarked(!!res?.bookmarked)
      message.success(res?.bookmarked ? '已收藏' : '已取消收藏')
    } catch {
      /* ignore */
    }
  }

  const submitComment = async () => {
    if (!token) return message.warning('请先登录')
    const text = content.trim()
    if (!text) return
    try {
      await postApi.addComment(id, text)
      setContent('')
      setReplyTo(null)
      message.success('评论成功')
      const cs: any = await postApi.comments(id).catch(() => [])
      setComments(Array.isArray(cs) ? cs : (cs?.comments ?? []))
    } catch {
      /* ignore */
    }
  }

  const removeComment = (commentId: number) => {
    modal.confirm({
      title: '删除这条评论？',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await postApi.removeComment(id, commentId)
          setComments((cs) => cs.filter((c) => c.id !== commentId))
          message.success('已删除')
        } catch {
          /* ignore */
        }
      },
    })
  }

  const removePost = () => {
    modal.confirm({
      title: '删除这篇帖子？',
      content: '删除后不可恢复。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await postApi.remove(id)
          message.success('已删除')
          navigate('/forum')
        } catch {
          /* ignore */
        }
      },
    })
  }

  if (loading) return <Loading />
  if (!post) {
    return (
      <Card>
        <Empty description="帖子不存在或已被删除">
          <Link to="/forum">
            <Button type="primary">返回经验分享</Button>
          </Link>
        </Empty>
      </Card>
    )
  }

  const isAuthor = me && (post.author_id === me.id || post.user_id === me.id)

  return (
    <div style={{ maxWidth: 900 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
        返回
      </Button>

      <Card>
        <Title level={3} style={{ marginTop: 0 }}>
          {post.title}
        </Title>
        <Space size={12} wrap style={{ marginBottom: 16 }}>
          <Space size={6}>
            <Avatar size="small" src={post.author_avatar || undefined} icon={<UserOutlined />} />
            <Link to={`/users/${post.author_id || post.user_id}`}>
              {post.author_username || post.username || `用户 #${post.author_id}`}
            </Link>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {post.created_at}
          </Text>
          <Space size={4}>
            <EyeOutlined />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {post.view_count ?? 0}
            </Text>
          </Space>
          {post.category && <Tag color="blue">{post.category}</Tag>}
        </Space>

        <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.9 }}>
          {post.content}
        </Paragraph>

        {post.tags && (
          <div style={{ marginTop: 8 }}>
            <Space wrap size={4}>
              {String(post.tags)
                .split(/[,，]/)
                .filter(Boolean)
                .map((t: string) => (
                  <Tag key={t} color="geekblue">
                    {t.trim()}
                  </Tag>
                ))}
            </Space>
          </div>
        )}

        <Divider style={{ margin: '16px 0' }} />

        <Space size={8}>
          <Button
            type={liked ? 'primary' : 'default'}
            icon={liked ? <LikeFilled /> : <LikeOutlined />}
            onClick={toggleLike}
          >
            {post.like_count ?? 0}
          </Button>
          <Button
            icon={bookmarked ? <StarFilled /> : <StarOutlined />}
            onClick={toggleBookmark}
          >
            {bookmarked ? '已收藏' : '收藏'}
          </Button>
          {isAuthor && (
            <Button danger icon={<DeleteOutlined />} onClick={removePost}>
              删除帖子
            </Button>
          )}
        </Space>
      </Card>

      <Card
        title={
          <span>
            <CommentOutlined /> 评论 ({comments.length})
          </span>
        }
        style={{ marginTop: 16 }}
      >
        {token ? (
          <div style={{ marginBottom: 16 }}>
            {replyTo && (
              <div style={{ marginBottom: 6, fontSize: 12, color: '#8c8c8c' }}>
                回复 @{replyTo.author_username || replyTo.username}
                <Button type="link" size="small" onClick={() => setReplyTo(null)}>
                  取消
                </Button>
              </div>
            )}
            <Input.TextArea
              rows={3}
              placeholder="写下你的看法…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              showCount
            />
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button type="primary" onClick={submitComment} disabled={!content.trim()}>
                发表评论
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              <Link to="/login">登录</Link> 后即可评论
            </Text>
          </div>
        )}

        {comments.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有评论，来抢沙发" />
        ) : (
          <List
            dataSource={comments}
            renderItem={(c: any) => (
              <List.Item
                actions={[
                  <Button key="r" type="link" size="small" onClick={() => setReplyTo(c)}>
                    回复
                  </Button>,
                  me && (c.author_id === me.id || c.user_id === me.id) ? (
                    <Button key="d" type="link" size="small" danger onClick={() => removeComment(c.id)}>
                      删除
                    </Button>
                  ) : null,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={<Avatar size="small" src={c.author_avatar || undefined} icon={<UserOutlined />} />}
                  title={
                    <Space size={6}>
                      <Text strong style={{ fontSize: 13 }}>
                        {c.author_username || c.username || `用户 #${c.author_id}`}
                      </Text>
                      {c.reply_to_username && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          回复 @{c.reply_to_username}
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    <>
                      <div style={{ whiteSpace: 'pre-wrap', color: 'inherit' }}>{c.content}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {c.created_at}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
