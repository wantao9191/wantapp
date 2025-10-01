'use client'
import React, { useEffect, useState } from 'react'
import { Descriptions, Tag, Button, Card, Divider, Space, Typography } from 'antd'
import { CalendarOutlined, MedicineBoxOutlined, HomeOutlined } from '@ant-design/icons'
import { useDict } from '@/hooks/useDict'
import ConfigModal from '@/components/ui/ConfigModal'
import dayjs from 'dayjs'
const { Text } = Typography
import { http } from '@/lib/https'

interface CheckModalProps {
  onCancel: () => void
  formData: any
}

export default function CheckModal({ onCancel, formData }: CheckModalProps) {
  const [formItems, setFormItems] = useState<any>(null)
  const [tasks, setTasks] = useState<any>([])
  const { statusMap } = useDict()
  const getTasks = async (id: string) => {
    const res = await http.get(`/admin/carePackages/${id}/tasks`)
    setTasks(res.data)
  }
  useEffect(() => {
    getTasks(formData?.schedulePlan?.package?.id)
    setFormItems(formData)
  }, [formData])

  const checkContent = (
    <div className="space-y-6">
      {/* 护理信息 */}
      <Card
        className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50"
        size="small"
        title={
          <Space>
            <CalendarOutlined className="text-blue-500" />
            <Text strong className="text-gray-700">护理信息</Text>
          </Space>
        }
      >
        <Descriptions
          bordered
          className="bg-white rounded-lg"
          column={2}
          size="small"
        >
          <Descriptions.Item className="font-medium" label="状态" span={1}>
            <Tag
              className="px-3 py-1 rounded-full text-sm font-medium"
            >
              {formItems?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="异常情况" span={1}>
            <Tag
              className="px-3 py-1 rounded-full text-sm font-medium"
            >
              {formItems?.alertStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="签到时间" span={1}>
            <Text className="text-gray-800">{formItems?.signInTime ? dayjs(formItems?.signInTime).format('YYYY-MM-DD') : '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="签到照片" span={1}>
            <Text className="text-gray-800"></Text>
          </Descriptions.Item>

          <Descriptions.Item className="font-medium" label="签到地点" span={2}>
            <Text className="text-gray-800">{formItems?.signInLocation || '-'}</Text>
          </Descriptions.Item>

          <Descriptions.Item className="font-medium" label="签退时间" span={1}>
            <Text className="text-gray-800">{formItems?.signOutTime ? dayjs(formItems?.signOutTime).format('HH:mm') : '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="签到照片" span={1}>
            <Text className="text-gray-800"></Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="签退地点" span={2}>
            <Text className="text-gray-800">{formItems?.signOutLocation || '-'}</Text>
          </Descriptions.Item>

          <Descriptions.Item className="font-medium" label="备注" span={2}>
            <Text className="text-gray-600">{formItems?.description || '无'}</Text>
          </Descriptions.Item>

          {/* 护理员信息 */}
          <Descriptions.Item className="font-medium" label="护理员姓名" span={1}>
            <Text className="text-gray-800 font-semibold">{formItems?.schedulePlan?.nurse?.name || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="护理员电话" span={1}>
            <Text className="text-gray-800">{formItems?.schedulePlan?.nurse?.mobile || '-'}</Text>
          </Descriptions.Item>

          {/* 参保人信息 */}
          <Descriptions.Item className="font-medium" label="参保人姓名" span={1}>
            <Text className="text-gray-800 font-semibold">{formItems?.schedulePlan?.insured?.name || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="参保人电话" span={1}>
            <Text className="text-gray-800">{formItems?.schedulePlan?.insured?.mobile || '-'}</Text>
          </Descriptions.Item>

        </Descriptions>
      </Card>
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
          <Descriptions.Item className="font-medium" label="服务地点" span={2}>
            <Text className="text-gray-600 flex items-center">
              <HomeOutlined className="mr-2 text-gray-400" />
              {formItems?.schedulePlan?.insured?.address || '-'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="排班日期" span={2}>
            <Text className="text-gray-800">{dayjs(formItems?.schedulePlan?.startTime).format('YYYY-MM-DD') || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="开始时间">
            <Text className="text-gray-800">{dayjs(formItems?.schedulePlan?.startTime).format('HH:mm') || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="结束时间">
            <Text className="text-gray-800">{dayjs(formItems?.schedulePlan?.endTime).format('HH:mm') || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="状态" span={2}>
            <Tag
              className="px-3 py-1 rounded-full text-sm font-medium"
              color={statusMap[formItems?.schedulePlan?.status]?.color || 'default'}
            >
              {statusMap[formItems?.schedulePlan?.status]?.label || '未知'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="备注" span={2}>
            <Text className="text-gray-600">{formItems?.schedulePlan?.description || '无'}</Text>
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
            <Text className="text-gray-800 font-semibold">{formItems?.schedulePlan?.package?.name || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="服务时长">
            <Text className="text-gray-800">
              {formItems?.schedulePlan?.package?.minDuration || 0}分钟 - {formItems?.schedulePlan?.package?.maxDuration || 0}分钟
            </Text>
          </Descriptions.Item>
          <Descriptions.Item className="font-medium" label="护理服务" span={2}>
            <Space wrap>
              {tasks?.map((task: any) => (
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