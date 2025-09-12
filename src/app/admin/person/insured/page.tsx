'use client'

import React, { useState } from 'react'
import { ConfigTable, ActionConfig } from '@/components/ui/ConfirmTable'
import useItems from './useItems'
import { http } from '@/lib/https'
import { Button, Modal, message } from 'antd'
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import EditModal from './components/editModal'
export default function InsuredPage() {
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
    return http.get('/admin/insured', params)
  }
  const handleAdd = () => {
    setFormData(null)
    setOpen(true)
  }
  const handleDelete = (record: any) => {
    confirm({
      title: '确认删除参保人吗？',
      icon: <ExclamationCircleFilled />,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        return new Promise((resolve, reject) => {
          http.delete(`/admin/insured/${record.id}`).then(() => {
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
        title={formData?.id ? '编辑参保人' : '新增参保人'}
        onCancel={() => setOpen(false)}
      >
        <EditModal formData={formData} onCancel={() => setOpen(false)} onSubmit={onSubmit} />
      </Modal>
    </>
  )
}