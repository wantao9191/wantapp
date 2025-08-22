'use client'

import React, { useEffect, useImperativeHandle, forwardRef } from 'react'
import { Form, Row, Col, Tooltip, Space } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'
import type { FormConfig, FormItemConfig } from '@/types/form-config'
import FormItemRenderer from './form/FormItemRenderer'
import { removeUndefined } from '@/lib/utils'
export interface ConfigFormProps {
  config: FormConfig
  initialValues?: Record<string, any>
  onValuesChange?: (changedValues: any, allValues: any) => void
  onFinish?: (values: any) => void
  onFinishFailed?: (errorInfo: any) => void
  loading?: boolean
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export interface ConfigFormRef {
  form: FormInstance
  getFieldsValue: () => any
  setFieldsValue: (values: any) => void
  resetFields: () => void
  validateFields: () => Promise<any>
  submit: () => void
}

const ConfigForm = forwardRef<ConfigFormRef, ConfigFormProps>(({
  config,
  initialValues,
  onValuesChange,
  onFinish,
  onFinishFailed,
  loading = false,
  disabled = false,
  className,
  style
}, ref) => {
  const [form] = Form.useForm()

  // 暴露表单实例和方法给父组件
  useImperativeHandle(ref, () => ({
    form,
    getFieldsValue: () => removeUndefined(form.getFieldsValue()),
    setFieldsValue: (values: any) => form.setFieldsValue(values),
    resetFields: () => form.resetFields(),
    validateFields: () => form.validateFields(),
    submit: () => form.submit()
  }), [form])

  // 设置初始值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [initialValues, form])

  // 处理表单项依赖关系
  const getDependencyValues = (dependencies: string[] = []) => {
    if (dependencies.length === 0) return {}
    return form.getFieldsValue(dependencies)
  }

  // 检查表单项是否应该显示
  const shouldShowItem = (item: FormItemConfig, formValues: any) => {
    if (item.hidden) return false
    
    // 这里可以添加更复杂的显示逻辑
    // 比如根据其他字段的值来决定是否显示当前字段
    if (item.dependencies && item.dependencies.length > 0) {
      const dependencyValues = getDependencyValues(item.dependencies)
      // 可以在这里添加自定义的显示逻辑
      // 例如：return dependencyValues.someField === 'someValue'
    }
    
    return true
  }

  // 渲染表单项
  const renderFormItem = (item: FormItemConfig, formValues: any) => {
    if (!shouldShowItem(item, formValues)) {
      return null
    }

    const formItemProps: any = {
      key: item.name,
      name: item.name,
      label: (
        <Space size={4}>
          {item.label}
          {item.tooltip && (
            <Tooltip title={item.tooltip}>
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          )}
        </Space>
      ),
      rules: [
        ...(item.required ? [{ required: true, message: `请输入${item.label}` }] : []),
        ...(item.rules || [])
      ],
      dependencies: item.dependencies,
      hidden: item.hidden
    }

    // 特殊处理 checkbox 类型（单个复选框）
    if (item.type === 'checkbox' && !(item as any).options) {
      formItemProps.valuePropName = 'checked'
    }

    // 特殊处理 switch 类型
    if (item.type === 'switch') {
      formItemProps.valuePropName = 'checked'
    }

    // 特殊处理 upload 类型
    if (item.type === 'upload') {
      formItemProps.valuePropName = 'fileList'
      formItemProps.getValueFromEvent = (e: any) => {
        if (Array.isArray(e)) {
          return e
        }
        return e?.fileList
      }
    }

    const colProps = {
      span: item.span || 24,
      offset: item.offset || 0
    }

    return (
      <Col {...colProps} key={item.name}>
        <Form.Item {...formItemProps} key={item.name} size={config.size || 'middle'} className={`${item.className}`}>
          <FormItemRenderer
            config={item}
            disabled={disabled || item.disabled || loading}
          />
        </Form.Item>
      </Col>
    )
  }

  // 监听表单值变化，用于处理依赖关系
  const handleValuesChange = (changedValues: any, allValues: any) => {
    onValuesChange?.(changedValues, allValues)
    // 强制重新渲染以处理依赖关系
    form.validateFields({ validateOnly: true }).catch(() => {})
  }

  return (
    <div className={className} style={style}>
      <Form
        form={form}
        layout={config.layout || 'vertical'}
        labelCol={config.labelCol}
        wrapperCol={config.wrapperCol}
        size={config.size || 'middle'}
        disabled={disabled || config.disabled || loading}
        colon={config.colon}
        requiredMark={config.requiredMark}
        scrollToFirstError={config.scrollToFirstError}
        preserve={config.preserve}
        validateTrigger={config.validateTrigger}
        initialValues={initialValues}
        onValuesChange={handleValuesChange}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={[16, 0]}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const formValues = form.getFieldsValue()
              return config.items.map(item => renderFormItem(item, formValues))
            }}
          </Form.Item>
        </Row>
      </Form>
    </div>
  )
})

ConfigForm.displayName = 'ConfigForm'

export default ConfigForm