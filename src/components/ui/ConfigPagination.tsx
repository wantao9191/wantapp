'use client'

import React from 'react'
import { Pagination } from 'antd'

export interface ConfigPaginationProps {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode)
  pageSizeOptions?: string[]
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  size?: 'small' | 'default'
  className?: string
  style?: React.CSSProperties
  align?: 'left' | 'center' | 'right'
}

const ConfigPagination: React.FC<ConfigPaginationProps> = ({
  current,
  pageSize,
  total,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  pageSizeOptions = ['10', '20', '50', '100'],
  onChange,
  onShowSizeChange,
  size = 'default',
  className = '',
  style
}) => {
  // 默认显示总数函数
  const defaultShowTotal = (total: number) => {
    if (total === 0) return '暂无数据'
    return `共 ${total} 条`
  }

  // 获取显示总数的函数
  const getShowTotal = () => {
    if (showTotal === false) return undefined
    if (typeof showTotal === 'function') return showTotal
    return defaultShowTotal
  }
  return (
    <div className={`flex justify-end ${className}`} style={style}>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={getShowTotal()}
        pageSizeOptions={pageSizeOptions}
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
        size={size}
        locale={{
          items_per_page: '条/页',
          jump_to: '跳至',
          jump_to_confirm: '确定',
          page: '页',
        }}
      />
    </div>
  )
}

export default ConfigPagination
