'use client'

import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import BasicLayout from '@/components/layouts/BasicLayout'

const { Title } = Typography
const { Search } = Input

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=zhang',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=li',
    createdAt: '2024-01-14',
    lastLogin: '2024-01-19',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    role: 'editor',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=wang',
    createdAt: '2024-01-13',
    lastLogin: '2024-01-18',
  },
]

const UsersPage = () => {
  const [users, setUsers] = useState(mockUsers)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [form] = Form.useForm()

  const columns = [
    {
      title: '用户信息',
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig = {
          admin: { color: 'red', text: '管理员' },
          editor: { color: 'blue', text: '编辑者' },
          user: { color: 'green', text: '普通用户' },
        }
        const config = roleConfig[role as keyof typeof roleConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setIsModalVisible(true)
  }

  const handleDelete = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
    message.success('用户删除成功')
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // 编辑用户
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...values }
            : user
        ))
        message.success('用户更新成功')
      } else {
        // 添加用户
        const newUser = {
          id: Date.now().toString(),
          ...values,
          avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${values.name}`,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: '-',
        }
        setUsers([...users, newUser])
        message.success('用户创建成功')
      }
      setIsModalVisible(false)
    } catch (error) {
      message.error('操作失败')
    }
  }

  return (
    <BasicLayout>
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>用户管理</Title>
          <Space>
            <Search
              placeholder="搜索用户"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加用户
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
          />
        </Card>

        {/* 添加/编辑用户模态框 */}
        <Modal
          title={editingUser ? '编辑用户' : '添加用户'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              name="name"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择角色">
                <Select.Option value="admin">管理员</Select.Option>
                <Select.Option value="editor">编辑者</Select.Option>
                <Select.Option value="user">普通用户</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Select.Option value="active">活跃</Select.Option>
                <Select.Option value="inactive">禁用</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingUser ? '更新' : '创建'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </BasicLayout>
  )
}

export default UsersPage
