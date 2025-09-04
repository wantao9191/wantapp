// 表单配置项类型定义
export type FormItemType = 
  | 'input'
  | 'textarea'
  | 'password'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'apiSelect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'dateRange'
  | 'time'
  | 'upload'
  | 'cascader'
  | 'treeSelect'
  | 'rate'
  | 'slider'
  | 'colorPicker'
  | 'custom'

export interface BaseFormItemConfig {
  name: string | string[] // 支持单个字段名或字段名数组
  label: string
  type: FormItemType
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  placeholder?: string
  tooltip?: string
  rules?: any[]
  dependencies?: string[]
  className?: string
  style?: React.CSSProperties
  span?: number // 栅格占位格数
  offset?: number // 栅格左侧的间隔格数
}

export interface InputConfig extends BaseFormItemConfig {
  type: 'input' | 'textarea' | 'password'
  maxLength?: number
  showCount?: boolean
  allowClear?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  rows?: number // textarea 专用
}

export interface NumberConfig extends BaseFormItemConfig {
  type: 'number'
  min?: number
  max?: number
  step?: number
  precision?: number
  formatter?: (value: number | string | undefined) => string
  parser?: (displayValue: string | undefined) => number | string
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}

export interface SelectConfig extends BaseFormItemConfig {
  type: 'select' | 'multiSelect'
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  allowClear?: boolean
  showSearch?: boolean
  filterOption?: boolean | ((input: string, option: any) => boolean)
  mode?: 'multiple' | 'tags'
  maxTagCount?: number
  loading?: boolean
  onSearch?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export interface ApiSelectConfig extends BaseFormItemConfig {
  type: 'apiSelect'
  // API 相关配置
  api?: string // API 接口地址
  method?: 'GET' | 'POST' // 请求方法，默认 GET
  params?: Record<string, any> // 请求参数
  headers?: Record<string, string> // 请求头
  
  // 数据处理配置
  dataPath?: string // 数据路径，如 'data.list' 或 'result'
  labelField?: string // 显示字段名，默认 'label'
  valueField?: string // 值字段名，默认 'value'
  disabledField?: string // 禁用字段名，默认 'disabled'
  
  // Select 配置
  allowClear?: boolean
  showSearch?: boolean
  filterOption?: boolean | ((input: string, option: any) => boolean)
  mode?: 'multiple' | 'tags'
  maxTagCount?: number
  size?: 'large' | 'middle' | 'small'
  
  // 缓存配置
  cache?: boolean // 是否缓存数据，默认 true
  cacheKey?: string // 缓存键名，默认使用 api 地址
  
  // 事件回调
  onSearch?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  beforeRequest?: (params: any) => any // 请求前的参数处理
  afterResponse?: (data: any) => any // 响应后的数据处理
  onError?: (error: any) => void // 错误处理
}

export interface RadioConfig extends BaseFormItemConfig {
  type: 'radio'
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  optionType?: 'default' | 'button'
  buttonStyle?: 'outline' | 'solid'
  size?: 'large' | 'middle' | 'small'
}

export interface CheckboxConfig extends BaseFormItemConfig {
  type: 'checkbox'
  options?: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  indeterminate?: boolean
}

export interface SwitchConfig extends BaseFormItemConfig {
  type: 'switch'
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  size?: 'default' | 'small'
}

export interface DateConfig extends BaseFormItemConfig {
  type: 'date' | 'dateRange' | 'time'
  format?: string
  showTime?: boolean
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  disabledDate?: (currentDate: any) => boolean
  showToday?: boolean
}

export interface UploadConfig extends BaseFormItemConfig {
  type: 'upload'
  action?: string
  accept?: string
  multiple?: boolean
  maxCount?: number
  listType?: 'text' | 'picture' | 'picture-card'
  beforeUpload?: (file: any) => boolean | Promise<any>
  onChange?: (info: any) => void
  onPreview?: (file: any) => void
  onRemove?: (file: any) => boolean | Promise<boolean>
}

export interface CascaderConfig extends BaseFormItemConfig {
  type: 'cascader'
  options: any[]
  expandTrigger?: 'click' | 'hover'
  multiple?: boolean
  showSearch?: boolean
  changeOnSelect?: boolean
  displayRender?: (labels: string[]) => React.ReactNode
}

export interface TreeSelectConfig extends BaseFormItemConfig {
  type: 'treeSelect'
  treeData: any[]
  multiple?: boolean
  treeCheckable?: boolean
  showCheckedStrategy?: 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD'
  treeDefaultExpandAll?: boolean
  allowClear?: boolean
}

export interface RateConfig extends BaseFormItemConfig {
  type: 'rate'
  count?: number
  allowHalf?: boolean
  allowClear?: boolean
  character?: React.ReactNode
  tooltips?: string[]
}

export interface SliderConfig extends BaseFormItemConfig {
  type: 'slider'
  min?: number
  max?: number
  step?: number
  marks?: Record<number, React.ReactNode>
  range?: boolean
  vertical?: boolean
  tooltipVisible?: boolean
}

export interface ColorPickerConfig extends BaseFormItemConfig {
  type: 'colorPicker'
  format?: 'hex' | 'hsb' | 'rgb'
  showText?: boolean
  allowClear?: boolean
  presets?: Array<{
    label: string
    colors: string[]
  }>
}

export interface CustomConfig extends BaseFormItemConfig {
  type: 'custom'
  component: React.ComponentType<any>
  componentProps?: Record<string, any>
}

export type FormItemConfig = 
  | InputConfig
  | NumberConfig
  | SelectConfig
  | ApiSelectConfig
  | RadioConfig
  | CheckboxConfig
  | SwitchConfig
  | DateConfig
  | UploadConfig
  | CascaderConfig
  | TreeSelectConfig
  | RateConfig
  | SliderConfig
  | ColorPickerConfig
  | CustomConfig

export interface FormConfig {
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelCol?: { span?: number; offset?: number }
  wrapperCol?: { span?: number; offset?: number }
  size?: 'small' | 'middle' | 'large'
  disabled?: boolean
  colon?: boolean
  requiredMark?: boolean | 'optional'
  scrollToFirstError?: boolean
  preserve?: boolean
  validateTrigger?: string | string[]
  items: FormItemConfig[]
}