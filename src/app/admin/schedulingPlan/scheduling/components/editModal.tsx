import React, { useState, useEffect } from 'react'
import { Button, App, Form, Row, Col, Input, Radio, Space, Empty, Modal, Descriptions, Tag, TimePicker, DatePicker, Card, Typography, Divider } from 'antd'
import { UserOutlined, TeamOutlined, MedicineBoxOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ConfigModal from '@/components/ui/ConfigModal'
import { http } from '@/lib/https'
import InsuredModal from './insuredModal/insuredModal'
import NurseModal from './nurseModal/nurseModal'

const { Text } = Typography

interface EditModalProps {
  onCancel?: () => void
  onSubmit?: () => void
  onOpenInsured?: () => void
  onOpenNurse?: () => void
  formData: any
}

export default function EditModal({
  formData,
  onCancel,
  onSubmit
}: EditModalProps) {
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [openInsured, setOpenInsured] = useState(false)
  const [openNurse, setOpenNurse] = useState(false)
  const [insuredRecord, setInsuredRecord] = useState<any>(null)
  const [nurseRecord, setNurseRecord] = useState<any>(null)
  const { message } = App.useApp()

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    const { currentDate, startTime, endTime, ...rest } = values
    // 组合日期和时间
    const startDateTime = dayjs(currentDate).hour(startTime.hour()).minute(startTime.minute())
    const endDateTime = dayjs(currentDate).hour(endTime.hour()).minute(endTime.minute())
    const duration = Math.abs(endDateTime.diff(startDateTime, 'minute'))
    if (duration < insuredRecord?.package?.minDuration || duration > insuredRecord?.package?.maxDuration) {
      message.error(`服务时长不符合套餐要求,套餐要求${insuredRecord?.package?.minDuration}分钟 - ${insuredRecord?.package?.maxDuration}分钟,当前服务时长${duration}分钟,请重新选择!`)
      form.validateFields(['startTime', 'endTime'])
      return
    }
    try {
      setSubmitLoading(true)
      const params = {
        ...rest,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: duration,
      }
      if (formData?.id) {
        await http.put(`/admin/schedule/${formData.id}`, params)
      } else {
        await http.post('/admin/schedule', params)
      }
      message.success('操作成功')
      onSubmit?.()
    } catch (error: any) {
      console.error('提交失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  // 处理取消
  const handleCancel = () => {
    onCancel?.()
  }

  // 处理重置
  const handleReset = () => {
    form.resetFields()
    setInsuredRecord(null)
    setNurseRecord(null)
  }

  // 设置表单初始值
  useEffect(() => {
    if (formData) {
      const { insured, nurse, package: packageInfo, startTime, endTime, ...rest } = formData
      if(formData.id){
        setInsuredRecord({ ...insured, package: packageInfo })
        setNurseRecord(nurse)
        form.setFieldsValue({ ...rest, currentDate: dayjs(startTime), startTime: dayjs(startTime), endTime: dayjs(endTime), insuredId: insured.id, nurseId: nurse.id, packageId: packageInfo.id })

      }else {
        form.setFieldsValue({ ...rest, status: 1 })

      }
      
    }
  }, [formData, form])
  const handleAddInsured = () => {
    setOpenInsured(true)
  }
  const handleAddNurse = () => {
    setOpenNurse(true)
  }
  const handleSelectInsured = (record: any) => {
    form.setFieldsValue({
      insuredId: record.id,
      packageId: record.package?.id,
    })
    setInsuredRecord(record)
    setOpenInsured(false)
  }
  const handleSelectNurse = (record: any) => {
    form.setFieldsValue({
      nurseId: record.id,
    })
    setNurseRecord(record)
    setOpenNurse(false)
  }
  const formContent = (
    <div>
      <Form
        form={form}
        layout="vertical"
        size="middle"
        onFinish={handleSubmit}
        onFinishFailed={(errorInfo) => {
        }}
        onValuesChange={(changedValues, allValues) => {
          // 当开始时间改变时，强制重新渲染结束时间选择器
          if (changedValues.startTime) {
            // 触发结束时间字段的重新渲染
            form.setFieldsValue({ endTime: undefined })
          }
        }}
      >
        {/* 护理员信息 */}
        <Card 
          className="shadow-sm border-0 bg-gradient-to-r from-purple-50 to-pink-50" 
          size="small"
          style={{ marginBottom: '12px' }}
          title={
            <Space>
              <UserOutlined className="text-purple-500" />
              <Text strong className="text-gray-700">护理员信息</Text>
              <Button 
                className="text-purple-600 hover:text-purple-700 font-medium" 
                size="small" 
                type="link"
                onClick={handleAddNurse}
              >
                {form.getFieldValue('nurseId') ? '更换' : '选择'}护理员
              </Button>
            </Space>
          }
        >
          <Form.Item
            className="mb-0"
            name="nurseId"
            rules={[{ required: true, message: '请选择护理员' }]}
          >
            {form.getFieldValue('nurseId') ? (
              <Descriptions 
                bordered 
                className="bg-white rounded-lg" 
                column={2}
                size="small"
              >
                <Descriptions.Item className="font-medium" label="姓名">
                  <Text className="text-gray-800 font-semibold">{nurseRecord?.name || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="性别">
                  <Text className="text-gray-800">{nurseRecord?.gender || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="出生日期">
                  <Text className="text-gray-800">{nurseRecord?.birthDate || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="年龄">
                  <Text className="text-gray-800">{nurseRecord?.age || '-'}岁</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="联系电话">
                  <Text className="text-gray-800">{nurseRecord?.mobile || '-'}</Text>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty 
                className="py-8" 
                description="请选择护理员"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Form.Item>
        </Card>

        {/* 参保人信息 */}
        <Card 
          className="shadow-sm border-0 bg-gradient-to-r from-orange-50 to-red-50" 
          size="small"
          style={{ marginBottom: '12px' }}
          title={
            <Space>
              <TeamOutlined className="text-orange-500" />
              <Text strong className="text-gray-700">参保人信息</Text>
              <Button 
                className="text-orange-600 hover:text-orange-700 font-medium" 
                size="small" 
                type="link"
                onClick={handleAddInsured}
              >
                {form.getFieldValue('insuredId') ? '更换' : '选择'}参保人
              </Button>
            </Space>
          }
        >
          <Form.Item
            className="mb-0"
            name="insuredId"
            rules={[{ required: true, message: '请选择参保人' }]}
          >
            {form.getFieldValue('insuredId') ? (
              <Descriptions 
                bordered 
                className="bg-white rounded-lg" 
                column={2}
                size="small"
              >
                <Descriptions.Item className="font-medium" label="姓名">
                  <Text className="text-gray-800 font-semibold">{insuredRecord?.name || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="性别">
                  <Text className="text-gray-800">{insuredRecord?.gender || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="出生日期">
                  <Text className="text-gray-800">{insuredRecord?.birthDate || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="年龄">
                  <Text className="text-gray-800">{insuredRecord?.age || '-'}岁</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="联系电话" span={2}>
                  <Text className="text-gray-800">{insuredRecord?.mobile || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="地址" span={2}>
                  <Text className="text-gray-600">{insuredRecord?.address || '-'}</Text>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty 
                className="py-8" 
                description="请选择参保人"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Form.Item>
        </Card>

        {/* 套餐信息 */}
        {form.getFieldValue('insuredId') && (
          <Card 
            className="shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50" 
            size="small"
            style={{ marginBottom: '12px' }}
            title={
              <Space>
                <MedicineBoxOutlined className="text-green-500" />
                <Text strong className="text-gray-700">套餐信息</Text>
              </Space>
            }
          >
            <Form.Item
              className="mb-0"
              name="packageId"
              rules={[{ required: true, message: '请选择套餐' }]}
            >
              <Descriptions 
                bordered 
                className="bg-white rounded-lg" 
                column={2}
                size="small"
              >
                <Descriptions.Item className="font-medium" label="套餐">
                  <Text className="text-gray-800 font-semibold">{insuredRecord?.package?.name || '-'}</Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="服务时长">
                  <Text className="text-gray-800">
                    {insuredRecord?.package?.minDuration || 0}分钟 - {insuredRecord?.package?.maxDuration || 0}分钟
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item className="font-medium" label="护理服务" span={2}>
                  <Space wrap>
                    {insuredRecord?.package?.tasks?.map((task: any) => (
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
            </Form.Item>
          </Card>
        )}

        {/* 排班时间 */}
        <Card 
          className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50" 
          size="small"
          style={{ marginBottom: '12px' }}
          title={
            <Space>
              <CalendarOutlined className="text-blue-500" />
              <Text strong className="text-gray-700">排班时间</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <CalendarOutlined className="text-gray-500" />
                    <Text className="font-medium">计划日期</Text>
                  </Space>
                }
                name="currentDate"
                rules={[{ required: true, message: '请选择计划日期' }]}
              >
                <DatePicker 
                  className="w-full" 
                  disabledDate={(current) => {
                    return current && current <= dayjs().startOf('day')
                  }}
                  placeholder="请选择计划日期" 
                />
              </Form.Item>
            </Col>
            {form.getFieldValue('insuredId') && (
              <>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <ClockCircleOutlined className="text-gray-500" />
                        <Text className="font-medium">开始时间</Text>
                      </Space>
                    }
                    name="startTime"
                    rules={[{ required: true, message: '请选择开始时间' }]}
                  >
                    <TimePicker
                      className="w-full"
                      format="HH:mm"
                      minuteStep={10}
                      placeholder="请选择开始时间"
                      showNow={false}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <ClockCircleOutlined className="text-gray-500" />
                        <Text className="font-medium">结束时间</Text>
                      </Space>
                    }
                    name="endTime"
                    rules={[{ required: true, message: '请选择结束时间' }]}
                  >
                    <TimePicker
                      className="w-full"
                      disabledTime={() => {
                        const startTime = form.getFieldValue('startTime')
                        if (!startTime) return {}
                        const startHour = startTime.hour()
                        const startMinute = startTime.minute()

                        return {
                          disabledHours: () => {
                            const hours = []
                            for (let i = 0; i < startHour; i++) {
                              hours.push(i)
                            }
                            return hours
                          },
                          disabledMinutes: (selectedHour) => {
                            if (selectedHour === startHour) {
                              const minutes = []
                              for (let i = 0; i <= startMinute; i += 10) {
                                minutes.push(i)
                              }
                              return minutes
                            }
                            return []
                          }
                        }
                      }}
                      format="HH:mm"
                      minuteStep={10}
                      placeholder="请选择结束时间"
                      showNow={false}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        </Card>

        {/* 其他信息 */}
        <Card 
          className="shadow-sm border-0 bg-gradient-to-r from-gray-50 to-slate-50" 
          size="small"
          style={{ marginBottom: '12px' }}
          title={
            <Space>
              <SettingOutlined className="text-gray-500" />
              <Text strong className="text-gray-700">其他信息</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <FileTextOutlined className="text-gray-500" />
                    <Text className="font-medium">备注</Text>
                  </Space>
                }
                name="description"
              >
                <Input.TextArea
                  className="rounded-lg"
                  placeholder="请输入备注"
                  rows={3}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    <SettingOutlined className="text-gray-500" />
                    <Text className="font-medium">状态</Text>
                  </Space>
                }
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Radio.Group className="space-x-4">
                  <Radio className="font-medium" value={1}>
                    <Text className="text-green-600">启用</Text>
                  </Radio>
                  <Radio className="font-medium" value={0}>
                    <Text className="text-red-600">禁用</Text>
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  )
  return (
    <>
      <ConfigModal slots={{
        body: formContent,
        footer: (
          <Space>
            <Button 
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md border-gray-300 text-gray-600 hover:text-gray-700"
              onClick={handleReset}
            >
              重置
            </Button>
            <Button 
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md border-gray-300 text-gray-600 hover:text-gray-700"
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
              loading={submitLoading}
              type="primary"
              onClick={() => form.submit()}
            >
              确定
            </Button>
          </Space>
        )
      }} />
      <Modal
        className="rounded-lg"
        destroyOnHidden={true}
        footer={
          <Space>
            <Button 
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              onClick={() => setOpenInsured(false)}
            >
              关闭
            </Button>
          </Space>
        }
        open={openInsured}
        title={
          <Space>
            <TeamOutlined className="text-orange-500" />
            <Text strong>选择参保人</Text>
          </Space>
        }
        width={800}
        zIndex={1000}
        onCancel={() => setOpenInsured(false)}
      >
        <InsuredModal onSelect={handleSelectInsured} />
      </Modal>
      <Modal
        className="rounded-lg"
        destroyOnHidden={true}
        footer={
          <Space>
            <Button 
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              onClick={() => setOpenNurse(false)}
            >
              关闭
            </Button>
          </Space>
        }
        open={openNurse}
        title={
          <Space>
            <UserOutlined className="text-purple-500" />
            <Text strong>选择护理员</Text>
          </Space>
        }
        width={800}
        zIndex={1000}
        onCancel={() => setOpenNurse(false)}
      >
        <NurseModal onSelect={handleSelectNurse} />
      </Modal>
    </>
  )
}