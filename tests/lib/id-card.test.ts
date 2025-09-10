import { describe, it, expect } from 'vitest'
import { 
  validateIdCard, 
  getAgeFromIdCard, 
  getGenderFromIdCard, 
  getBirthDateFromIdCard 
} from '@/lib/utils'

describe('身份证号校验功能', () => {
  describe('validateIdCard', () => {
    it('应该正确校验18位有效身份证号', () => {
      // 这是一个有效的18位身份证号（测试用）
      const validIdCard = '110101199003074514'
      const result = validateIdCard(validIdCard)
      
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('18')
      expect(result.gender).toBe('男')
      expect(result.birthDate).toBe('1990-03-07')
      expect(result.province).toBe('北京')
      expect(result.age).toBeGreaterThan(0)
    })

    it('应该正确校验15位有效身份证号', () => {
      // 这是一个有效的15位身份证号（测试用）
      const validIdCard = '110101900307451'
      const result = validateIdCard(validIdCard)
      
      expect(result.isValid).toBe(true)
      expect(result.type).toBe('15')
      expect(result.gender).toBe('男')
      expect(result.birthDate).toBe('1990-03-07')
      expect(result.province).toBe('北京')
      expect(result.age).toBeGreaterThan(0)
    })

    it('应该拒绝无效的身份证号长度', () => {
      const invalidIdCard = '123456789'
      const result = validateIdCard(invalidIdCard)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('身份证号长度不正确')
    })

    it('应该拒绝空身份证号', () => {
      const result = validateIdCard('')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('身份证号不能为空')
    })

    it('应该拒绝null或undefined', () => {
      expect(validateIdCard(null as any).isValid).toBe(false)
      expect(validateIdCard(undefined as any).isValid).toBe(false)
    })

    it('应该拒绝无效的出生日期', () => {
      const invalidDateIdCard = '110101199002304515' // 2月30日不存在
      const result = validateIdCard(invalidDateIdCard)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('出生日期无效')
    })

    it('应该拒绝无效的校验码', () => {
      const invalidCheckCodeIdCard = '110101199003074516' // 错误的校验码
      const result = validateIdCard(invalidCheckCodeIdCard)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('身份证号校验码错误')
    })

    it('应该正确处理女性身份证号', () => {
      const femaleIdCard = '110101199003074522' // 女性身份证号
      const result = validateIdCard(femaleIdCard)
      
      expect(result.isValid).toBe(true)
      expect(result.gender).toBe('女')
    })

    it('应该正确识别省份', () => {
      const beijingIdCard = '110101199003074514'
      const shanghaiIdCard = '310101199003074511'
      const guangdongIdCard = '440101199003074510'
      
      expect(validateIdCard(beijingIdCard).province).toBe('北京')
      expect(validateIdCard(shanghaiIdCard).province).toBe('上海')
      expect(validateIdCard(guangdongIdCard).province).toBe('广东')
    })

    it('应该处理未知省份代码', () => {
      const unknownProvinceIdCard = '991101199003074519'
      const result = validateIdCard(unknownProvinceIdCard)
      
      expect(result.isValid).toBe(true)
      expect(result.province).toBe('未知')
    })
  })

  describe('getAgeFromIdCard', () => {
    it('应该正确计算年龄', () => {
      const idCard = '110101199003074514'
      const age = getAgeFromIdCard(idCard)
      
      expect(age).toBeGreaterThan(30) // 1990年出生，现在应该30多岁
      expect(typeof age).toBe('number')
    })

    it('应该对无效身份证号返回null', () => {
      const invalidIdCard = '123456789'
      const age = getAgeFromIdCard(invalidIdCard)
      
      expect(age).toBeNull()
    })
  })

  describe('getGenderFromIdCard', () => {
    it('应该正确识别男性', () => {
      const maleIdCard = '110101199003074514'
      const gender = getGenderFromIdCard(maleIdCard)
      
      expect(gender).toBe('男')
    })

    it('应该正确识别女性', () => {
      const femaleIdCard = '110101199003074522'
      const gender = getGenderFromIdCard(femaleIdCard)
      
      expect(gender).toBe('女')
    })

    it('应该对无效身份证号返回null', () => {
      const invalidIdCard = '123456789'
      const gender = getGenderFromIdCard(invalidIdCard)
      
      expect(gender).toBeNull()
    })
  })

  describe('getBirthDateFromIdCard', () => {
    it('应该正确提取出生日期', () => {
      const idCard = '110101199003074514'
      const birthDate = getBirthDateFromIdCard(idCard)
      
      expect(birthDate).toBe('1990-03-07')
    })

    it('应该对无效身份证号返回null', () => {
      const invalidIdCard = '123456789'
      const birthDate = getBirthDateFromIdCard(invalidIdCard)
      
      expect(birthDate).toBeNull()
    })
  })

  describe('边界情况测试', () => {
    it('应该处理包含空格的身份证号', () => {
      const idCardWithSpaces = ' 110101199003074514 '
      const result = validateIdCard(idCardWithSpaces)
      
      expect(result.isValid).toBe(true)
    })

    it('应该处理小写x的身份证号', () => {
      // 使用一个校验码为X的身份证号
      const idCardWithLowerX = '11010119900307459x'
      const result = validateIdCard(idCardWithLowerX)
      
      expect(result.isValid).toBe(true)
    })

    it('应该拒绝2000年之前的无效年份', () => {
      const invalidYearIdCard = '110101189003074514' // 1890年
      const result = validateIdCard(invalidYearIdCard)
      
      expect(result.isValid).toBe(false)
    })

    it('应该拒绝未来年份', () => {
      const futureYearIdCard = '110101209003074514' // 2090年
      const result = validateIdCard(futureYearIdCard)
      
      expect(result.isValid).toBe(false)
    })
  })
})
