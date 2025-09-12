import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
import { Switch } from 'antd'
import { useState } from 'react'
import { http } from '@/lib/https'
import { removeUndefined } from '@/lib/utils'
const useItems = (setReload: (reload: boolean) => void) => {
  const [loading, setLoading] = useState(false)
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '权限名称',
      name: 'name',
      type: 'input',
    },
    {
      label: '状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  ]
  const tableColumns: TableColumnConfig[] = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
      width: 200,
    },
    {
      title: '菜单编码',
      dataIndex: 'menuId',
      key: 'menuId',
      width: 130,
    },
    {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number, record: any) => {
        const handleStatusChange = async (checked: boolean) => {
          setLoading(true)
          await http.put(`/admin/permissions/${record.id}`, {
            ...removeUndefined(record),
            status: checked ? 1 : 0
          })
          setLoading(false)
          setReload(true)
        }
        return (
          <Switch checked={status === 1} checkedChildren="启用" loading={loading} size="small" unCheckedChildren="禁用" onChange={handleStatusChange} />
        )
      }
    }
  ]
  return {
    tableColumns,
    searchFormSchema
  }
}
export default useItems