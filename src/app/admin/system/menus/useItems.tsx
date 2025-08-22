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
      label: '菜单名称',
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
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '菜单路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
    {
      title: '菜单图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 130,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 180,
    },
    {
      title: '父级菜单',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
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
          await http.put(`/admin/menus/${record.id}`, {
            ...removeUndefined(record),
            status: checked ? 1 : 0
          })
          setLoading(false)
          setReload(true)
        }
        return (
          <Switch checked={status === 1} size="small" checkedChildren="启用" unCheckedChildren="禁用" onChange={handleStatusChange} loading={loading} />
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    }
  ]
  return {
    tableColumns,
    searchFormSchema
  }
}
export default useItems