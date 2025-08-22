import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '角色名称',
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
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
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