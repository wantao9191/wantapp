import { type ClassValue, clsx } from 'clsx'

/**
 * 合并 CSS 类名的工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 生成随机 ID
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 截断文本
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * 生成 slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}
/**
 * 移除对象中的undefined/null
 */
export function removeUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null))
}
/**
 * 根据 parentCode 关联数组，构建树形结构
 * @param menuData 菜单数据数组
 */
export function buildMenuTree(menuData: any[]) {
  // 创建菜单映射表
  const menuMap = new Map<string, any>()
  const rootMenus: any[] = []

  // 第一步：创建所有菜单的映射，并初始化 children 数组
  menuData.forEach(menu => {
    menuMap.set(menu.code, {
      ...menu,
      children: []
    })
  })

  // 第二步：构建父子关系
  menuData.forEach(menu => {
    if (menu.parentCode) {
      // 子菜单：找到父菜单，添加到其 children 中
      const parent = menuMap.get(menu.parentCode)
      if (parent) {
        parent.children.push(menuMap.get(menu.code))
      } else {
        console.warn(`⚠️ 未找到父菜单: ${menu.parentCode}，菜单: ${menu.name}`)
      }
    } else {
      // 根菜单：没有 parentCode 的菜单
      rootMenus.push(menuMap.get(menu.code))
    }
  })

  return rootMenus
}

/**
 * 身份证号校验结果接口
 */
export interface IdCardValidationResult {
  isValid: boolean
  type: '15' | '18' | null
  age?: number
  gender?: '男' | '女'
  birthDate?: string
  province?: string
  error?: string
}

/**
 * 身份证号校验和解析
 * @param idCard 身份证号码
 * @returns 校验结果，包含有效性、年龄、性别等信息
 */
export function validateIdCard(idCard: string): IdCardValidationResult {
  if (!idCard || typeof idCard !== 'string') {
    return { isValid: false, type: null, error: '身份证号不能为空' }
  }

  // 去除空格并转换为大写
  const cleanIdCard = idCard.trim().toUpperCase()

  // 15位身份证号校验
  if (cleanIdCard.length === 15) {
    return validate15DigitIdCard(cleanIdCard)
  }

  // 18位身份证号校验
  if (cleanIdCard.length === 18) {
    return validate18DigitIdCard(cleanIdCard)
  }

  return { isValid: false, type: null, error: '身份证号长度不正确' }
}

/**
 * 校验15位身份证号
 */
function validate15DigitIdCard(idCard: string): IdCardValidationResult {
  // 15位身份证号格式：6位地区码 + 6位出生日期(YYMMDD) + 3位顺序码
  const pattern = /^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/
  
  if (!pattern.test(idCard)) {
    return { isValid: false, type: null, error: '15位身份证号格式不正确' }
  }

  // 提取出生日期
  const year = parseInt('19' + idCard.substr(6, 2))
  const month = parseInt(idCard.substr(8, 2))
  const day = parseInt(idCard.substr(10, 2))
  
  // 验证日期有效性
  const birthDate = new Date(year, month - 1, day)
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
    return { isValid: false, type: null, error: '出生日期无效' }
  }

  // 获取性别（第15位数字，奇数为男，偶数为女）
  const genderCode = parseInt(idCard.substr(14, 1))
  const gender = genderCode % 2 === 1 ? '男' : '女'

  // 计算年龄
  const age = calculateAge(birthDate)

  return {
    isValid: true,
    type: '15',
    age,
    gender,
    birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    province: getProvinceName(idCard.substr(0, 2))
  }
}

/**
 * 校验18位身份证号
 */
function validate18DigitIdCard(idCard: string): IdCardValidationResult {
  // 18位身份证号格式：6位地区码 + 8位出生日期(YYYYMMDD) + 3位顺序码 + 1位校验码
  const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/
  
  if (!pattern.test(idCard)) {
    return { isValid: false, type: null, error: '18位身份证号格式不正确' }
  }

  // 提取出生日期
  const year = parseInt(idCard.substr(6, 4))
  const month = parseInt(idCard.substr(10, 2))
  const day = parseInt(idCard.substr(12, 2))
  
  // 验证日期有效性
  const birthDate = new Date(year, month - 1, day)
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
    return { isValid: false, type: null, error: '出生日期无效' }
  }

  // 验证校验码
  if (!validateCheckCode(idCard)) {
    return { isValid: false, type: null, error: '身份证号校验码错误' }
  }

  // 获取性别（第17位数字，奇数为男，偶数为女）
  const genderCode = parseInt(idCard.substr(16, 1))
  const gender = genderCode % 2 === 1 ? '男' : '女'

  // 计算年龄
  const age = calculateAge(birthDate)

  return {
    isValid: true,
    type: '18',
    age,
    gender,
    birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    province: getProvinceName(idCard.substr(0, 2))
  }
}

/**
 * 验证18位身份证号的校验码
 */
function validateCheckCode(idCard: string): boolean {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  return checkCode === idCard[17]
}

/**
 * 计算年龄
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * 根据省份代码获取省份名称
 */
function getProvinceName(provinceCode: string): string {
  const provinceMap: Record<string, string> = {
    '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古',
    '21': '辽宁', '22': '吉林', '23': '黑龙江', '31': '上海', '32': '江苏',
    '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东',
    '41': '河南', '42': '湖北', '43': '湖南', '44': '广东', '45': '广西',
    '46': '海南', '50': '重庆', '51': '四川', '52': '贵州', '53': '云南',
    '54': '西藏', '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏',
    '65': '新疆', '71': '台湾', '81': '香港', '82': '澳门'
  }
  
  return provinceMap[provinceCode] || '未知'
}

/**
 * 从身份证号获取年龄
 * @param idCard 身份证号码
 * @returns 年龄，如果身份证号无效返回 null
 */
export function getAgeFromIdCard(idCard: string): number | null {
  const result = validateIdCard(idCard)
  return result.isValid ? result.age || null : null
}

/**
 * 从身份证号获取性别
 * @param idCard 身份证号码
 * @returns 性别，如果身份证号无效返回 null
 */
export function getGenderFromIdCard(idCard: string): '男' | '女' | null {
  const result = validateIdCard(idCard)
  return result.isValid ? result.gender || null : null
}

/**
 * 从身份证号获取出生日期
 * @param idCard 身份证号码
 * @returns 出生日期字符串 (YYYY-MM-DD)，如果身份证号无效返回 null
 */
export function getBirthDateFromIdCard(idCard: string): string | null {
  const result = validateIdCard(idCard)
  return result.isValid ? result.birthDate || null : null
}