'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Table, Button, Space } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import ConfigPagination from '../ConfigPagination'
import ConfigForm from '../ConfigForm'
import { createQuickForm } from '@/lib/form-utils'
import { FormItemType, FormItemConfig } from '@/types/form-config'
interface TableSlots {
  tools?: React.ReactNode
}
export interface CommonActionConfig {
  key: string
  label: string
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
  danger?: boolean
  icon?: React.ReactNode
  onClick: (record: any) => void
  confirm?: boolean
  confirmText?: string
  hidden?: boolean | ((record: any) => boolean)
}
export interface TableColumnConfig {
  title: string
  dataIndex: string
  key: string
  width?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  render?: (text: any, record: any, index: number) => React.ReactNode
  sorter?: boolean | ((a: any, b: any) => number)
  filters?: { text: string; value: any }[]
  searchable?: boolean
  searchType?: 'input' | 'select' | 'date' | 'daterange'
  searchOptions?: { label: string; value: any }[]
}

export interface ActionConfig {
  title?: string
  key: string
  width?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  actions: Array<CommonActionConfig>
  hidden?: boolean | ((record: any) => boolean)
}
export interface ConfigTableProps {
  columns: TableColumnConfig[]
  formColumns: FormItemConfig[]
  formActions?: Array<CommonActionConfig>
  rowKey?: string | ((record: any) => string)
  actions?: ActionConfig | null
  searchable?: boolean
  addable?: boolean
  scroll?: { x?: number | string; y?: number | string }
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean,
  api?: (params: Record<string, any>) => Promise<any>
  slots?: TableSlots
  reload?: boolean
  setReload?: (reload: boolean) => void
}

export const ConfigTable: React.FC<ConfigTableProps> = ({
  columns,
  formColumns,
  formActions,
  rowKey = 'id',
  actions = null,
  searchable = true,
  scroll,
  size = 'middle',
  bordered = true,
  api,
  slots,
  reload = false,
  setReload
}) => {
  const formRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [dataSource, setDataSource] = useState<any[]>([])
  // 构建表格列
  const tableColumns: ColumnType<any>[] = [
    ...columns.map((col) => ({
      title: col.title,
      dataIndex: col.dataIndex,
      key: col.key,
      width: col.width || 120, // 为无宽度列设置默认最小宽度
      fixed: col.fixed,
      align: col.align,
      render: col.render,
      sorter: col.sorter,
      filters: col.filters,
      onFilter: col.filters ? (value: any, record: any) => record[col.dataIndex] === value : undefined,
      ellipsis: true // 文本过长时显示省略号
    })),
    // 操作列
    ...(actions ? [{
      title: actions.title || '操作',
      key: actions.key || 'actions',
      width: actions.width || 150,
      fixed: 'right' as const,
      align: actions.align || 'center',
      render: (_: any, record: any) => (
        <Space size={size}>
          {actions.actions?.filter((action: any) => !action.hidden || (typeof action.hidden === 'function' ? !action.hidden(record) : true)).map((action: any) => (
            <Button
              key={action.key}
              type={action.type}
              danger={action.danger}
              icon={action.icon}
              size={size}
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      )
    }] : [])
  ]
  // 构建搜索表单
  const formConfig = createQuickForm({
    layout: 'horizontal',
    size: size,
    items: formColumns.filter((col: FormItemConfig) => !col.hidden).map(col => ({
      ...col,
      type: col.type as FormItemType,
      options: 'options' in col ? col.options : [],
      span: col.span || 24 / formColumns.length,
      offset: col.offset || 0,
      className: col.className || '!mb-0'
    })) as FormItemConfig[]
  })
  const formConfigActions: CommonActionConfig[] = formActions && formActions.length > 0 ? formActions : [{
    label: '查询',
    key: 'search',
    onClick: async () => {
      handleApi({ page: 1, pageSize: pageSize })
    },
    danger: false,
    type: 'primary'
  }, {
    label: '重置',
    key: 'reset',
    onClick: async () => {
      await formRef.current?.resetFields()
      handleApi({ page: 1, pageSize: pageSize })
    },
    danger: false,
    type: 'default'
  }]

  const handlePageChange = (page: number, size: number) => {
    handleApi({ page: page, pageSize: size })
  }

  // 分页配置
  const paginationConfig = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true
  }
  const handleApi = async (params: Record<string, any>) => {
    try {
      const values = await formRef.current?.getFieldsValue()
      setLoading(true)
      const res = await api?.({ ...values, ...params })
      const { contents, total, page, pageSize } = res.data
      setDataSource(contents)
      setCurrentPage(page)
      setPageSize(pageSize)
      setTotal(total)
      setLoading(false)
      setReload?.(false)
    } catch (error) {
      setLoading(false)
    }

  }
  useEffect(() => {
    handleApi({ page: currentPage, pageSize: pageSize })
    if (reload) {
      handleApi({ page: currentPage, pageSize: pageSize })
    }
  }, [reload])
  return (
    <>
      {/* 搜索区域 */}
      {searchable && (
        <div className="mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            <ConfigForm config={formConfig} ref={formRef} />
            <div className="flex gap-2">
              {formConfigActions.map((action: CommonActionConfig) => (
                <Button key={action.key} type={action.type} size={size} onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0 h-full'>
        {/* 操作按钮区域 */}
        <div className="mb-4 flex justify-end items-center flex-shrink-0">
          <Space>
            {slots?.tools}
          </Space>
        </div>

        {/* 表格容器 */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <Table
              columns={tableColumns}
              dataSource={dataSource}
              loading={loading}
              rowKey={rowKey}
              pagination={false} // 禁用内置分页，使用自定义分页组件
              scroll={{
                x: scroll?.x || 'max-content', // 使用max-content，确保列有足够空间并显示横向滚动条
                y: scroll?.y || '100%' // 使用100%让表格撑满容器高度
              }}
              sticky={{ offsetHeader: 0 }}
              size={size}
              bordered={bordered}
              rowClassName="hover:bg-gray-50 transition-colors w-full"
              className="h-full text-13px"
              onChange={(pagination, filters, sorter) => {
                // 处理排序和筛选
                console.log('Table changed:', { pagination, filters, sorter })
              }}
            />
          </div>
        </div>

        {/* 自定义分页组件 */}
        {total && total > pageSize ? (
          <div className="pt-4 border-t border-gray-200">
            <ConfigPagination
              current={currentPage}
              pageSize={pageSize}
              total={total || 0}
              showSizeChanger={paginationConfig.showSizeChanger}
              showQuickJumper={paginationConfig.showQuickJumper}
              showTotal={paginationConfig.showTotal}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              size={size === 'small' ? 'small' : 'default'}
              align="center"
              className="w-full"
            />
          </div>
        ) : ''}
      </div>
    </>
  )
}

