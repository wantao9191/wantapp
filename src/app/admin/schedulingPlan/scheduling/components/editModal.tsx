import React, { useRef, useState, useEffect } from 'react'
import { Button, App, Form, Row, Col, Input, Radio, Space, Empty, Modal, Descriptions, Tag, TimePicker, DatePicker } from 'antd'
import dayjs from 'dayjs'
import ConfigModal from '@/components/ui/ConfigModal'
import { http } from '@/lib/https'
import InsuredModal from './insuredModal/insuredModal'
import NurseModal from './nurseModal/nurseModal'

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
    console.log('currentDate:', currentDate)
    console.log('startTime:', startTime)
    console.log('endTime:', endTime)

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
      message.error('操作失败')
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
      form.setFieldsValue({ ...formData, status: !formData.id ? 1 : formData.status })
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
      minDuration: record.package?.minDuration,
      maxDuration: record.package?.maxDuration,
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
    <Form
      form={form}
      layout="vertical"
      size="middle"
      onValuesChange={(changedValues, allValues) => {
        // 当开始时间改变时，强制重新渲染结束时间选择器
        if (changedValues.startTime) {
          // 触发结束时间字段的重新渲染
          form.setFieldsValue({ endTime: undefined })
        }

        console.log('表单值变化:', changedValues, allValues)
      }}
      onFinish={handleSubmit}
      onFinishFailed={(errorInfo) => {
        console.log('表单验证失败:', errorInfo)
      }}
    >
      <Row gutter={[16, 0]}>
        {/* 护理员 */}
        <Col span={24}>
          <Form.Item
            name="nurseId"
            label={
              <Space>
                护理员信息
                <Button type="link" size="small" onClick={handleAddNurse}>
                  {form.getFieldValue('nurseId') ? '更换' : '选择'}护理员
                </Button>
              </Space>
            }
            rules={[{ required: true, message: '请选择护理员' }]}
          >
            {form.getFieldValue('nurseId') ? (
              <Descriptions column={2} size="small" bordered={false}>
                <Descriptions.Item label="姓名">{nurseRecord?.name}</Descriptions.Item>
                <Descriptions.Item label="性别">{nurseRecord?.gender}</Descriptions.Item>
                <Descriptions.Item label="出生日期">{nurseRecord?.birthDate}</Descriptions.Item>
                <Descriptions.Item label="年龄">{nurseRecord?.age}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{nurseRecord?.mobile}</Descriptions.Item>
              </Descriptions>
            ) : <Empty description="请选择护理员" />}
          </Form.Item>
        </Col>
        {/* 参保人 */}
        <Col span={24}>
          <Form.Item
            name="insuredId"
            label={
              <Space>
                参保人信息
                <Button type="link" size="small" onClick={handleAddInsured}>
                  {form.getFieldValue('insuredId') ? '更换' : '选择'}参保人
                </Button>
              </Space>
            }
            rules={[
              { required: true, message: '请选择参保人' },
            ]}
          >
            {form.getFieldValue('insuredId') ? (
              <Descriptions column={2} size="small" bordered={false}>
                <Descriptions.Item label="姓名">{insuredRecord?.name}</Descriptions.Item>
                <Descriptions.Item label="性别">{insuredRecord?.gender}</Descriptions.Item>
                <Descriptions.Item label="出生日期">{insuredRecord?.birthDate}</Descriptions.Item>
                <Descriptions.Item label="年龄">{insuredRecord?.age}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{insuredRecord?.mobile}</Descriptions.Item>
              </Descriptions>
            ) : <Empty description="请选择参保人" />}
          </Form.Item>
        </Col>
        {/* 套餐 */}
        {form.getFieldValue('insuredId') && (
          <Col span={24}>
            <Form.Item
              name="packageId"
              label="套餐信息"
              rules={[
                { required: true, message: '请选择套餐' },
              ]}
            >
              <Descriptions column={2} size="small" bordered={false}>
                <Descriptions.Item label="套餐">{insuredRecord?.package?.name}</Descriptions.Item>
                <Descriptions.Item label="服务时长">{insuredRecord?.package?.minDuration}分钟 - {insuredRecord?.package?.maxDuration}分钟</Descriptions.Item>
                <Descriptions.Item label="护理服务">{
                  insuredRecord?.package?.tasks?.map((task: any) => (<Tag color="blue" key={task.id}>{task.name}</Tag>))
                }</Descriptions.Item>
              </Descriptions>
            </Form.Item>
          </Col>
        )}
        {/* 计划日期 */}
        <Col span={24}>
          <Form.Item
            name="currentDate"
            label="计划日期"
            rules={[{ required: true, message: '请选择计划日期' }]}
          >
            <DatePicker placeholder="请选择计划日期" disabledDate={(current) => {
              return current && current <= dayjs().startOf('day')
            }} />
          </Form.Item>
        </Col>
        {form.getFieldValue('insuredId') && (
          <>
            {/* 开始时间 */}
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <TimePicker
                  placeholder="请选择开始时间"
                  style={{ width: '100%' }}
                  format="HH:mm"
                  showNow={false}
                  minuteStep={10}
                />
              </Form.Item>
            </Col>

            {/* 结束时间 */}
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <TimePicker
                  placeholder="请选择结束时间"
                  style={{ width: '100%' }}
                  format="HH:mm"
                  showNow={false}
                  minuteStep={10}
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
                />
              </Form.Item>
            </Col>
          </>
        )}

        {/* 备注 */}
        <Col span={24}>
          <Form.Item
            name="description"
            label="备注"
          >
            <Input.TextArea
              placeholder="请输入备注"
              rows={3}
            />
          </Form.Item>
        </Col>

        {/* 状态 */}
        <Col span={24}>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group>
              <Radio value={1}>启用</Radio>
              <Radio value={0}>禁用</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
  return (
    <>
      <ConfigModal slots={{
        body: formContent,
        footer: <>
          <Button onClick={handleReset}>
            重置
          </Button>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            loading={submitLoading}
            onClick={() => form.submit()}
          >
            确定
          </Button>
        </>
      }} />
      <Modal
        title="选择参保人"
        open={openInsured}
        footer={<>
          <Button onClick={() => setOpenInsured(false)}>
            关闭
          </Button>
        </>}
        destroyOnHidden={true}
        onCancel={() => setOpenInsured(false)}
        width={800}
      >
        <InsuredModal onSelect={handleSelectInsured} />
      </Modal>
      <Modal
        title="选择护理员"
        open={openNurse}
        footer={<>
          <Button onClick={() => setOpenNurse(false)}>
            关闭
          </Button>
        </>}
        destroyOnHidden={true}
        onCancel={() => setOpenNurse(false)}
        width={800}
      >
        <NurseModal onSelect={handleSelectNurse} />
      </Modal>
    </>
  )
}