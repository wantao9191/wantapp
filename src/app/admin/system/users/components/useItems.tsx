import { FormItemConfig } from "@/types/form-config"

const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [

    {
      label: '用户名称',
      name: 'name',
      type: 'input',
      placeholder: '请输入用户名称',
      span: 24,
      rules: [
        { required: true, message: '请输入用户名称' },
        { min: 2, max: 50, message: '用户名称长度在2-50个字符之间' }
      ]
    },
    {
      label: '用户名',
      name: 'username',
      type: 'input',
      placeholder: '请输入用户名',
      span: 24,
      rules: [
        { required: true, message: '请输入用户名' },
        { min: 5, max: 50, message: '用户名长度在4-50个字符之间' }
      ]
    },
    {
      label: '手机号',
      name: 'phone',
      type: 'input',
      placeholder: '请输入手机号',
      span: 12,
      rules: [
        { required: true, message: '请输入手机号' },
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
      label: '所属机构',
      name: 'organizationId',
      type: 'apiSelect',
      placeholder: '请选择所属机构',
      span: 12,
      api: '/admin/organizations/dicts'
    },
    {
      label: '关联角色',
      name: 'roles',
      type: 'apiSelect',
      placeholder: '请选择关联角色',
      span: 12,
      api: '/admin/roles/dicts',
      mode: 'multiple'
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