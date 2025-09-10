import { FormItemConfig } from "@/types/form-config"

const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '人员名称',
      name: 'name',
      type: 'input',
      placeholder: '请输入人员名称',
      span: 24,
      rules: [
        { required: true, message: '请输入人员名称' },
        { min: 2, max: 50, message: '人员名称长度在2-50个字符之间' }
      ]
    },
    {
      label: '所属机构',
      name: 'organizationId',
      type: 'apiSelect',
      placeholder: '请选择所属机构',
      span: 24,
      api: '/admin/organizations/dicts',
      required: true,
      hidden: true,
    },
    {
      label: '护理套餐',
      name: 'packageId',
      type: 'apiSelect',
      placeholder: '请选择护理套餐',
      span: 24,
      api: '/admin/carePackages/dicts',
      required: true,
    },
    {
      label: '联系电话',
      name: 'mobile',
      type: 'input',
      placeholder: '请输入联系电话',
      span: 12,
      required: true,
    },
    {
      label: '证件号',
      name: 'credential',
      type: 'input',
      placeholder: '请输入证件号',
      span: 12,
      rules: [
        { required: true, message: '请输入证件号' },
        { min: 1, max: 50, message: '证件号长度在1-50个字符之间' }
      ]
    },
    {
      label: '地址',
      name: 'address',
      type: 'textarea',
      placeholder: '请输入地址',
      span: 24,
      required: true,
      rows: 3
    },
    {
      label: '备注',
      name: 'description',
      type: 'textarea',
      placeholder: '请输入备注',
      span: 24,
      rows: 3
    },
    {
      label: '状态',
      name: 'status',
      type: 'radio',
      required: true,
      span: 24,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ]
    }
  ]
  return {
    searchFormSchema,
  }
}

export default useItems 