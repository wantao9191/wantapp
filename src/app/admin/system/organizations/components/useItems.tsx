import { FormItemConfig } from "@/types/form-config"

const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '机构名称',
      name: 'name',
      type: 'input',
      placeholder: '请输入机构名称',
      span: 24,
      rules: [
        { required: true, message: '请输入机构名称' },
        { min: 2, max: 50, message: '机构名称长度在2-50个字符之间' }
      ]
    },
    {
      label: '联系方式',
      name: 'phone',
      type: 'input',
      placeholder: '请输入联系电话',
      span: 12,
      rules: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
      ]
    },
    {
      label: '邮箱',
      name: 'email',
      type: 'input',
      placeholder: '请输入邮箱地址',
      span: 12,
      rules: [
        { type: 'email', message: '请输入正确的邮箱地址' }
      ]
    },
    {
      label: '地址',
      name: 'address',
      type: 'textarea',
      placeholder: '请输入详细地址',
      span: 24,
      rows: 3,
      rules: [
        { max: 200, message: '地址长度不能超过200个字符' }
      ]
    },
    {
      label: '负责人',
      name: 'operator',
      type: 'input',
      placeholder: '请输入负责人姓名',
      span: 12
    },
    {
      label: '成立时间',
      name: 'setupTime',
      type: 'date',
      placeholder: '请选择成立时间',
      span: 12,
      format: 'YYYY-MM-DD',
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
    },
    {
      label: '备注',
      name: 'description',
      type: 'textarea',
      placeholder: '请输入备注信息',
      span: 24,
      rows: 3,
      rules: [
        { max: 500, message: '备注长度不能超过500个字符' }
      ]
    }
  ]

  return {
    searchFormSchema,
  }
}

export default useItems 