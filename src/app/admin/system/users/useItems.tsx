import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
import { Switch, Tag } from 'antd'
import { useState } from 'react'
import { http } from '@/lib/https'
import { removeUndefined } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
const useItems = (setReload: (reload: boolean) => void) => {
  const [loading, setLoading] = useState(false)
  const { userInfo } = useAuth()
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '用户名称',
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
      title: '用户名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 200,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '所属机构',
      dataIndex: 'organizationName',
      key: 'organizationName',
      width: 100,
    },
    {
      title: '角色',
      dataIndex: 'roleNames',
      key: 'roleNames',
      width: 160,
      render: (roleNames: string[]) => {
        return roleNames ? roleNames.join(', ') : '-'
      }
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
          await http.put(`/admin/users/${record.id}`, {
            ...removeUndefined(record),
            status: checked ? 1 : 0
          })
          setLoading(false)
          setReload(true)
        }
        return (
          userInfo.id !== record.id ?
            <Switch
              checked={status === 1}
              checkedChildren="启用"
              loading={loading}
              size="small"
              unCheckedChildren="禁用"
              onChange={handleStatusChange} /> :
            <Tag className='!mr-0' color={status === 1 ? 'success' : 'magenta'}>{status === 1 ? '启用' : '禁用'}</Tag>
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