import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '机构名称',
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
      title: '机构名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
    },
    {
      title: '联系电话',
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
      title: '负责人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '成立时间',
      dataIndex: 'setupTime',
      key: 'setupTime',
      width: 160,
    },
    {
      title: '描述',
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