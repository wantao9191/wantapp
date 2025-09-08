import { FormItemConfig } from "@/types/form-config"

const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '任务名称',
      name: 'name',
      type: 'input',
      placeholder: '请输入任务名称',
      span: 24,
      rules: [
        { required: true, message: '请输入任务名称' },
        { min: 2, max: 50, message: '任务名称长度在2-50个字符之间' }
      ]
    },
    {
      label: '任务级别',
      name: 'level',
      type: 'select',
      placeholder: '请选择任务级别',
      span: 24,
      options: [
        { label: '基础护理', value: 'basic' },
        { label: '专业护理', value: 'professional' },
      ],
      required: true,
    },
    {
      label: '最小时长',
      name: 'minDuration',
      type: 'number',
      placeholder: '请输入最小时长',
      span: 12,
      required: true,
    },
    {
      label: '最大时长',
      name: 'maxDuration',
      type: 'number',
      placeholder: '请输入最大时长',
      span: 12,
      required: true,
    },
    {
      label: '封面',
      name: 'coverId',
      type: 'upload',
      placeholder: '请选择封面',
      accept: 'image/*',
      multiple: false,
      maxCount: 1,
      span: 24,
      required: true,
      componentProps: {
        helpText: '仅支持图片文件,最大10M'
      },
    },
    {
      label: '音频',
      name: 'audioId',
      type: 'upload',
      placeholder: '请选择音频',
      span: 24,
      accept: 'audio/*',
      multiple: false,
      maxCount: 1,
      listType: 'text',
      required: true,
      componentProps: {
        helpText: '仅支持音频文件,最大10M',
      },
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