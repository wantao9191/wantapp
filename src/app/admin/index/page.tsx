'use client'

import React from 'react'
import { Card, Row, Col, Progress, Avatar, List, Typography } from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  SettingOutlined, 
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const AdminDashboard = () => {
  // 模拟数据
  const statsData = [
    {
      title: '总用户数',
      value: 1234,
      icon: <UserOutlined />,
      color: '#1890ff',
      trend: '+12%',
      trendType: 'up'
    },
    {
      title: '组织数量',
      value: 56,
      icon: <TeamOutlined />,
      color: '#52c41a',
      trend: '+8%',
      trendType: 'up'
    },
    {
      title: '系统配置',
      value: 89,
      icon: <SettingOutlined />,
      color: '#faad14',
      trend: '+5%',
      trendType: 'up'
    },
    {
      title: '文档数量',
      value: 234,
      icon: <FileTextOutlined />,
      color: '#722ed1',
      trend: '-2%',
      trendType: 'down'
    }
  ]

  const recentActivities = [
    {
      title: '新用户注册',
      description: '用户 张三 刚刚注册了账号',
      avatar: <Avatar icon={<UserOutlined />} size="small" />,
      time: '2分钟前',
      status: 'success'
    },
    {
      title: '系统更新',
      description: '系统配置已更新到最新版本',
      avatar: <Avatar icon={<SettingOutlined />} size="small" />,
      time: '1小时前',
      status: 'info'
    },
    {
      title: '权限变更',
      description: '用户权限配置已修改',
      avatar: <Avatar icon={<TeamOutlined />} size="small" />,
      time: '3小时前',
      status: 'warning'
    },
    {
      title: '数据备份',
      description: '系统数据备份完成',
      avatar: <Avatar icon={<FileTextOutlined />} size="small" />,
      time: '6小时前',
      status: 'success'
    }
  ]

  const quickActions = [
    { title: '用户管理', icon: <UserOutlined />, color: '#1890ff' },
    { title: '组织管理', icon: <TeamOutlined />, color: '#52c41a' },
    { title: '角色管理', icon: <SettingOutlined />, color: '#faad14' },
    { title: '权限管理', icon: <FileTextOutlined />, color: '#722ed1' }
  ]

  return (
    <div className='w-full max-w-full overflow-hidden'>
      {/* 欢迎区域 */}
      <div className='mb-4'>
        <div className='bg-white border border-gray-200 rounded-lg p-4 relative overflow-hidden shadow-sm'>
          <div className='absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-full -translate-y-10 translate-x-10' />
          <div className='relative z-10'>
            <div className='flex items-center mb-2'>
              <div className='w-2 h-6 bg-primary-500 rounded-full mr-3' />
              <Title className='!mb-0 !text-xl text-gray-800' level={3}>
                欢迎回来，管理员！
              </Title>
            </div>
            <Text className='text-gray-600 text-sm'>
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </Text>
          </div>
        </div>
      </div>

      {/* 关键指标 */}
      <div className='mb-4'>
        <Row gutter={[12, 12]}>
          {statsData.map((item, index) => (
            <Col key={index} sm={6} xs={12}>
              <Card 
                className='h-full hover:shadow-md transition-all duration-300'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1 min-w-0'>
                    <Text className='text-gray-500 text-xs block mb-1'>{item.title}</Text>
                    <div className='flex items-baseline'>
                      <Title className='!mb-0 !text-lg !leading-none' level={4}>{item.value}</Title>
                      <div className={`ml-1 flex items-center text-xs ${
                        item.trendType === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.trendType === 'up' ? <RiseOutlined /> : <FallOutlined />}
                        <span className='ml-0.5'>{item.trend}</span>
                      </div>
                    </div>
                  </div>
                  <div 
                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0'
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 主要内容区域 */}
      <Row gutter={[12, 12]}>
        {/* 系统状态 */}
        <Col lg={16} xs={24}>
          <Card className='h-full' size="small" title="系统状态">
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-shrink-0 text-center'>
                <Progress
                  format={() => (
                    <div className='text-center'>
                      <div className='text-lg font-bold text-green-500'>85%</div>
                      <div className='text-xs text-gray-500'>系统健康度</div>
                    </div>
                  )}
                  percent={85}
                  size={100}
                  strokeColor="#52c41a"
                  type="circle"
                />
              </div>
              <div className='flex-1 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <CheckCircleOutlined className='text-green-500 mr-2 text-sm' />
                    <span className='text-sm'>数据库连接</span>
                  </div>
                  <span className='text-green-500 font-medium text-sm'>正常</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <CheckCircleOutlined className='text-green-500 mr-2 text-sm' />
                    <span className='text-sm'>API服务</span>
                  </div>
                  <span className='text-green-500 font-medium text-sm'>正常</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <ClockCircleOutlined className='text-yellow-500 mr-2 text-sm' />
                    <span className='text-sm'>缓存服务</span>
                  </div>
                  <span className='text-yellow-500 font-medium text-sm'>维护中</span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <ExclamationCircleOutlined className='text-red-500 mr-2 text-sm' />
                    <span className='text-sm'>文件存储</span>
                  </div>
                  <span className='text-red-500 font-medium text-sm'>异常</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 快速操作 */}
        <Col lg={8} xs={24}>
          <Card className='h-full' size="small" title="快速操作">
            <div className='grid grid-cols-2 gap-3'>
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className='h-16 flex flex-col items-center justify-center border-2 rounded-lg hover:shadow-sm transition-all duration-300 cursor-pointer'
                  style={{ 
                    borderColor: action.color,
                    color: action.color
                  }}
                >
                  <div className='text-lg mb-1'>{action.icon}</div>
                  <div className='text-xs font-medium text-center leading-tight'>{action.title}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 底部区域 */}
      <Row className='mt-3' gutter={[12, 12]}>
        {/* 最近活动 */}
        <Col lg={12} xs={24}>
          <Card className='h-full' size="small" title="最近活动">
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item className='!px-0 !py-2'>
                  <List.Item.Meta
                    avatar={item.avatar}
                    description={<span className='text-xs text-gray-500'>{item.description}</span>}
                    title={
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-sm'>{item.title}</span>
                        <span className='text-xs text-gray-400'>{item.time}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 数据概览 */}
        <Col lg={12} xs={24}>
          <Card className='h-full' size="small" title="数据概览">
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                <div className='flex items-center'>
                  <BarChartOutlined className='text-blue-500 text-lg mr-2' />
                  <div>
                    <div className='font-medium text-sm'>今日访问量</div>
                    <div className='text-xl font-bold text-blue-600'>1,234</div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-green-500 text-xs'>+12%</div>
                  <div className='text-xs text-gray-500'>较昨日</div>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center'>
                  <PieChartOutlined className='text-green-500 text-lg mr-2' />
                  <div>
                    <div className='font-medium text-sm'>活跃用户</div>
                    <div className='text-xl font-bold text-green-600'>856</div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-green-500 text-xs'>+8%</div>
                  <div className='text-xs text-gray-500'>较昨日</div>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-purple-50 rounded-lg'>
                <div className='flex items-center'>
                  <LineChartOutlined className='text-purple-500 text-lg mr-2' />
                  <div>
                    <div className='font-medium text-sm'>系统负载</div>
                    <div className='text-xl font-bold text-purple-600'>45%</div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-gray-500 text-xs'>正常</div>
                  <div className='text-xs text-gray-500'>运行状态</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
