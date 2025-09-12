import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
import { Switch } from 'antd'
import { http } from '@/lib/https'
import { useState } from 'react'
const useItems = (setReload: (reload: boolean) => void) => {
  const [loading, setLoading] = useState(false)
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '套餐名称',
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
      title: '套餐名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '护理服务',
      dataIndex: 'taskNames',
      key: 'taskNames',
      render: (tasks: any[]) => {
        return tasks?.join(',')
      }
    },
    {
      title: '最小时长',
      dataIndex: 'minDuration',
      key: 'minDuration',
      width: 150
    },
    {
      title: '最大时长',
      dataIndex: 'maxDuration',
      key: 'maxDuration',
      width: 150
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
          try {
            setLoading(true)
            await http.put(`/admin/carePackages/${record.id}`, {
              ...record,
              status: checked ? 1 : 0
            })
            setLoading(false)
            setReload(true)
          }
          catch (error) {
            setLoading(false)
          }
        }
        return (
          <Switch
            checked={status === 1}
            checkedChildren="启用"
            loading={loading}
            size="small"
            unCheckedChildren="禁用"
            onChange={handleStatusChange}
          />
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