import { ThemeConfig } from 'antd'

// Ant Design 主题配置
export const themeConfig: ThemeConfig = {
  token: {
    // 主色调
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    
    // 字体
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    // 边框圆角
    borderRadius: 8,
    
    // 间距
    wireframe: false,
  },
  components: {
    // 布局组件
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      siderBg: '#001529',
    },
    
    // 菜单组件
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1677ff',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
    },
    
    // 表格组件
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#f5f5f5',
    },
    
    // 按钮组件
    Button: {
      borderRadius: 6,
    },
    
    // 输入框组件
    Input: {
      borderRadius: 6,
    },
  },
  algorithm: [
    // 可以添加算法，如暗色主题
  ],
}
