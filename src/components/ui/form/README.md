# 表单配置系统

基于 Ant Design 的配置化表单系统，通过配置对象快速构建复杂表单。

## 核心特性

- 🎯 **配置化驱动**: 通过配置对象生成表单
- 🔧 **丰富的表单项**: 支持 20+ 种表单项类型
- 🔄 **动态表单**: 支持表单项依赖关系
- 📱 **响应式布局**: 支持栅格布局
- ✅ **完整验证**: 内置常用验证规则
- 📦 **TypeScript**: 完整类型支持

## 基础用法

```tsx
import { ConfigForm, createFormConfig, FormRules } from '@/components/form'

const formConfig = createFormConfig()
  .layout('vertical')
  .addInput('username', '用户名', {
    required: true,
    rules: [FormRules.required(), FormRules.min(3)]
  })
  .addSelect('gender', '性别', [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' }
  ])
  .build()

<ConfigForm config={formConfig} onFinish={handleSubmit} />
```

## 支持的表单项类型

- `input` - 输入框
- `textarea` - 文本域  
- `password` - 密码框
- `number` - 数字输入框
- `select` - 下拉选择器
- `multiSelect` - 多选下拉选择器
- `radio` - 单选框组
- `checkbox` - 复选框组
- `switch` - 开关
- `date` - 日期选择器
- `dateRange` - 日期范围选择器
- `time` - 时间选择器
- `upload` - 文件上传
- `cascader` - 级联选择器
- `treeSelect` - 树选择器
- `rate` - 评分组件
- `slider` - 滑动输入条
- `colorPicker` - 颜色选择器
- `custom` - 自定义组件

## 快速创建表单

```tsx
import { createQuickForm } from '@/components/form'

const formConfig = createQuickForm({
  layout: 'vertical',
  size: 'middle',
  items: [
    { type: 'input', name: 'name', label: '姓名', required: true },
    { type: 'select', name: 'gender', label: '性别', options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]},
    { type: 'date', name: 'birthday', label: '生日' }
  ]
})
```

## 验证规则

```tsx
import { FormRules } from '@/components/form'

const rules = [
  FormRules.required('请输入用户名'),
  FormRules.email('请输入正确的邮箱'),
  FormRules.phone('请输入正确的手机号'),
  FormRules.min(3, '最少3个字符'),
  FormRules.max(20, '最多20个字符')
]
```