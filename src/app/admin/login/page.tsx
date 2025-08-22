'use client'
import { Button, Form, Input, Row, Col, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, CodeOutlined } from '@ant-design/icons'
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
    <div className="min-h-screen w-full flex">
      {/* 左侧背景区域 */}
      <div
        className="w-3/5 relative flex items-center justify-center bg-cover bg-center bg-no-repeat after:content-[''] after:absolute after:inset-0 after:bg-blue-500/50"
        style={{ backgroundImage: 'url(/login-cover.jpg)' }}
      >
        <div className="bg-white/20 backdrop-blur-md bg-opacity-50 text-white p-8 rounded-lg text-center max-w-md relative z-10">
          <h1 className="text-3xl font-bold mb-4">专业照护，让家人更放心</h1>
          <p className="text-lg">为每一位老人提供贴心的照护服务</p>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="w-2/5 bg-[#fff] flex items-center justify-center">
        <div className="w-[80%] max-w-480px text-left p-10px">
          <div className="text-2xl text-blue-500 font-bold">欢迎登录长护系统</div>
          <div className="text-sm text-gray-500">专业的长期护理评估与管理平台</div>
          <div className='mt-[20px] w-[80%]'>
            <Form name='login' form={form} onFinish={onFinish} >
              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input prefix={<UserOutlined />} placeholder='请输入用户名' />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder='请输入密码' />
              </Form.Item>
              <Form.Item name='code' rules={[{ required: true, message: '请输入验证码' }]}>
                <Row>
                  <Col span={16}>
                    <Input prefix={<CodeOutlined />} placeholder='请输入验证码' />
                  </Col>
                  <Col span={8}>
                    <div className='text-center h-full pl-2'>
                      {captcha && <img className='w-full h-32px cursor-pointer' src={captcha} alt="验证码" onClick={getCaptcha} />}
                    </div>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item>
                <Row>
                  <Col span={12}>
                    <Checkbox checked={checked} onChange={() => setChecked(!checked)}>记住密码</Checkbox>
                  </Col>
                  {/* <Col span={12} className='text-right'>
                    <a href="javascript:void(0)">忘记密码？</a>
                  </Col> */}
                </Row>
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={btnLoading}>登录</Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
