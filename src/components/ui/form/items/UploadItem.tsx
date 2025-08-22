'use client'

import React from 'react'
import { Upload, Button } from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
import type { FormItemConfig } from '@/types/form-config'

const { Dragger } = Upload

interface UploadItemProps {
  config: FormItemConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
}

const UploadItem: React.FC<UploadItemProps> = ({ config, value, onChange, disabled }) => {
  const uploadConfig = config as any

  const uploadProps = {
    disabled: disabled || config.disabled,
    action: uploadConfig.action,
    accept: uploadConfig.accept,
    multiple: uploadConfig.multiple,
    maxCount: uploadConfig.maxCount,
    beforeUpload: uploadConfig.beforeUpload,
    onChange: uploadConfig.onChange,
    onPreview: uploadConfig.onPreview,
    onRemove: uploadConfig.onRemove,
    fileList: value
  }

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
        <Button icon={<UploadOutlined />} disabled={disabled || config.disabled}>
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
        <p className="ant-upload-hint">支持单个或批量上传</p>
      </Dragger>
    )
  }
}

export default UploadItem