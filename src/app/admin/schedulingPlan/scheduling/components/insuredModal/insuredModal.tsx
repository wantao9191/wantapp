'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import { Button, Modal, message } from 'antd'
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons'
export default function InsuredPage() {
  const { confirm } = Modal
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems(setReload)
  // 操作按钮
  const actions: ActionConfig = {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'left',
    align: 'center',
    actions: [
      {
        key: 'select',
        label: '选择',
        type: 'primary',
        onClick: (record: any) => {
          onSelect(record)
        }
      }
    ]
  }
  const onSelect = (record: any) => {
    console.log(record)
  }
  const getList = (params: Record<string, any>) => {
    return http.get('/admin/insured', params)
  }

  return (
    <div className='h-60vh flex flex-col' >
      <ConfigTable
        columns={tableColumns}
        formColumns={searchFormSchema}
        rowKey="id"
        actions={actions}
        size="small"
        searchable={true}
        bordered={false}
        api={getList}
        reload={reload}
        setReload={setReload}
      />
    </div>
  )
}