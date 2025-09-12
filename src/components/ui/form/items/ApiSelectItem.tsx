'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Select, message } from 'antd'
import { http } from '@/lib/https'
import type { FormItemConfig, FormContext } from '@/types/form-config'

const { Option } = Select

interface ApiSelectItemProps {
  config: FormItemConfig & ApiSelectConfig
  value?: any
  onChange?: (value: any) => void
  disabled?: boolean
  formContext?: FormContext
}

// API Select 配置接口
interface ApiSelectConfig {
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
  placeholder?: string
  
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

// 缓存管理
const apiCache = new Map<string, { data: any[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

const ApiSelectItem: React.FC<ApiSelectItemProps> = ({ 
  config, 
  value, 
  onChange, 
  disabled,
  formContext
}) => {
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const {
    api,
    method = 'GET',
    params = {},
    headers = {},
    dataPath = 'data.contents',
    labelField = 'label',
    valueField = 'value',
    disabledField = 'disabled',
    allowClear = true,
    showSearch = true,
    filterOption = true,
    mode,
    maxTagCount,
    cache = true,
    cacheKey,
    beforeRequest,
    afterResponse,
    onError,
    onSearch,
    onFocus,
    onBlur
  } = config

  // 获取缓存键
  const getCacheKey = useCallback(() => {
    return cacheKey || `${api}_${JSON.stringify(params)}`
  }, [api, params, cacheKey])

  // 从缓存获取数据
  const getFromCache = useCallback(() => {
    if (!cache) return null
    
    const key = getCacheKey()
    const cached = apiCache.get(key)
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }
    
    return null
  }, [cache, getCacheKey])

  // 设置缓存数据
  const setToCache = useCallback((data: any[]) => {
    if (!cache) return
    
    const key = getCacheKey()
    apiCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [cache, getCacheKey])

  // 处理响应数据
  const processResponseData = useCallback((responseData: any) => {
    let data = responseData
    
    // 根据 dataPath 获取数据
    if (dataPath) {
      const paths = dataPath.split('.')
      for (const path of paths) {
        if (data && typeof data === 'object' && path in data) {
          data = data[path]
        } else {
          console.warn(`ApiSelectItem: 无法从响应中找到路径 "${dataPath}"`)
          data = []
          break
        }
      }
    }
    
    // 确保数据是数组
    if (!Array.isArray(data)) {
      console.warn('ApiSelectItem: 响应数据不是数组格式')
      data = []
    }
    
    // 转换数据格式
    const processedData = data.map((item: any) => ({
      label: item[labelField] || item.name || item.title || '未知',
      value: item[valueField] || item.id || item.code,
      disabled: item[disabledField] || false,
      ...item // 保留原始数据
    }))
    
    // 自定义数据处理
    return afterResponse ? afterResponse(processedData) : processedData
  }, [dataPath, labelField, valueField, disabledField, afterResponse])

  // 请求数据
  const fetchData = useCallback(async (searchParams: Record<string, any> = {}) => {
    if (!api) {
      console.warn('ApiSelectItem: 未配置 API 地址')
      return
    }

    // 检查缓存（仅在非搜索状态下）
    if (!searchParams.search) {
      const cachedData = getFromCache()
      if (cachedData) {
        setOptions(cachedData)
        return
      }
    }

    setLoading(true)
    
    try {
      // 合并请求参数
      let requestParams = { ...params, ...searchParams }
      
      // 请求前处理参数
      if (beforeRequest) {
        requestParams = beforeRequest(requestParams)
      }

      let response
      if (method === 'POST') {
        response = await http.post(api, requestParams, { headers })
      } else {
        response = await http.get(api, requestParams, { headers })
      }

      const processedData = processResponseData(response)
      setOptions(processedData)
      
      // 缓存数据（仅在非搜索状态下）
      if (!searchParams.search) {
        setToCache(processedData)
      }
      
    } catch (error: any) {
      console.error('ApiSelectItem: 请求失败', error)
      message.error(error.message || '数据加载失败')
      
      if (onError) {
        onError(error)
      }
      
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [
    api, 
    method, 
    params, 
    headers, 
    beforeRequest, 
    processResponseData, 
    getFromCache, 
    setToCache, 
    onError
  ])

  // 搜索处理
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    
    if (onSearch) {
      onSearch(value)
    }
    
    // 如果配置了搜索，发送请求
    if (value && showSearch) {
      fetchData({ search: value, keyword: value, q: value })
    } else if (!value) {
      // 清空搜索时重新加载数据
      fetchData()
    }
  }, [onSearch, showSearch, fetchData])

  // 组件挂载时加载数据
  useEffect(() => {
    fetchData()
  }, [api, JSON.stringify(params)]) // 只依赖关键参数

  // 自定义过滤选项
  const customFilterOption = useCallback((input: string, option: any) => {
    if (typeof filterOption === 'function') {
      return filterOption(input, option)
    }
    
    if (filterOption === false) {
      return true
    }
    
    const label = option.children || option.label || ''
    return label.toLowerCase().includes(input.toLowerCase())
  }, [filterOption])

  // 解析函数参数 - 使用 useMemo 缓存计算结果
  const resolvedPlaceholder = useMemo(() => {
    return formContext && typeof config.placeholder === 'function' 
      ? (config.placeholder as any)(formContext) 
      : config.placeholder
  }, [config.placeholder, formContext])

  const resolvedDisabled = useMemo(() => {
    return formContext && typeof config.disabled === 'function' 
      ? (config.disabled as any)(formContext) 
      : config.disabled
  }, [config.disabled, formContext])

  const resolvedStyle = useMemo(() => {
    return formContext && typeof config.style === 'function' 
      ? (config.style as any)(formContext) 
      : config.style
  }, [config.style, formContext])

  const resolvedClassName = useMemo(() => {
    return formContext && typeof config.className === 'function' 
      ? (config.className as any)(formContext) 
      : config.className
  }, [config.className, formContext])

  // 使用 useMemo 缓存选项列表
  const optionElements = useMemo(() => {
    return options.map((option: any) => (
      <Option 
        key={option.value} 
        disabled={option.disabled} 
        label={option.label}
        value={option.value}
      >
        {option.label}
      </Option>
    ))
  }, [options])

  // 使用 useMemo 缓存静态属性对象（不包含 value 和 onChange）
  const staticProps = useMemo(() => ({
    placeholder: resolvedPlaceholder as string || '请选择',
    disabled: disabled || (resolvedDisabled as boolean),
    style: resolvedStyle as React.CSSProperties,
    className: resolvedClassName as string,
    mode: config.type === 'multiSelect' ? (mode || 'multiple') : mode,
    allowClear: allowClear,
    showSearch: showSearch,
    filterOption: showSearch ? customFilterOption : false,
    maxTagCount: maxTagCount,
    loading: loading,
    onSearch: handleSearch,
    onFocus: onFocus,
    onBlur: onBlur,
    size: (config as any).size,
    notFoundContent: loading ? '加载中...' : '暂无数据'
  }), [
    resolvedPlaceholder,
    disabled,
    resolvedDisabled,
    resolvedStyle,
    resolvedClassName,
    config.type,
    mode,
    allowClear,
    showSearch,
    customFilterOption,
    maxTagCount,
    loading,
    handleSearch,
    onFocus,
    onBlur,
    config
  ])

  return (
    <Select {...staticProps} value={value} onChange={onChange}>
      {optionElements}
    </Select>
  )
}

// 使用 React.memo 包装组件，避免不必要的重新渲染
export default React.memo(ApiSelectItem, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  // 注意：value 变化时允许重新渲染，因为这是正常的选择行为
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.config === nextProps.config &&
    prevProps.formContext === nextProps.formContext &&
    prevProps.onChange === nextProps.onChange
  )
})
