'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
export default function NursePage({ onSelect }: { onSelect: (record: any) => void }) {
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems(setReload)
  // 操作按钮
  const actions: ActionConfig = {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'left',
    align: 'center',
    actions: [
      {
        key: 'edit',
        label: '选择',
        type: 'link',
        onClick: (record: any) => {
          onSelect(record)
        }
      },
    ]
  }

  const getList = (params: Record<string, any>) => {
    return http.get('/admin/nurse', params)
  }

  return (
    <div className='h-60vh flex flex-col' >
      <ConfigTable
        actions={actions}
        api={getList}
        bordered={false}
        columns={tableColumns}
        formColumns={searchFormSchema}
        reload={reload}
        rowKey="id"
        searchable={true}
        setReload={setReload}
        size="small"
      />
    </div>
  )
}