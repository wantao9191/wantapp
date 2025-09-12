'use client'

import React, { useCallback, useMemo } from 'react'
import { Upload, Button } from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
import type { FormItemConfig, FormContext } from '@/types/form-config'
import http from '@/lib/https'

const { Dragger } = Upload

interface UploadItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}
const UploadItem: React.FC<UploadItemProps> = ({ config, value, onChange, disabled, formContext }) => {
  // 解析函数参数 - 使用 useMemo 缓存计算结果
  const resolvedDisabled = useMemo(() => {
    return formContext && typeof config.disabled === 'function' 
      ? (config.disabled as any)(formContext) 
      : config.disabled
  }, [config.disabled, formContext])

  const uploadConfig = useMemo(() => config as any, [config])
  
  const customProps = useMemo(() => {
    return typeof uploadConfig.componentProps === 'function' 
      ? uploadConfig.componentProps(value, formContext) 
      : uploadConfig.componentProps
  }, [uploadConfig.componentProps, value, formContext])

  const customRequest = useCallback(async ({ file, onSuccess, onError }: any) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await http.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // 构造完整的文件信息
      const fileInfo = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: res.data.url,
        id: res.data.id,
        size: file.size,
        type: file.type,
        originFileObj: file
      }
      onSuccess(fileInfo, file)
    } catch (error: any) {
      console.error('文件上传失败:', error)
      onError(error)
    }
  }, []) // 空依赖数组，因为函数内部没有依赖外部变量

  // 处理文件变化 - 使用 useCallback 优化
  const handleChange = useCallback((info: any) => {
    onChange?.(info.fileList)
  }, [onChange])

  // 处理文件删除 - 使用 useCallback 优化
  const handleRemove = useCallback((file: any) => {
    const currentFiles = value || []
    const newFiles = currentFiles.filter((item: any) => item.uid !== file.uid)
    onChange?.(newFiles)
  }, [value, onChange])

  // 处理文件预览 - 使用 useCallback 优化
  const handlePreview = useCallback((file: any) => {
    if (file.url) {
      window.open(file.url, '_blank')
    } else if (file.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj)
      window.open(url, '_blank')
    }
  }, [])

  // 使用 useMemo 缓存 uploadProps 对象
  const uploadProps = useMemo(() => ({
    disabled: disabled || (resolvedDisabled as boolean),
    action: uploadConfig.action,
    accept: uploadConfig.accept,
    multiple: uploadConfig.multiple,
    maxCount: uploadConfig.maxCount,
    beforeUpload: uploadConfig.beforeUpload,
    onChange: handleChange,
    onPreview: handlePreview,
    onRemove: handleRemove,
    fileList: value || [],
    helpText: customProps?.helpText,
    customRequest
  }), [
    disabled,
    resolvedDisabled,
    uploadConfig.action,
    uploadConfig.accept,
    uploadConfig.multiple,
    uploadConfig.maxCount,
    uploadConfig.beforeUpload,
    handleChange,
    handlePreview,
    handleRemove,
    value,
    customProps?.helpText,
    customRequest
  ])

  if (uploadConfig.listType === 'picture-card') {
    return (
      <Upload {...uploadProps} listType="picture-card">
        <div>
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      </Upload>
    )
  } else if (uploadConfig.listType === 'picture') {
    return (
      <Upload {...uploadProps} listType="picture">
        <Button disabled={disabled || (resolvedDisabled as boolean)} icon={<UploadOutlined />}>
          上传文件
        </Button>
      </Upload>
    )
  } else {
    return (
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">{uploadProps.helpText}</p>
      </Dragger>
    )
  }
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(UploadItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  return (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext
  )
})