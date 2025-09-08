import React, { useRef, useState, useEffect } from 'react'
import { Button, App } from 'antd'
import ConfigForm from '@/components/ui/ConfigForm'
import ConfigModal from '@/components/ui/ConfigModal'
import useItems from './useItems'
import { createQuickForm } from '@/lib/form-utils'
import { FormItemConfig } from '@/types/form-config'
import type { ConfigFormRef } from '@/components/ui/ConfigForm'
import { http } from '@/lib/https'

interface EditModalProps {
  initialValues?: Record<string, any>
  onCancel?: () => void
  onSubmit?: () => void
  formData: any
}

export default function EditModal({
  initialValues,
  formData,
  onCancel,
  onSubmit
}: EditModalProps) {
  const { searchFormSchema } = useItems()
  const formRef = useRef<ConfigFormRef>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const { message } = App.useApp()

  // 构建表单配置
  const formConfig = createQuickForm({
    layout: 'vertical',
    size: 'middle',
    items: searchFormSchema.filter((col: FormItemConfig) => !col.hidden)
  })

  // 处理表单提交
  const handleSubmit = async () => {
    formRef.current?.validateFields().then(async (values) => {
      if (values) {
        const params = formRef.current?.getFieldsValue()
        try {
          setSubmitLoading(true)
          if (formData?.id) {
            await http.put(`/admin/careTasks/${formData.id}`, params)
          } else {
            await http.post('/admin/careTasks', params)
          }
          message.success('操作成功')
          onSubmit?.()
        } catch (error: any) {
          setSubmitLoading(false)
          console.error('表单验证失败:', error)
        }
      }
    })
  }

  // 处理取消
  const handleCancel = () => {
    onCancel?.()
  }

  // 处理重置
  const handleReset = () => {
    formRef.current?.resetFields()
    if (initialValues) {
      formRef.current?.setFieldsValue(initialValues)
    }
  }
  useEffect(() => {
    if (formData) {
      formRef.current?.setFieldsValue(formData)
    }
  }, [formData])
  return (
    <ConfigModal slots={{
      body: <ConfigForm
        ref={formRef}
        config={formConfig}
        initialValues={initialValues}
      />,
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