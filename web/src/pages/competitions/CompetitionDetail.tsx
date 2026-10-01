import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Button, Card, Col, Descriptions, Divider, Empty, Input, List, Rate, Row, Space, Tabs, Tag, Typography, App,
} from 'antd'
import { HeartOutlined, HeartFilled, TeamOutlined, LinkOutlined } from '@ant-design/icons'
import { competitionApi, registrationApi, subscriptionApi } from '@/api/competitions'
import { favoriteApi } from '@/api/me'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Competition } from '@/types'

const { Title, Paragraph, Text } = Typography

export default function CompetitionDetail() {
  const { id = '' } = useParams()
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [data, setData] = useState<Competition | null>(null)
  const [related, setRelated] = useState<Competition[]>([])
  const [stages, setStages] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [favored, setFavored] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      competitionApi.detail(id),
      competitionApi.related(id),
      competitionApi.timeline(id),
      competitionApi.reviews(id),
    ])
      .then(([d, r, t, rv]) => {
        if (d.status === 'fulfilled') setData(d.value)
        if (r.status === 'fulfilled') setRelated(Array.isArray(r.value) ? r.value : [])
        if (t.status === 'fulfilled') setStages(Array.isArray(t.value) ? t.value : [])
        if (rv.status === 'fulfilled') setReviews(rv.value?.reviews ?? [])
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!token) return
    favoriteApi.check(Number(id)).then((r) => setFavored(!!r?.favorited)).catch(() => {})
    registrationApi.check(id).then((r) => setRegistered(!!r?.registered)).catch(() => {})
    subscriptionApi.check(id).then((r) => setSubscribed(!!r?.subscribed)).catch(() => {})
    competitionApi.myReview(id).then((r: any) => {
      if (r) {
        setMyRating(r.rating ?? 0)
        setMyComment(r.content ?? '')
      }
    }).catch(() => {})
  }, [id, token])

  const toggleFav = async () => {
    if (!token) return message.warning('请先登录')
    try {
      if (favored) await favoriteApi.remove(Number(id))
      else await favoriteApi.add(Number(id))
      setFavored(!favored)
      message.success(favored ? '已取消收藏' : '已收藏')
    } catch { /* ignore */ }
  }

  const toggleRegister = async () => {
    if (!token) return message.warning('请先登录')
    try {
      if (registered) await registrationApi.cancel(id)
      else await registrationApi.create({ competition_id: Number(id) })
      setRegistered(!registered)
      message.success(registered ? '已取消报名' : '报名成功')
    } catch { /* ignore */ }
  }

  const toggleSubscribe = async () => {
    if (!token) return message.warning('请先登录')
    try {
      if (subscribed) await subscriptionApi.cancel(id)
      else await subscriptionApi.create({ competition_id: Number(id), reminder_days: 3 })
      setSubscribed(!subscribed)
      message.success(subscribed ? '已取消提醒' : '已开启报名提醒')
    } catch { /* ignore */ }
  }

  const submitReview = async () => {
    if (!token) return message.warning('请先登录')
    if (!myRating) return message.warning('请先评分')
    try {
      await competitionApi.createReview(id, { rating: myRating, content: myComment })
      message.success('评价已提交')
      const rv = await competitionApi.reviews(id)
      setReviews(rv?.reviews ?? [])
    } catch { /* ignore */ }
  }

  if (loading) return <Loading />
  if (!data) return <Empty description="竞赛不存在" style={{ padding: 48 }} />

  return (
    <div>
      <PageHeader
        title={data.name}
        description={
          <Space size={8} wrap>
            {data.category && <Tag color="blue">{data.category}</Tag>}
            {data.level && <Tag color="gold">{data.level}</Tag>}
            {data.format === 'team' ? <Tag>团队赛</Tag> : <Tag>个人赛</Tag>}
          </Space>
        }
        extra={
          <Space size={8}>
            <Button icon={favored ? <HeartFilled /> : <HeartOutlined />} onClick={toggleFav}>
              {favored ? '已收藏' : '收藏'}
            </Button>
            <Button onClick={toggleSubscribe}>{subscribed ? '已设提醒' : '报名提醒'}</Button>
            <Button type="primary" onClick={toggleRegister}>
              {registered ? '已报名' : '我要报名'}
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              items={[
                {
                  key: 'intro',
                  label: '竞赛介绍',
                  children: (
                    <>
                      <Paragraph>{data.description || '暂无介绍'}</Paragraph>
                      {data.requirements && (
                        <>
                          <Divider orientation="left" plain>参赛要求</Divider>
                          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{data.requirements}</Paragraph>
                        </>
                      )}
                      {data.target_audience && (
                        <>
                          <Divider orientation="left" plain>面向对象</Divider>
                          <Paragraph>{data.target_audience}</Paragraph>
                        </>
                      )}
                    </>
                  ),
                },
                {
                  key: 'stages',
                  label: `赛程安排 (${stages.length})`,
                  children:
                    stages.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无赛程" />
                    ) : (
                      <List
                        dataSource={stages}
                        renderItem={(s: any) => (
                          <List.Item>
                            <List.Item.Meta
                              title={s.name}
                              description={`${s.start_date || '待定'} ~ ${s.end_date || '待定'}`}
                            />
                          </List.Item>
                        )}
                      />
                    ),
                },
                {
                  key: 'reviews',
                  label: `评价 (${reviews.length})`,
                  children: (
                    <>
                      {token && (
                        <Card size="small" style={{ marginBottom: 12 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                              <Text>我的评分</Text>
                              <Rate value={myRating} onChange={setMyRating} />
                            </Space>
                            <Input.TextArea
                              rows={2}
                              value={myComment}
                              onChange={(e) => setMyComment(e.target.value)}
                              placeholder="说说你的参赛体验"
                            />
                            <Button type="primary" size="small" onClick={submitReview}>
                              提交评价
                            </Button>
                          </Space>
                        </Card>
                      )}
                      {reviews.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无评价" />
                      ) : (
                        <List
                          dataSource={reviews}
                          renderItem={(r: any) => (
                            <List.Item>
                              <List.Item.Meta
                                title={
                                  <Space>
                                    <Text strong>{r.username || '匿名'}</Text>
                                    <Rate disabled value={r.rating} style={{ fontSize: 12 }} />
                                  </Space>
                                }
                                description={r.content || '（未填写评价内容）'}
                              />
                            </List.Item>
                          )}
                        />
                      )}
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="基本信息" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="类别">{data.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="形式">{data.format === 'team' ? '团队赛' : '个人赛'}</Descriptions.Item>
              <Descriptions.Item label="报名费">{data.fee || '-'}</Descriptions.Item>
              <Descriptions.Item label="报名时间">
                {data.reg_start_month && data.reg_end_month
                  ? `${data.reg_start_month} 月 - ${data.reg_end_month} 月`
                  : '待公布'}
              </Descriptions.Item>
              <Descriptions.Item label="官网">
                {data.official_website ? (
                  <a href={data.official_website} target="_blank" rel="noreferrer">
                    <LinkOutlined /> 访问
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<TeamOutlined />} href={`/teams/competition/${data.id}`}>
                查看该竞赛的队伍
              </Button>
              <Button block href={`/recruitment?competition_id=${data.id}`}>
                相关招募
              </Button>
            </Space>
          </Card>

          {related.length > 0 && (
            <Card title="相关竞赛" size="small" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={related.slice(0, 6)}
                renderItem={(c) => (
                  <List.Item>
                    <Link to={`/competitions/${c.id}`}>{c.name}</Link>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}
