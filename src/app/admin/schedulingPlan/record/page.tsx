'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import { Button, Modal } from 'antd'
import { PlusOutlined, } from '@ant-design/icons'
import EditModal from './components/editModal'
export default function RecordPage() {
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems(setReload)
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
        key: 'edit',
        label: '编辑',
        type: 'link',
        onClick: (record: any) => {
          setFormData(record)
          setOpen(true)
          console.log('编辑角色:', record)
        }
      }
    ]
  }

  const getOrganizationList = (params: Record<string, any>) => {
    return http.get('/admin/nurse', params)
  }
  const handleAdd = () => {
    setFormData(null)
    setOpen(true)
  }
  const onSubmit = () => {
    setReload(true)
    setOpen(false)
  }
  return (
    <>
      <ConfigTable
        actions={actions}
        api={getOrganizationList}
        bordered={false}
        columns={tableColumns}
        formColumns={searchFormSchema}
        reload={reload}
        rowKey="id"
        searchable={true}
        setReload={setReload}
        size="small"
        slots={{
          tools: <Button className="bg-green-500 hover:bg-green-600" icon={<PlusOutlined />} size="small" type="primary" onClick={handleAdd}>
            新增
          </Button>
        }}
      />
      <Modal
        destroyOnHidden={true}
        footer={null}
        open={open}
        title={formData?.id ? '编辑角色' : '新增角色'}
        onCancel={() => setOpen(false)}
      >
        <EditModal formData={formData} onCancel={() => setOpen(false)} onSubmit={onSubmit} />
      </Modal>
    </>
  )
}