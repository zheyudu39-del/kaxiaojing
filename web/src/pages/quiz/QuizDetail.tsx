import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Alert, Button, Card, Divider, Empty, Progress, Radio, Space, Tag, Typography, App,
} from 'antd'
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { quizApi } from '@/api/learning'
import { Loading } from '@/components/common'

const { Title, Text, Paragraph } = Typography

export default function QuizDetail() {
  const { id = '' } = useParams()
  const { message } = App.useApp()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number; total_points: number; detail?: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [q, qs] = await Promise.all([quizApi.detail(id), quizApi.questions(id).catch(() => [])])
      setQuiz(q)
      setQuestions(qs)
    } catch {
      setQuiz(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    const unanswered = questions.filter((q) => !answers[String(q.id)])
    if (unanswered.length > 0) {
      message.warning(`还有 ${unanswered.length} 题未作答`)
      return
    }
    setSubmitting(true)
    try {
      const res: any = await quizApi.submit(id, answers)
      setResult(res)
      message.success(`得分 ${res?.score ?? 0} / ${res?.total_points ?? 0}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const parseOptions = (opts: any): { key: string; text: string }[] => {
    if (!opts) return []
    let arr = opts
    if (typeof opts === 'string') {
      try {
        arr = JSON.parse(opts)
      } catch {
        return []
      }
    }
    if (Array.isArray(arr)) {
      return arr.map((o: any, i: number) =>
        typeof o === 'string' ? { key: String.fromCharCode(65 + i), text: o } : { key: o.key ?? o.value ?? String.fromCharCode(65 + i), text: o.text ?? o.label ?? String(o) },
      )
    }
    if (typeof arr === 'object') {
      return Object.entries(arr).map(([k, v]) => ({ key: k, text: String(v) }))
    }
    return []
  }

  if (loading) return <Loading />
  if (!quiz) {
    return (
      <Card>
        <Empty description="测验不存在">
          <Link to="/quiz">
            <Button type="primary">返回知识测验</Button>
          </Link>
        </Empty>
      </Card>
    )
  }

  const answeredCount = Object.keys(answers).length
  const passed = result ? (result.score ?? 0) >= (quiz.pass_score ?? 60) : false

  return (
    <div style={{ maxWidth: 860 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
        返回
      </Button>

      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          {quiz.title}
        </Title>
        <Space size={12} wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {questions.length} 题
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            及格分 {quiz.pass_score ?? 60}
          </Text>
          {quiz.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {quiz.description}
            </Text>
          )}
        </Space>

        {!result && (
          <div style={{ marginTop: 16 }}>
            <Progress
              percent={questions.length ? Math.round((answeredCount / questions.length) * 100) : 0}
              size="small"
              format={() => `${answeredCount} / ${questions.length}`}
            />
          </div>
        )}
      </Card>

      {result && (
        <Alert
          style={{ marginTop: 16 }}
          type={passed ? 'success' : 'warning'}
          showIcon
          icon={passed ? <CheckCircleFilled /> : <CloseCircleFilled />}
          message={
            <Space size={8}>
              <Text strong>
                得分 {result.score} / {result.total_points}
              </Text>
              <Tag color={passed ? 'green' : 'orange'}>{passed ? '已通过' : '未通过'}</Tag>
            </Space>
          }
          description={passed ? '恭喜！继续保持。' : `及格分 ${quiz.pass_score ?? 60}，再刷一遍吧。`}
        />
      )}

      <div style={{ marginTop: 16 }}>
        {questions.map((q: any, idx: number) => {
          const opts = parseOptions(q.options)
          const detail = result?.detail?.find((d: any) => String(d.question_id ?? d.id) === String(q.id))
          const correct = detail?.correct_answer ?? q.correct_answer
          const mine = answers[String(q.id)]

          return (
            <Card key={q.id} size="small" style={{ marginBottom: 12 }}>
              <Space align="start" style={{ marginBottom: 10 }}>
                <Tag color="blue">{idx + 1}</Tag>
                <Text strong style={{ fontSize: 15 }}>
                  {q.question_text}
                </Text>
                {q.points != null && <Tag>{q.points} 分</Tag>}
              </Space>

              {opts.length > 0 ? (
                <Radio.Group
                  value={mine}
                  onChange={(e) => setAnswers((a) => ({ ...a, [String(q.id)]: e.target.value }))}
                  disabled={!!result}
                  style={{ display: 'block' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {opts.map((o) => {
                      const isCorrect = result && String(correct) === o.key
                      const isWrongPick = result && String(mine) === o.key && String(correct) !== o.key
                      return (
                        <Radio
                          key={o.key}
                          value={o.key}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: isCorrect ? '#f6ffed' : isWrongPick ? '#fff1f0' : undefined,
                          }}
                        >
                          <Text style={{ color: isCorrect ? '#52c41a' : isWrongPick ? '#ff4d4f' : undefined }}>
                            {o.key}. {o.text}
                          </Text>
                        </Radio>
                      )
                    })}
                  </Space>
                </Radio.Group>
              ) : (
                <Text type="secondary">（该题未提供选项）</Text>
              )}

              {result && q.explanation && (
                <>
                  <Divider style={{ margin: '10px 0' }} />
                  <Paragraph style={{ fontSize: 13, marginBottom: 0 }}>
                    <Text strong>解析：</Text>
                    {q.explanation}
                  </Paragraph>
                </>
              )}
            </Card>
          )
        })}
      </div>

      {!result ? (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" size="large" loading={submitting} onClick={submit} disabled={questions.length === 0}>
            提交答卷
          </Button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button
            size="large"
            onClick={() => {
              setResult(null)
              setAnswers({})
            }}
          >
            再答一次
          </Button>
          <Link to="/quiz">
            <Button size="large" type="primary">
              返回列表
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
