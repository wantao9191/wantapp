'use client'
import React, { useEffect, useState } from 'react'
import { Descriptions, Tag, Button, Card, Divider, Space, Typography } from 'antd'
import { CalendarOutlined, UserOutlined, MedicineBoxOutlined, TeamOutlined, HomeOutlined } from '@ant-design/icons'
import { useDict } from '@/hooks/useDict'
import ConfigModal from '@/components/ui/ConfigModal'
import dayjs from 'dayjs'
const {  Text } = Typography

interface CheckModalProps {
  open: boolean
  onCancel: () => void
  formData: any
}

export default function CheckModal({ open, onCancel, formData }: CheckModalProps) {
  const [formItems, setFormItems] = useState<any>(null)
  const { statusMap } = useDict()
  
  useEffect(() => {
    setFormItems(formData)
    console.log(formData)
  }, [formData])

  const checkContent = (
    <div className="space-y-6">
      {/* 排班信息 */}
      <Card 
        className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50" 
        size="small"
        title={
          <Space>
            <CalendarOutlined className="text-blue-500" />
            <Text strong className="text-gray-700">排班信息</Text>
          </Space>
        }
      >
        <Descriptions 
          bordered 
          className="bg-white rounded-lg" 
          column={2}
          size="small"
        >
          <Descriptions.Item className="font-medium" label="排班日期" span={2}>
            <Text className="text-gray-800">{dayjs(formItems?.startTime).format('YYYY-MM-DD') || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="开始时间">
            <Text className="text-gray-800">{dayjs(formItems?.startTime).format('HH:mm') || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="结束时间">
            <Text className="text-gray-800">{dayjs(formItems?.endTime).format('HH:mm') || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="状态" span={2}>
            <Tag 
              className="px-3 py-1 rounded-full text-sm font-medium"
              color={statusMap[formItems?.status]?.color || 'default'}
            >
              {statusMap[formItems?.status]?.label || '未知'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="备注" span={2}>
            <Text className="text-gray-600">{formItems?.description || '无'}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 护理套餐 */}
      <Card 
        className="shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50" 
        size="small"
        title={
          <Space>
            <MedicineBoxOutlined className="text-green-500" />
            <Text strong className="text-gray-700">护理套餐</Text>
          </Space>
        }
      >
        <Descriptions 
          bordered 
          className="bg-white rounded-lg" 
          column={2}
          size="small"
        >
          <Descriptions.Item className="font-medium" label="套餐名称">
            <Text className="text-gray-800 font-semibold">{formItems?.package?.name || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="服务时长">
            <Text className="text-gray-800">
              {formItems?.package?.minDuration || 0}分钟 - {formItems?.package?.maxDuration || 0}分钟
            </Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="护理服务" span={2}>
            <Space wrap>
              {formItems?.package?.tasks?.map((task: any) => (
                <Tag 
                  key={task.id} 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  color="blue"
                >
                  {task.name}
                </Tag>
              )) || <Text className="text-gray-400">无</Text>}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 护理员信息 */}
      <Card 
        className="shadow-sm border-0 bg-gradient-to-r from-purple-50 to-pink-50" 
        size="small"
        title={
          <Space>
            <UserOutlined className="text-purple-500" />
            <Text strong className="text-gray-700">护理员信息</Text>
          </Space>
        }
      >
        <Descriptions 
          bordered 
          className="bg-white rounded-lg" 
          column={2}
          size="small"
        >
          <Descriptions.Item className="font-medium" label="姓名">
            <Text className="text-gray-800 font-semibold">{formItems?.nurse?.name || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="性别">
            <Text className="text-gray-800">{formItems?.nurse?.gender || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="出生日期">
            <Text className="text-gray-800">{formItems?.nurse?.birthDate || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="年龄">
            <Text className="text-gray-800">{formItems?.nurse?.age || '-'}岁</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="联系电话">
            <Text className="text-gray-800">{formItems?.nurse?.mobile || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="身份证号">
            <Text className="text-gray-800 font-mono text-sm">{formItems?.nurse?.credential || '-'}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 参保人信息 */}
      <Card 
        className="shadow-sm border-0 bg-gradient-to-r from-orange-50 to-red-50" 
        size="small"
        title={
          <Space>
            <TeamOutlined className="text-orange-500" />
            <Text strong className="text-gray-700">参保人信息</Text>
          </Space>
        }
      >
        <Descriptions 
          bordered 
          className="bg-white rounded-lg" 
          column={2}
          size="small"
        >
          <Descriptions.Item className="font-medium" label="姓名">
            <Text className="text-gray-800 font-semibold">{formItems?.insured?.name || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="性别">
            <Text className="text-gray-800">{formItems?.insured?.gender || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="出生日期">
            <Text className="text-gray-800">{formItems?.insured?.birthDate || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="年龄">
            <Text className="text-gray-800">{formItems?.insured?.age || '-'}岁</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="联系电话">
            <Text className="text-gray-800">{formItems?.insured?.mobile || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="身份证号">
            <Text className="text-gray-800 font-mono text-sm">{formItems?.insured?.credential || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="地址" span={2}>
            <Text className="text-gray-600 flex items-center">
              <HomeOutlined className="mr-2 text-gray-400" />
              {formItems?.insured?.address || '-'}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )

  return (
    <ConfigModal
      slots={{
        body: checkContent,
        footer: (
          <Space>
            <Button 
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              onClick={onCancel}
            >
              关闭
            </Button>
          </Space>
        )
      }}
    />
  )
}