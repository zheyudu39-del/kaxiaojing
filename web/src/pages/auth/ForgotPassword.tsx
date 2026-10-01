import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Steps, Typography, App } from 'antd'
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons'
import { authApi } from '@/api/auth'

const { Title, Text } = Typography

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const sendCode = async (values: { email: string }) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(values.email)
      setEmail(values.email)
      message.success('验证码已发送，请查收邮箱')
      setStep(1)
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
      setLoading(false)
    }
  }

  const verifyCode = async (values: { code: string }) => {
    setLoading(true)
    try {
      const res = await authApi.verifyResetCode({ email, code: values.code })
      setResetToken(res.resetToken)
      message.success('验证成功')
      setStep(2)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (values: { password: string }) => {
    setLoading(true)
    try {
      await authApi.resetPassword({ email, resetToken, password: values.password })
      message.success('密码重置成功，请重新登录')
      navigate('/login', { replace: true })
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
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
      <Card style={{ width: '100%', maxWidth: 420 }} styles={{ body: { padding: 28 } }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>
          找回密码
        </Title>

        <Steps
          size="small"
          current={step}
          items={[{ title: '验证邮箱' }, { title: '输入验证码' }, { title: '设置新密码' }]}
          style={{ marginBottom: 24 }}
        />

        {step === 0 && (
          <Form layout="vertical" onFinish={sendCode} requiredMark={false} size="large">
            <Form.Item
              name="email"
              rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="注册时使用的邮箱" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              发送验证码
            </Button>
          </Form>
        )}

        {step === 1 && (
          <Form layout="vertical" onFinish={verifyCode} requiredMark={false} size="large">
            <Text type="secondary" style={{ fontSize: 13 }}>
              验证码已发送至 {email}
            </Text>
            <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]} style={{ marginTop: 12 }}>
              <Input prefix={<SafetyOutlined />} placeholder="6 位验证码" maxLength={6} />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              下一步
            </Button>
            <Button type="link" block disabled={countdown > 0} onClick={() => sendCode({ email })}>
              {countdown > 0 ? `${countdown}s 后可重发` : '重新发送'}
            </Button>
          </Form>
        )}

        {step === 2 && (
          <Form layout="vertical" onFinish={resetPassword} requiredMark={false} size="large">
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度至少 6 位' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="新密码（至少 6 位）" />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              重置密码
            </Button>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login">
            <Text type="secondary" style={{ fontSize: 13 }}>
              返回登录
            </Text>
          </Link>
        </div>
      </Card>
    </div>
  )
}
