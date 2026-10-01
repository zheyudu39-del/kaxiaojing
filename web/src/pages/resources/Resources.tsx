import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button, Card, Form, Input, Modal, Rate, Select, Space, Table, Tag, Typography, Upload, App,
} from 'antd'
import { DownloadOutlined, LinkOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import { resourceApi } from '@/api/learning'
import { competitionApi } from '@/api/competitions'
import { PageHeader } from '@/components/common'
import { useAuthStore } from '@/stores/auth'
import type { Resource, Competition } from '@/types'

const { Text } = Typography

const TYPE_META: Record<string, { label: string; color: string }> = {
  link: { label: '链接', color: 'blue' },
  file: { label: '文件', color: 'green' },
  pdf: { label: 'PDF', color: 'red' },
  doc: { label: '文档', color: 'geekblue' },
  video: { label: '视频', color: 'purple' },
}

export default function Resources() {
  const { message } = App.useApp()
  const token = useAuthStore((s) => s.token)

  const [list, setList] = useState<Resource[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [competitionId, setCompetitionId] = useState<number | undefined>()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await resourceApi.list({
        page,
        pageSize: 10,
        keyword: keyword || undefined,
        competition_id: competitionId,
      })
      setList(res?.resources ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      setList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, keyword, competitionId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    competitionApi.list({ pageSize: 200 }).then((r) => setCompetitions(r?.competitions ?? [])).catch(() => {})
  }, [])

  const create = async (values: any) => {
    setSubmitting(true)
    try {
      await resourceApi.create({
        title: values.title,
        description: values.description,
        competition_id: values.competition_id ? Number(values.competition_id) : undefined,
        url: values.url,
      } as any)
      message.success('资料已提交，等待管理员审核')
      setOpen(false)
      form.resetFields()
      load()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const rate = async (id: number, value: number) => {
    if (!token) return message.warning('请先登录')
    try {
      await resourceApi.rate(id, value)
      message.success('评分成功')
      setList((l) => l.map((r) => (r.id === id ? { ...r, rating: value } : r)))
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        title="资料库"
        description={`共 ${total} 份资料`}
        extra={
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={load}>
              刷新
            </Button>
            <Button
              icon={<DownloadOutlined />}
              href="/api/export/resources"
              target="_blank"
            >
              导出资源列表
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => (token ? setOpen(true) : message.warning('请先登录'))}
            >
              上传资料
            </Button>
          </Space>
        }
      />

      {/* 工具栏：所有控件统一 32px 高（修复旧版 44px vs 32px 不齐） */}
      <div className="toolbar-row" style={{ marginBottom: 16 }}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="按竞赛筛选"
          style={{ width: 260 }}
          value={competitionId}
          onChange={(v) => {
            setCompetitionId(v)
            setPage(1)
          }}
          options={competitions.map((c) => ({ label: c.name, value: c.id }))}
        />
        <Input.Search
          allowClear
          placeholder="搜索资料标题"
          style={{ width: 260 }}
          onSearch={(v) => {
            setKeyword(v)
            setPage(1)
          }}
        />
      </div>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={list}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            showSizeChanger: false,
            onChange: setPage,
            showTotal: (t) => `共 ${t} 条`,
          }}
          columns={[
            {
              title: '标题',
              dataIndex: 'title',
              ellipsis: true,
              render: (t: string, r: any) =>
                r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {t}
                  </a>
                ) : (
                  t
                ),
            },
            {
              title: '竞赛',
              dataIndex: 'competition_name',
              width: 200,
              ellipsis: true,
              render: (v: string, r: any) =>
                r.competition_id ? (
                  <Link to={`/competitions/${r.competition_id}`}>{v || `#${r.competition_id}`}</Link>
                ) : (
                  '-'
                ),
            },
            {
              title: '上传者',
              dataIndex: 'username',
              width: 110,
              render: (v: string, r: any) => (r.user_id ? <Link to={`/users/${r.user_id}`}>{v || `#${r.user_id}`}</Link> : '-'),
            },
            {
              title: '类型',
              dataIndex: 'file_type',
              width: 90,
              render: (t: string, r: any) => {
                const meta = TYPE_META[t] || (r.url ? TYPE_META.link : null)
                return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '-'
              },
            },
            {
              title: '大小',
              dataIndex: 'file_size',
              width: 90,
              render: (v: number) => (v ? `${(v / 1024).toFixed(0)} KB` : '-'),
            },
            { title: '下载量', dataIndex: 'download_count', width: 80, render: (v: number) => v ?? 0 },
            {
              title: '评分',
              dataIndex: 'rating',
              width: 150,
              render: (v: number, r: any) => (
                <Rate
                  value={v || 0}
                  count={5}
                  style={{ fontSize: 12 }}
                  onChange={(val) => rate(r.id, val)}
                />
              ),
            },
            { title: '上传时间', dataIndex: 'created_at', width: 170 },
            {
              title: '操作',
              width: 90,
              fixed: 'right',
              render: (_: any, r: any) =>
                r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    <Button type="link" size="small" icon={<LinkOutlined />}>
                      访问
                    </Button>
                  </a>
                ) : (
                  <a href={resourceApi.downloadUrl(r.id)} target="_blank" rel="noreferrer">
                    <Button type="link" size="small" icon={<DownloadOutlined />}>
                      下载
                    </Button>
                  </a>
                ),
            },
          ]}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title="上传资料"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={create}>
          <Form.Item name="title" label="资料标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="如：2025 年数学建模国赛优秀论文" maxLength={80} />
          </Form.Item>
          <Form.Item name="competition_id" label="关联竞赛">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="选择关联的竞赛"
              options={competitions.map((c) => ({ label: c.name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item
            name="url"
            label="资料链接"
            rules={[{ type: 'url', message: '请输入合法的 URL' }]}
          >
            <Input prefix={<LinkOutlined />} placeholder="https://... （网盘链接或官网地址）" />
          </Form.Item>
          <Form.Item name="description" label="资料说明">
            <Input.TextArea rows={3} maxLength={300} showCount placeholder="简单介绍这份资料" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前版本支持提交外链。文件直传功能需后端开通上传接口。
          </Text>
        </Form>
      </Modal>
    </div>
  )
}
