import { FormItemConfig } from "@/types/form-config"
import { Icons } from '@/components/ui/AppIcons'
const useItems = () => {
  const icons = Object.keys(Icons)
  console.log(icons)
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '菜单名称',
      name: 'name',
      type: 'input',
      placeholder: '请输入菜单名称',
      span: 24,
      rules: [
        { required: true, message: '请输入菜单名称' },
        { min: 2, max: 50, message: '菜单名称长度在2-50个字符之间' }
      ]
    },
    {
      label: '父级菜单',
      name: 'parentId',
      type: 'select',
      placeholder: '请选择父级菜单',
      span: 12,
      options: []
    },
    {
      label: '菜单路径',
      name: 'path',
      type: 'input',
      placeholder: '请输入菜单路径',
      span: 12
    },
    {
      label: '排序',
      name: 'sort',
      type: 'number',
      placeholder: '请输入排序',
      span: 12
    },
    {
      label: '菜单图标',
      name: 'icon',
      type: 'input',
      placeholder: '请输入菜单图标',
      span: 24
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