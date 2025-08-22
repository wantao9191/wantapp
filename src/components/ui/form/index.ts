// 表单组件导出
export { default as ConfigForm } from './ConfigForm'
export type { ConfigFormProps, ConfigFormRef } from './ConfigForm'

export { default as FormItemRenderer } from './FormItemRenderer'



// 类型定义导出
export type {
  FormItemType,
  BaseFormItemConfig,
  InputConfig,
  NumberConfig,
  SelectConfig,
  RadioConfig,
  CheckboxConfig,
  SwitchConfig,
  DateConfig,
  UploadConfig,
  CascaderConfig,
  TreeSelectConfig,
  RateConfig,
  SliderConfig,
  ColorPickerConfig,
  CustomConfig,
  FormItemConfig,
  FormConfig
} from '@/types/form-config'

// 工具函数导出
export {
  FormConfigBuilder,
  createFormConfig,
  createQuickForm,
  FormRules,
} from '@/lib/form-utils'