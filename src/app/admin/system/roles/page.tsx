'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import { Button, message, Modal } from 'antd'
import { PlusOutlined,  } from '@ant-design/icons'
import EditModal from './components/editModal'
export default function OrganizationsPage() {
  const { confirm } = Modal
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  // 组织管理的操作按钮
  const organizationActions: ActionConfig = {
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
          console.log('编辑组织:', record)
        }
      }
    ]
  }

  const getOrganizationList = (params: Record<string, any>) => {
    return http.get('/admin/roles', params)
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
        columns={tableColumns}
        formColumns={searchFormSchema}
        rowKey="id"
        actions={organizationActions}
        size="small"
        searchable={true}
        bordered={false}
        slots={{
          tools: <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd} className="bg-green-500 hover:bg-green-600">
            新增
          </Button>
        }}
        api={getOrganizationList}
        reload={reload}
        setReload={setReload}
      />
      <Modal
        title={formData?.id ? '编辑角色' : '新增角色'}
        open={open}
        footer={null}
        destroyOnHidden={true}
        onCancel={() => setOpen(false)}
      >
        <EditModal formData={formData} onSubmit={onSubmit} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  )
}