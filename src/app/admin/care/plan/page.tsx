'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import { Button, Modal, message } from 'antd'
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import EditModal from './components/editModal'
export default function OrganizationsPage() {
  const { confirm } = Modal
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems(setReload)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>(null)
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
        label: '编辑',
        type: 'link',
        onClick: (record: any) => {
          setFormData(record)
          setOpen(true)
        }
      },
      {
        key: 'delete',
        label: '删除',
        type: 'link',
        danger: true,
        onClick: async (record: any) => {
          handleDelete(record)
        }
      }
    ]
  }

  const getList = (params: Record<string, any>) => {
    return http.get('/admin/carePackages', params)
  }
  const handleAdd = () => {
    setFormData(null)
    setOpen(true)
  }
  const handleDelete = (record: any) => {
    confirm({
      title: '删除护理套餐后，该护理套餐将无法正常使用，确定删除该护理套餐吗？',
      icon: <ExclamationCircleFilled />,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        return new Promise((resolve, reject) => {
          http.delete(`/admin/carePackages/${record.id}`).then(() => {
            message.success('删除成功', 1)
            setReload(true)
            resolve(true)
          }).catch(() => {
            reject(false)
          })
        })
      }
    })
  }
  const onSubmit = () => {
    setReload(true)
    setOpen(false)
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
        title={formData?.id ? '编辑护理套餐' : '新增护理套餐'}
        onCancel={() => setOpen(false)}
      >
        <EditModal formData={formData} onCancel={() => setOpen(false)} onSubmit={onSubmit} />
      </Modal>
    </>
  )
}