import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card, Divider, Form, Input, Tabs, Typography, App } from 'antd'
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const login = useAuthStore((s) => s.login)
  const loginByCode = useAuthStore((s) => s.loginByCode)
  const loading = useAuthStore((s) => s.loading)

  const [tab, setTab] = useState<'password' | 'code'>('password')
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const from = (location.state as { from?: string } | null)?.from || '/dashboard'

  const onPasswordLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password)
      message.success('登录成功')
      navigate(from, { replace: true })
    } catch {
      /* 错误提示已由 axios 拦截器统一处理 */
    }
  }

  const onCodeLogin = async (values: { email: string; code: string }) => {
    try {
      await loginByCode(values.email, values.code)
      message.success('登录成功')
      navigate(from, { replace: true })
    } catch {
      /* ignore */
    }
  }

  const sendCode = async (email?: string) => {
    if (!email) {
      message.warning('请先填写邮箱')
      return
    }
    setSending(true)
    try {
      await authApi.sendCode(email)
      message.success('验证码已发送，请查收邮箱')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch {
      /* ignore */
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(135deg,#e6f4ff 0%,#f5f5f5 100%)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 400 }} styles={{ body: { padding: 28 } }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/logo.png" alt="喀小竞" style={{ width: 56, height: 56, borderRadius: 12 }} />
          <Title level={3} style={{ margin: '12px 0 4px' }}>
            喀小竞
          </Title>
          <Text type="secondary">大学生竞赛交流平台</Text>
        </div>

        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k as 'password' | 'code')}
          centered
          items={[
            {
              key: 'password',
              label: '密码登录',
              children: (
                <Form layout="vertical" onFinish={onPasswordLogin} requiredMark={false} size="large">
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="邮箱" autoComplete="email" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="current-password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: 'code',
              label: '验证码登录',
              children: (
                <Form layout="vertical" onFinish={onCodeLogin} requiredMark={false} size="large">
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="邮箱" autoComplete="email" />
                  </Form.Item>
                  <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
                    <Input
                      prefix={<SafetyOutlined />}
                      placeholder="6 位验证码"
                      maxLength={6}
                      suffix={
                        <Button
                          type="link"
                          size="small"
                          disabled={countdown > 0}
                          loading={sending}
                          onClick={() => {
                            const email = (document.querySelector('input[autocomplete="email"]') as HTMLInputElement)?.value
                            sendCode(email)
                          }}
                        >
                          {countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </Button>
                      }
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    登录
                  </Button>
                </Form>
              ),
            },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Link to="/forgot-password">
            <Text type="secondary" style={{ fontSize: 13 }}>
              忘记密码？
            </Text>
          </Link>
          <Text type="secondary" style={{ fontSize: 13 }}>
            还没有账号？
            <Link to="/register">立即注册</Link>
          </Text>
        </div>

        <Divider plain style={{ margin: '16px 0 0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            喀小竞 · 竞赛交流平台
          </Text>
        </Divider>
      </Card>
    </div>
  )
}
