'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import { Button, message, Modal } from 'antd'
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import EditModal from './components/editModal'
import { useAuth } from '@/hooks/useAuth'
export default function OrganizationsPage() {
  const { userInfo } = useAuth()
  const { confirm } = Modal
  const [reload, setReload] = useState(false)
  const { tableColumns, searchFormSchema } = useItems(setReload)
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
          console.log(record,formData)
          setOpen(true)
          console.log('编辑组织:', record)
        },
        hidden: (record: any) => record.id === userInfo.id
      },
      {
        key: 'delete',
        label: '删除',
        type: 'link',
        danger: true,
        onClick: (record: any) => {
          handleDelete(record)
        },
        hidden: (record: any) => record.id === userInfo.id
      }
    ]
  }

  const getOrganizationList = (params: Record<string, any>) => {
    return http.get('/admin/users', params)
  }
  const handleAdd = () => {
    setFormData(null)
    setOpen(true)
  }
  const onSubmit = () => {
    setReload(true)
    setOpen(false)
  }
  const handleDelete = (record: any) => {
    confirm({
      title: '删除该用户吗，删除后该用户将无法正常使用？',
      icon: <ExclamationCircleFilled />,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        return new Promise((resolve, reject) => {
          http.delete(`/admin/users/${record.id}`).then(() => {
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
        title={formData?.id ? '编辑用户' : '新增用户'}
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