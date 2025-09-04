'use client'

import React, { useEffect, useImperativeHandle, forwardRef } from 'react'
import { Form, Row, Col, Tooltip, Space } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'
import type { FormConfig, FormItemConfig } from '@/types/form-config'
import FormItemRenderer from './Form/FormItemRenderer'
import { removeUndefined } from '@/lib/utils'

// 工具函数：处理数组name的表单数据
const processFormData = (formData: any, items: FormItemConfig[]) => {
  const processedData = { ...formData }
  
  items.forEach(item => {
    if (Array.isArray(item.name)) {
      // 如果name是数组，需要为每个字段复制值
      const fieldValue = formData[item.name[0]] // 使用第一个字段作为主值
      
      // 如果字段值是对象且包含menus和permissions属性，则展开为扁平结构
      if (fieldValue && typeof fieldValue === 'object' && fieldValue.menus && fieldValue.permissions) {
        item.name.forEach(fieldName => {
          if (fieldName === 'menus') {
            processedData[fieldName] = fieldValue.menus
          } else if (fieldName === 'permissions') {
            processedData[fieldName] = fieldValue.permissions
          } else {
            processedData[fieldName] = fieldValue
          }
        })
      } else {
        // 普通值直接复制
        item.name.forEach(fieldName => {
          processedData[fieldName] = fieldValue
        })
      }
    }
  })
  
  return processedData
}

// 工具函数：处理数组name的初始值
const processInitialValues = (initialValues: any, items: FormItemConfig[]) => {
  if (!initialValues) return initialValues
  
  const processedValues = { ...initialValues }
  
  items.forEach(item => {
    if (Array.isArray(item.name)) {
      // 如果name是数组，检查是否有任何一个字段有值
      let hasValue = false
      let value = undefined
      
      for (const fieldName of item.name) {
        if (processedValues[fieldName] !== undefined) {
          value = processedValues[fieldName]
          hasValue = true
          break
        }
      }
      
      // 如果找到值，为所有字段设置相同的值
      if (hasValue) {
        item.name.forEach(fieldName => {
          processedValues[fieldName] = value
        })
      }
    }
  })
  
  return processedValues
}

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
    getFieldsValue: () => {
      const formData = removeUndefined(form.getFieldsValue())
      return processFormData(formData, config.items)
    },
    setFieldsValue: (values: any) => {
      const processedValues = processInitialValues(values, config.items)
      form.setFieldsValue(processedValues)
    },
    resetFields: () => form.resetFields(),
    validateFields: () => form.validateFields(),
    submit: () => form.submit()
  }), [form, config.items])

  // 设置初始值
  useEffect(() => {
    if (initialValues) {
      const processedValues = processInitialValues(initialValues, config.items)
      form.setFieldsValue(processedValues)
    }
  }, [initialValues, form, config.items])

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
  const renderFormItem = (item: FormItemConfig, formValues: any, index: number) => {
    if (!shouldShowItem(item, formValues)) {
      return null
    }

    // 处理数组name的情况
    const itemName = Array.isArray(item.name) ? item.name[0] : item.name
    // 使用传入的index确保key的唯一性
    const itemKey = Array.isArray(item.name) ? `${item.name.join('_')}_${index}` : `${item.name}_${index}`

    const formItemProps: any = {
      name: itemName,
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
      <Col {...colProps} key={itemKey}>
        <Form.Item 
          key={itemKey}
          {...formItemProps} 
          size={config.size || 'middle'} 
          className={`${item.className}`}
        >
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
        onFinish={(values) => {
          const processedValues = processFormData(values, config.items)
          onFinish?.(processedValues)
        }}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={[16, 0]}>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const formValues = form.getFieldsValue()
              return config.items.map((item, index) => renderFormItem(item, formValues, index))
            }}
          </Form.Item>
        </Row>
      </Form>
    </div>
  )
})

ConfigForm.displayName = 'ConfigForm'

export default ConfigForm