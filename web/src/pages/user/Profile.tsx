import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar, Button, Card, Col, Descriptions, Empty, Form, Input, List, Modal, Row, Select, Space,
  Table, Tag, Typography, Upload, App,
} from 'antd'
import { CameraOutlined, PlusOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons'
import { profileApi } from '@/api/me'
import { collegeApi } from '@/api/competitions'
import { Loading, PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { College } from '@/types'

const { Text } = Typography

const AWARD_LEVELS = [
  '国家级一等奖', '国家级二等奖', '国家级三等奖',
  '省级一等奖', '省级二等奖', '省级三等奖',
  '校级一等奖', '校级二等奖', '校级三等奖',
  '优秀奖', '参与奖',
]

export default function Profile() {
  const { message } = App.useApp()
  const user = useAuthStore((s) => s.user)
  const refresh = useAuthStore((s) => s.refresh)

  const [profile, setProfile] = useState<any>(null)
  const [colleges, setColleges] = useState<College[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [awardOpen, setAwardOpen] = useState(false)

  const [form] = Form.useForm()
  const [awardForm] = Form.useForm()

  const load = async () => {
    const [p, c, s] = await Promise.allSettled([profileApi.me(), collegeApi.list(), profileApi.skills()])
    if (p.status === 'fulfilled') {
      setProfile(p.value)
      form.setFieldsValue({
        username: p.value?.username,
        college: p.value?.college ?? undefined,
        major: p.value?.major ?? undefined,
        bio: p.value?.bio ?? '',
      })
    }
    if (c.status === 'fulfilled') setColleges(Array.isArray(c.value) ? c.value : [])
    if (s.status === 'fulfilled') setSkills(s.value)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (values: any) => {
    setSaving(true)
    try {
      const p = await profileApi.update(values)
      setProfile(p)
      await refresh()
      message.success('资料已保存')
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res: any = await profileApi.uploadAvatar(fd)
      message.success(res?.message || '头像已上传')
      await load()
      await refresh()
    } catch {
      /* ignore */
    }
    return false
  }

  const addSkill = async () => {
    const s = newSkill.trim()
    if (!s) return
    if (skills.includes(s)) {
      message.warning('该技能已存在')
      return
    }
    try {
      await profileApi.addSkill(s)
      setSkills([...skills, s])
      setNewSkill('')
    } catch {
      /* ignore */
    }
  }

  const removeSkill = async (s: string) => {
    try {
      await profileApi.removeSkill(s)
      setSkills(skills.filter((x) => x !== s))
    } catch {
      /* ignore */
    }
  }

  const submitAward = async (values: any) => {
    try {
      await profileApi.addAward(values)
      message.success('获奖记录已提交，等待审核')
      setAwardOpen(false)
      awardForm.resetFields()
      await load()
    } catch {
      /* ignore */
    }
  }

  const removeAward = async (id: number) => {
    try {
      await profileApi.removeAward(id)
      message.success('已删除')
      await load()
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <PageHeader
        title="个人中心"
        description="完善资料有助于找到合适的队友和导师"
        extra={
          <Link to={`/users/${user?.id}`}>
            <Button>查看我的主页</Button>
          </Link>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Upload
                showUploadList={false}
                accept="image/jpeg,image/png"
                beforeUpload={(f) => uploadAvatar(f as File)}
              >
                <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                  <Avatar size={96} src={profile?.avatar_url || undefined} icon={<UserOutlined />} />
                  <div
                    style={{
                      position: 'absolute', right: -2, bottom: -2, background: '#1890ff', color: '#fff',
                      borderRadius: '50%', width: 28, height: 28, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CameraOutlined />
                  </div>
                </div>
              </Upload>
              <div style={{ marginTop: 12, fontSize: 16, fontWeight: 500 }}>{profile?.username}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {profile?.email}
              </Text>
              {profile?.role === 'admin' && (
                <div style={{ marginTop: 6 }}>
                  <Tag color="gold">管理员</Tag>
                </div>
              )}
            </div>

            <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="学院">{profile?.college || '-'}</Descriptions.Item>
              <Descriptions.Item label="专业">{profile?.major || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="技能标签" size="small" style={{ marginTop: 16 }}>
            <Space wrap size={6}>
              {skills.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  还没有添加技能
                </Text>
              )}
              {skills.map((s) => (
                <Tag key={s} closable onClose={() => removeSkill(s)} color="blue">
                  {s}
                </Tag>
              ))}
            </Space>
            <Space.Compact style={{ width: '100%', marginTop: 12 }}>
              <Input
                size="small"
                placeholder="如：Python、数学建模"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onPressEnter={addSkill}
              />
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={addSkill}>
                添加
              </Button>
            </Space.Compact>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="基本资料">
            <Form form={form} layout="vertical" onFinish={save}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="用户名" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="college" label="学院">
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      placeholder="选择学院"
                      options={colleges.map((c) => ({ label: c.name, value: c.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="major" label="专业">
                    <Input placeholder="专业" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="bio" label="个人简介">
                    <Input.TextArea rows={3} maxLength={200} showCount placeholder="介绍一下自己" />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存资料
              </Button>
            </Form>
          </Card>

          <Card
            title={
              <span>
                <TrophyOutlined /> 获奖经历
              </span>
            }
            style={{ marginTop: 16 }}
            extra={
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setAwardOpen(true)}>
                添加获奖
              </Button>
            }
          >
            {!profile?.awards?.length ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有获奖记录" />
            ) : (
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={profile.awards}
                columns={[
                  { title: '竞赛', dataIndex: 'competition_name' },
                  { title: '奖项', dataIndex: 'award_level', width: 140 },
                  { title: '获奖时间', dataIndex: 'award_date', width: 120 },
                  {
                    title: '审核状态',
                    dataIndex: 'review_status',
                    width: 100,
                    render: (s: string) => {
                      const map: Record<string, [string, string]> = {
                        pending: ['处理中', 'processing'],
                        approved: ['已通过', 'success'],
                        rejected: ['未通过', 'error'],
                      }
                      const [label, color] = map[s] || ['未知', 'default']
                      return <Tag color={color}>{label}</Tag>
                    },
                  },
                  {
                    title: '操作',
                    width: 80,
                    render: (_: any, r: any) => (
                      <Button type="link" size="small" danger onClick={() => removeAward(r.id)}>
                        删除
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </Card>

          {profile?.participation_history?.length > 0 && (
            <Card title="参赛履历" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={profile.participation_history}
                renderItem={(h: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={h.competition_name || h.name}
                      description={h.created_at || h.status}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title="添加获奖记录"
        open={awardOpen}
        onCancel={() => setAwardOpen(false)}
        onOk={() => awardForm.submit()}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={awardForm} layout="vertical" onFinish={submitAward}>
          <Form.Item name="competition_id" label="竞赛" rules={[{ required: true, message: '请填写竞赛 ID' }]}>
            <Input type="number" placeholder="竞赛 ID（可在竞赛详情页地址栏获取）" />
          </Form.Item>
          <Form.Item name="award_level" label="奖项等级" rules={[{ required: true, message: '请选择奖项' }]}>
            <Select options={AWARD_LEVELS.map((l) => ({ label: l, value: l }))} placeholder="选择奖项" />
          </Form.Item>
          <Form.Item name="award_date" label="获奖时间" rules={[{ required: true, message: '请选择时间' }]}>
            <Input placeholder="如 2026-06-01" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交后需管理员审核通过才会公开展示。
          </Text>
        </Form>
      </Modal>
    </div>
  )
}
