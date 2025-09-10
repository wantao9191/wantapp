import React, { useRef, useState, useEffect } from 'react'
import { Button, App, Form, Row, Col, Input, InputNumber, Select, Radio, Space, Card, Empty } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import ConfigModal from '@/components/ui/ConfigModal'
import { FormItemConfig } from '@/types/form-config'
import { http } from '@/lib/https'
import type { FormInstance } from 'antd/es/form'

interface EditModalProps {
  initialValues?: Record<string, any>
  onCancel?: () => void
  onSubmit?: () => void
  onOpenInsured?: () => void
  onOpenNurse?: () => void
  formData: any
}

export default function EditModal({
  initialValues,
  formData,
  onCancel,
  onSubmit,
  onOpenInsured,
  onOpenNurse
}: EditModalProps) {
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)
  const { message } = App.useApp()

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)

      if (formData?.id) {
        await http.put(`/admin/carePackages/${formData.id}`, values)
      } else {
        await http.post('/admin/carePackages', values)
      }

      message.success('操作成功')
      onSubmit?.()
    } catch (error: any) {
      setSubmitLoading(false)
      if (error.errorFields) {
        console.error('表单验证失败:', error.errorFields)
      } else {
        console.error('提交失败:', error)
      }
    }
  }

  // 处理取消
  const handleCancel = () => {
    onCancel?.()
  }

  // 处理重置
  const handleReset = () => {
    form.resetFields()
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }

  // 设置表单初始值
  useEffect(() => {
    if (formData) {
      form.setFieldsValue(formData)
    }
  }, [formData, form])
  const handleAddInsured = () => {
    onOpenInsured?.()
  }
  const handleAddNurse = () => {
    onOpenNurse?.()
  }
  const formContent = (
    <Form
      form={form}
      layout="vertical"
      size="middle"
      onValuesChange={(changedValues, allValues) => {
        // 可以在这里处理表单值变化
        console.log('表单值变化:', changedValues, allValues)
      }}
      onFinish={(values) => {
        console.log('表单提交:', values)
      }}
      onFinishFailed={(errorInfo) => {
        console.log('表单验证失败:', errorInfo)
      }}
    >
      <Row gutter={[16, 0]}>
        {/* 参保人 */}
        <Col span={24}>
          <Form.Item
            name="insuredId"
            label={
              <Space>
                参保人
                {!form.getFieldValue('insuredId') && (
                  <Button type="primary" size="small" onClick={handleAddInsured}>
                    选择参保人
                  </Button>
                )}
              </Space>
            }
            rules={[
              { required: true, message: '请选择参保人' },
            ]}
          >
            {form.getFieldValue('insuredId') ? (
              <Card size="small" title="Default size card" extra={<Button size="small" type='link' onClick={handleAddInsured}>更换</Button>} >
                <p>{form.getFieldValue('insuredName')}</p>
                <p>{form.getFieldValue('insuredPhone')}</p>
                <p>{form.getFieldValue('insuredAddress')}</p>
              </Card>
            ) : <Empty description="请选择参保人" />}
          </Form.Item>
        </Col>

        {/* 护理员 */}
        <Col span={24}>
          <Form.Item
            name="nurseName"
            label={
              <Space>
                护理员
                <Button type="primary" size="small" onClick={handleAddNurse}>
                  选择护理员
                </Button>
              </Space>
            }
            rules={[{ required: true, message: '请选择护理员' }]}
          >
            <Input placeholder="请选择护理员" readOnly />
          </Form.Item>
        </Col>

        {/* 最小时长 */}
        <Col span={12}>
          <Form.Item
            name="startTime"
            label="最小时长"
            rules={[{ required: true, message: '请输入最小时长' }]}
          >
            <InputNumber
              placeholder="请输入最小时长"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>

        {/* 最大时长 */}
        <Col span={12}>
          <Form.Item
            name="endTime"
            label="最大时长"
            rules={[{ required: true, message: '请输入最大时长' }]}
          >
            <InputNumber
              placeholder="请输入最大时长"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>

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
          onClick={handleSubmit}
        >
          确定
        </Button>
      </>
    }} />
  )
}