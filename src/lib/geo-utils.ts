/**
 * 地理位置工具函数
 * 用于验证签到位置的合法性和防止位置篡改
 * 
 * 注意：中国地区的坐标系统
 * - WGS84: GPS 原始坐标系（国际标准）
 * - GCJ-02: 火星坐标系（中国国家标准，高德、腾讯地图使用）
 * - BD-09: 百度坐标系（百度地图使用）
 */

// 坐标转换常量
const PI = Math.PI;
const A = 6378245.0; // 长半轴
const EE = 0.00669342162296594323; // 扁率

/**
 * 判断坐标是否在中国境内
 */
function isInChina(lng: number, lat: number): boolean {
  return lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55;
}

/**
 * 转换纬度
 */
function transformLat(lng: number, lat: number): number {
  let ret =
    -100.0 +
    2.0 * lng +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret +=
    ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

/**
 * 转换经度
 */
function transformLng(lng: number, lat: number): number {
  let ret =
    300.0 +
    lng +
    2.0 * lat +
    0.1 * lng * lng +
    0.1 * lng * lat +
    0.1 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret +=
    ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/**
 * WGS84 坐标转 GCJ-02 坐标（火星坐标系）
 * @param wgsLng WGS84 经度
 * @param wgsLat WGS84 纬度
 * @returns GCJ-02 坐标 [经度, 纬度]
 */
export function wgs84ToGcj02(wgsLng: number, wgsLat: number): [number, number] {
  // 如果不在中国境内，不进行转换
  if (!isInChina(wgsLng, wgsLat)) {
    return [wgsLng, wgsLat];
  }

  let dLat = transformLat(wgsLng - 105.0, wgsLat - 35.0);
  let dLng = transformLng(wgsLng - 105.0, wgsLat - 35.0);
  const radLat = (wgsLat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  const gcjLat = wgsLat + dLat;
  const gcjLng = wgsLng + dLng;
  return [gcjLng, gcjLat];
}

/**
 * 计算两个经纬度坐标之间的距离（单位：米）
 * 使用 Haversine 公式计算球面距离
 * 注意：两个坐标必须是同一坐标系
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // 返回距离（米）
}

/**
 * 验证签到位置是否在允许的范围内
 * @param signInLat 签到位置纬度
 * @param signInLon 签到位置经度
 * @param targetLat 目标位置纬度（如参保人家地址）
 * @param targetLon 目标位置经度
 * @param maxDistance 允许的最大距离（米），默认500米
 * @returns 验证结果
 */
export function validateLocationRange(
  signInLat: number,
  signInLon: number,
  targetLat: number,
  targetLon: number,
  maxDistance: number = 500
): {
  isValid: boolean
  distance: number
  message: string
} {
  // 验证经纬度有效性
  if (
    !isValidLatitude(signInLat) ||
    !isValidLongitude(signInLon) ||
    !isValidLatitude(targetLat) ||
    !isValidLongitude(targetLon)
  ) {
    return {
      isValid: false,
      distance: 0,
      message: '经纬度参数无效'
    }
  }

  const distance = calculateDistance(signInLat, signInLon, targetLat, targetLon)

  if (distance > maxDistance) {
    return {
      isValid: false,
      distance: Math.round(distance),
      message: `签到位置距离目标位置过远（${Math.round(distance)}米），超出允许范围（${maxDistance}米）`
    }
  }

  return {
    isValid: true,
    distance: Math.round(distance),
    message: '签到位置验证通过'
  }
}

/**
 * 验证纬度有效性
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90
}

/**
 * 验证经度有效性
 */
export function isValidLongitude(lon: number): boolean {
  return typeof lon === 'number' && !isNaN(lon) && lon >= -180 && lon <= 180
}

/**
 * 验证定位时间戳的合理性
 * 防止使用历史定位数据
 * @param timestamp 定位时间戳（毫秒）
 * @param maxAgeMinutes 允许的最大时效（分钟），默认5分钟
 */
export function validateLocationTimestamp(
  timestamp: number,
  maxAgeMinutes: number = 5
): {
  isValid: boolean
  ageMinutes: number
  message: string
} {
  const now = Date.now()
  const ageMs = now - timestamp
  const ageMinutes = Math.floor(ageMs / 1000 / 60)

  if (ageMs < 0) {
    return {
      isValid: false,
      ageMinutes: 0,
      message: '定位时间戳不能是未来时间'
    }
  }

  if (ageMinutes > maxAgeMinutes) {
    return {
      isValid: false,
      ageMinutes,
      message: `定位信息过期（${ageMinutes}分钟前），请重新获取位置`
    }
  }

  return {
    isValid: true,
    ageMinutes,
    message: '定位时间验证通过'
  }
}

/**
 * 验证 GPS 精度
 * @param accuracy GPS精度（米）
 * @param maxAccuracy 允许的最大精度误差（米），默认100米
 */
export function validateLocationAccuracy(
  accuracy?: number,
  maxAccuracy: number = 100
): {
  isValid: boolean
  message: string
} {
  if (accuracy === undefined || accuracy === null) {
    return {
      isValid: true,
      message: '未提供精度信息'
    }
  }

  if (accuracy > maxAccuracy) {
    return {
      isValid: false,
      message: `GPS精度不足（误差${Math.round(accuracy)}米），请在空旷地区重新定位`
    }
  }

  return {
    isValid: true,
    message: `GPS精度良好（误差${Math.round(accuracy)}米）`
  }
}

/**
 * 综合验证签到位置信息
 * 包括：范围验证、时间戳验证、精度验证
 */
export function validateSignInLocation(params: {
  signInLat: number
  signInLon: number
  targetLat: number
  targetLon: number
  timestamp: number
  accuracy?: number
  maxDistance?: number
  maxAgeMinutes?: number
  maxAccuracy?: number
}): {
  isValid: boolean
  distance?: number
  ageMinutes?: number
  errors: string[]
} {
  const errors: string[] = []

  // 1. 验证定位时间戳
  const timestampResult = validateLocationTimestamp(
    params.timestamp,
    params.maxAgeMinutes
  )
  if (!timestampResult.isValid) {
    errors.push(timestampResult.message)
  }

  // 2. 验证 GPS 精度
  const accuracyResult = validateLocationAccuracy(
    params.accuracy,
    params.maxAccuracy
  )
  if (!accuracyResult.isValid) {
    errors.push(accuracyResult.message)
  }

  // 3. 验证位置范围
  const rangeResult = validateLocationRange(
    params.signInLat,
    params.signInLon,
    params.targetLat,
    params.targetLon,
    params.maxDistance
  )
  if (!rangeResult.isValid) {
    errors.push(rangeResult.message)
  }

  return {
    isValid: errors.length === 0,
    distance: rangeResult.distance,
    ageMinutes: timestampResult.ageMinutes,
    errors
  }
}

/**
 * 获取后端服务器时间
 * 用于对比前端传来的时间戳
 */
export function getServerTimestamp(): number {
  return Date.now()
}

