import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
import { Switch } from 'antd'
import { http } from '@/lib/https'
import { useState } from 'react'
const useItems = (setReload: (reload: boolean) => void) => {
  const [loading, setLoading] = useState(false)
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '人员名称',
      name: 'name',
      type: 'input',
    },
  ]
  const tableColumns: TableColumnConfig[] = [
    {
      title: '人员名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '联系电话',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 150
    },
    {
      title: '证件号',
      dataIndex: 'credential',
      key: 'credential',
      width: 150
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 150
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 150
    },
    {
      title: '出生年月',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 150
    },
    {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
      width: 160,
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