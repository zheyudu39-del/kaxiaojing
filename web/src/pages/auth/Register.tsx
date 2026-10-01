import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Typography, App } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/auth'

const { Title, Text } = Typography

export default function Register() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const register = useAuthStore((s) => s.register)
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)

  const onFinish = async (values: { username: string; email: string; password: string }) => {
    try {
      await register(values.username, values.email, values.password)
      message.success('注册成功')
      // 注册后直接登录，省去一次输入
      try {
        await login(values.email, values.password)
        navigate('/dashboard', { replace: true })
      } catch {
        navigate('/login', { replace: true })
      }
    } catch {
      /* 错误提示已由拦截器处理 */
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
            注册
          </Title>
          <Text type="secondary">加入喀小竞，开启你的竞赛之旅</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度应为 2-20 个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少 6 位' },
              { pattern: /[A-Z]/, message: '密码必须包含至少一个大写字母' },
              { pattern: /[a-z]/, message: '密码必须包含至少一个小写字母' },
              { pattern: /[0-9]/, message: '密码必须包含至少一个数字' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="new-password" />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="密码要求：至少 6 位，包含大写字母、小写字母和数字"
          />

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            注册
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            已有账号？
            <Link to="/login">立即登录</Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}
