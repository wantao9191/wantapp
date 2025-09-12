'use client'
import { Button, Form, Input, Row, Col, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, CodeOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks'
import { useEffect, useState } from 'react'

export default function Login() {
  const [btnLoading, setBtnLoading] = useState(false)
  const { checked, setChecked, captcha, getCaptcha, login } = useAuth()
  const [form] = Form.useForm()
  
  const onFinish = async (values: any) => {
    try {
      setBtnLoading(true)
      await login(values.username, values.password, values.code)
      message.success('登录成功')
    } catch (error: any) {
      message.error(error.message)
      setBtnLoading(false)
    }
  }
  
  const initLoginInfo = () => {
    const loginInfo = localStorage.getItem('login_info')
    if (loginInfo) {
      const { username, password } = JSON.parse(loginInfo)
      if (username && password) {
        form.setFieldsValue({ username, password })
        setChecked(true)
      }
    }
  }
  
  useEffect(() => {
    initLoginInfo()
    getCaptcha()
  }, [])

  return (
    <div className="login-page min-h-screen w-full gradient-bg relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-100/40 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* 左侧品牌展示区域 */}
        <div className="w-3/5 relative flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/login-cover.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 via-primary-500/70 to-primary-700/80" />
          
          <div className="relative z-20 text-center text-white px-8 max-w-lg animate-fade-in">
            <div className="mb-8">
              <SafetyOutlined className="text-6xl mb-4 text-white/90" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              专业照护
              <span className="block text-primary-200">让家人更放心</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              为每一位老人提供贴心的照护服务，用科技守护温暖
            </p>
            <div className="flex justify-center space-x-8 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-sm">服务家庭</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm">全天守护</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99%</div>
                <div className="text-sm">满意度</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录区域 */}
        <div className="w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md animate-slide-up">
            {/* 登录卡片 */}
            <div className="card p-8">
              {/* 头部信息 */}
              <div className="text-center mb-6">
                <div className="logo-container inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 shadow-glow border border-primary-200/50">
                  <img alt="logo" className="w-10 h-8 object-contain filter drop-shadow-sm" src="/logo.png" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎回来</h2>
                <p className="text-gray-500 text-sm">登录您的长护系统账户</p>
              </div>

              {/* 登录表单 */}
              <Form 
                className="space-y-1" 
                form={form} 
                layout="vertical"
                name="login"
                size="middle"
                onFinish={onFinish}
              >
                <Form.Item 
                  className="mb-4" 
                  name="username"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input 
                    className="input-modern h-10 text-sm" 
                    placeholder="请输入用户名"
                    prefix={<UserOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Form.Item 
                  className="mb-4" 
                  name="password"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password 
                    className="input-modern h-10 text-sm" 
                    placeholder="请输入密码"
                    prefix={<LockOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Form.Item 
                  className="mb-4" 
                  name="code"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Row gutter={8}>
                    <Col span={14}>
                      <Input 
                        className="input-modern h-10 text-sm" 
                        placeholder="请输入验证码"
                        prefix={<CodeOutlined className="text-gray-400" />}
                      />
                    </Col>
                    <Col span={10}>
                      <div className="captcha-container h-10">
                        {captcha && (
                          <img 
                            alt="验证码" 
                            className="w-full h-full object-cover" 
                            src={captcha} 
                            onClick={getCaptcha} 
                          />
                        )}
                      </div>
                    </Col>
                  </Row>
                </Form.Item>

                <Form.Item className="mb-4">
                  <div className="flex items-center justify-between">
                    <Checkbox 
                      checked={checked} 
                      className="text-gray-600 text-sm"
                      onChange={() => setChecked(!checked)}
                    >
                      记住密码
                    </Checkbox>
                    <a 
                      className="text-primary-500 hover:text-primary-600 text-xs font-medium transition-colors" 
                      href="javascript:void(0)"
                    >
                      忘记密码？
                    </a>
                  </div>
                </Form.Item>

                <Button 
                  block 
                  className="btn-primary h-10 text-sm font-medium shadow-lg" 
                  htmlType="submit" 
                  loading={btnLoading}
                  type="primary"
                >
                  {btnLoading ? '登录中...' : '立即登录'}
                </Button>
              </Form>

              {/* 底部信息 */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  登录即表示您同意我们的
                  <a className="text-primary-500 hover:text-primary-600 mx-1" href="#">服务条款</a>
                  和
                  <a className="text-primary-500 hover:text-primary-600 mx-1" href="#">隐私政策</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
