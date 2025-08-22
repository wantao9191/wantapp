import { ConfigProvider } from 'antd'

// Ant Design 主题配置
export const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
  },
}

export default ConfigProvider
