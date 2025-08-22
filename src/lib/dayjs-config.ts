import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展 dayjs 插件
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

// 设置默认语言为中文
dayjs.locale('zh-cn')

// 设置默认时区（可选，根据你的需求设置）
dayjs.tz.setDefault('Asia/Shanghai')

export default dayjs
