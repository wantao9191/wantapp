'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import {  Modal } from 'antd'
import CheckModal from './components/checkModal'
export default function RecordPage() {
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  // 排班记录管理的操作按钮
  const actions: ActionConfig = {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'left',
    align: 'center',
    actions: [
      {
        key: 'view',
        label: '查看',
        type: 'link',
        onClick: (record: any) => {
          console.log(record, 'record')
          setFormData(record)
          setOpen(true)
        }
      }
    ]
  }

  const getList = (params: Record<string, any>) => {
    return http.get('/admin/careRecords', params)
  }
  return (
    <>
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
      <Modal
        destroyOnHidden={true}
        footer={null}
        open={open}
        title='查看服务记录'
        onCancel={() => setOpen(false)}
        width={700}
        centered
      >
        <CheckModal formData={formData} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}