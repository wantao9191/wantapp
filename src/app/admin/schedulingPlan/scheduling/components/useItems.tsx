import { FormItemConfig } from "@/types/form-config"
import Permissions from "./permissions";

const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '角色名称',
      name: 'name',
      type: 'input',
      placeholder: '请输入角色名称',
      span: 24,
      rules: [
        { required: true, message: '请输入角色名称' },
        { min: 2, max: 50, message: '角色名称长度在2-50个字符之间' }
      ]
    },
    {
      label: '菜单权限',
      name: ['menus', 'permissions'], // 支持数组name，提交时会同时设置两个字段
      type: 'custom',
      component: Permissions,
      placeholder: '请选择菜单权限',
      span: 24,
      required: false
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