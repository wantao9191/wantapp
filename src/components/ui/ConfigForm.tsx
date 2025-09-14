'use client'

import React, { useEffect, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react'
import { Form, Row, Col, Tooltip, Space } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'
import type { FormConfig, FormItemConfig, FormContext } from '@/types/form-config'
import FormItemRenderer from './form/FormItemRenderer'
import { removeUndefined } from '@/lib/utils'

// 工具函数：解析函数参数
function resolveFunctionValue<T>(
  value: T | ((context: FormContext) => T) | undefined,
  context: FormContext
): T | undefined {
  if (typeof value === 'function') {
    return (value as (context: FormContext) => T)(context)
  }
  return value
}

// 工具函数：处理数组name的表单数据
const processFormData = (formData: any, items: FormItemConfig[]) => {
  const processedData = { ...formData }
  items.forEach(item => {
    if (Array.isArray(item.name)) {
      // 如果name是数组，需要为每个字段复制值
      const fieldValue = formData[item.name.join('_')] // 使用第一个字段作为主值
      for (const key in fieldValue) {
        processedData[key] = fieldValue[key]
      }
      delete processedData[item.name.join('_')]
    }
    if (item.type === 'upload') {
      const fieldName = Array.isArray(item.name) ? item.name.join('_') : item.name
      const fileList = formData[fieldName]
      
      if (fileList && Array.isArray(fileList) && fileList.length > 0) {
        if (item.multiple) {
          // 多文件上传：返回文件ID数组
          processedData[fieldName] = fileList
            .filter((file: any) => file.status === 'done') // 只处理已完成的文件
            .map((file: any) => file.response?.id || file.id)
        } else {
          // 单文件上传：返回第一个文件的ID
          const firstFile = fileList.find((file: any) => file.status === 'done')
          processedData[fieldName] = firstFile ? (firstFile.response?.id || firstFile.id) : null
        }
      } else {
        // 没有文件时，根据是否多文件返回空数组或null
        processedData[fieldName] = item.multiple ? [] : null
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
      const values: any = {}
      item.name.forEach(fieldName => {
        values[fieldName] = processedValues[fieldName]
        delete processedValues[fieldName]
      })
      processedValues[item.name.join('_')] = values
    }
    if (item.type === 'upload') {
      const fieldName = Array.isArray(item.name) ? item.name.join('_') : item.name
      const fileSource = initialValues[fieldName]
      if (fileSource) {
        // 如果初始值是文件ID，需要构造文件对象
        if (typeof fileSource === 'string' || typeof fileSource === 'number') {
          processedValues[fieldName] = [{
            uid: `initial-${fileSource}`,
            name: '已上传文件',
            status: 'done',
            id: fileSource,
            url: `/api/files/${fileSource}` // 假设有文件访问接口
          }]
        } else if (Array.isArray(fileSource)) {
          // 如果初始值是文件数组
          processedValues[fieldName] = fileSource.map((file: any, index: number) => ({
            uid: file.uid || `initial-${index}`,
            name: file.name || '已上传文件',
            status: 'done',
            id: file.id || file,
            url: file.url || `/api/files/${file.id || file}`
          }))
        } else if (fileSource && typeof fileSource === 'object') {
          // 如果初始值是单个文件对象
          processedValues[fieldName] = [{
            uid: fileSource.uid || 'initial-file',
            name: fileSource.name || '已上传文件',
            status: 'done',
            id: fileSource.id || fileSource,
            url: fileSource.url || `/api/files/${fileSource.id || fileSource}`
          }]
        }
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

  // 检查表单项是否应该显示 - 使用 useCallback 优化
  const shouldShowItem = useCallback((item: FormItemConfig, formValues: any) => {
    // 创建表单上下文
    const context: FormContext = {
      formData: formValues,
      config,
      item
    }

    // 解析 hidden 属性
    const isHidden = resolveFunctionValue(item.hidden, context)
    if (isHidden) return false

    // 这里可以添加更复杂的显示逻辑
    // 比如根据其他字段的值来决定是否显示当前字段
    if (item.dependencies && item.dependencies.length > 0) {
      const dependencyValues = getDependencyValues(item.dependencies)
      // 可以在这里添加自定义的显示逻辑
      // 例如：return dependencyValues.someField === 'someValue'
    }

    return true
  }, [config])

  // 渲染表单项 - 使用 useCallback 优化
  const renderFormItem = useCallback((item: FormItemConfig, formValues: any, index: number) => {
    if (!shouldShowItem(item, formValues)) {
      return null
    }

    // 创建表单上下文
    const context: FormContext = {
      formData: formValues,
      config,
      item
    }

    // 处理数组name的情况
    const itemName = Array.isArray(item.name) ? item.name.join('_') : item.name
    // 使用传入的index确保key的唯一性
    const itemKey = Array.isArray(item.name) ? `${item.name.join('_')}_${index}` : `${item.name}_${index}`

    // 解析函数参数
    const resolvedRequired = resolveFunctionValue(item.required, context)
    const resolvedRules = resolveFunctionValue(item.rules, context)
    const resolvedTooltip = resolveFunctionValue(item.tooltip, context)
    const resolvedDisabled = resolveFunctionValue(item.disabled, context)
    const resolvedClassName = resolveFunctionValue(item.className, context)
    const resolvedStyle = resolveFunctionValue(item.style, context)
    const resolvedSpan = resolveFunctionValue(item.span, context)
    const resolvedOffset = resolveFunctionValue(item.offset, context)

    const formItemProps: any = {
      name: itemName,
      label: (
        <Space size={4}>
          {item.label}
          {resolvedTooltip && (
            <Tooltip title={resolvedTooltip}>
              <QuestionCircleOutlined style={{ color: '#999' }} />
            </Tooltip>
          )}
        </Space>
      ),
      rules: [
        ...(resolvedRequired ? [{ required: true, message: `请输入${item.label}` }] : []),
        ...(resolvedRules || [])
      ],
      dependencies: item.dependencies,
      hidden: false // 已经在 shouldShowItem 中处理了
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
      formItemProps.getValueFromEvent = (e: any) => {
        if (Array.isArray(e)) {
          return e
        }
        return e?.fileList
      }
    }

    const colProps = {
      span: resolvedSpan || 24,
      offset: resolvedOffset || 0
    }

    return (
      <Col {...colProps} key={itemKey}>
        <Form.Item
          key={itemKey}
          {...formItemProps}
          className={resolvedClassName}
          size={config.size || 'middle'}
          style={resolvedStyle}
        >
          <FormItemRenderer
            config={item}
            disabled={disabled || resolvedDisabled || loading}
            formContext={context}
          />
        </Form.Item>
      </Col>
    )
  }, [config, disabled, loading])

  // 监听表单值变化，用于处理依赖关系 - 使用 useCallback 优化
  const handleValuesChange = useCallback((changedValues: any, allValues: any) => {
    onValuesChange?.(changedValues, allValues)
    // 只有在有依赖关系的表单项时才需要重新渲染
    // 移除不必要的 validateFields 调用
  }, [onValuesChange])

  return (
    <div className={className} style={style}>
      <Form
        colon={config.colon}
        disabled={disabled || config.disabled || loading}
        form={form}
        initialValues={initialValues}
        labelCol={config.labelCol}
        layout={config.layout || 'vertical'}
        preserve={config.preserve}
        requiredMark={config.requiredMark}
        scrollToFirstError={config.scrollToFirstError}
        size={config.size || 'middle'}
        validateTrigger={config.validateTrigger}
        wrapperCol={config.wrapperCol}
        onFinish={(values) => {
          const processedValues = processFormData(values, config.items)
          onFinish?.(processedValues)
        }}
        onFinishFailed={onFinishFailed}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={[16, 0]}>
          {config.items.map((item, index) => {
            // 对于有依赖关系的表单项，使用 shouldUpdate 来监听变化
            if (item.dependencies && item.dependencies.length > 0) {
              return (
                <Form.Item key={`${item.name}_${index}`} noStyle shouldUpdate>
                  {() => {
                    const formValues = form.getFieldsValue()
                    return renderFormItem(item, formValues, index)
                  }}
                </Form.Item>
              )
            }
            // 对于没有依赖关系的表单项，直接渲染，不需要 shouldUpdate
            return renderFormItem(item, {}, index)
          })}
        </Row>
      </Form>
    </div>
  )
})

ConfigForm.displayName = 'ConfigForm'

export default ConfigForm