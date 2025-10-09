/**
 * 护理记录状态枚举
 */
export enum CareRecordStatus {
  /** 未开始 */
  NOT_STARTED = 0,
  /** 已签到 */
  SIGNED_IN = 1,
  /** 服务中 */
  IN_SERVICE = 2,
  /** 已签退/服务结束 */
  COMPLETED = 3,
  /** 请假 */
  LEAVE = 4,
  /** 取消服务 */
  CANCELLED = 5,
  /** 推迟服务 */
  POSTPONED = 6,
}

/**
 * 护理记录异常状态枚举
 */
export enum CareRecordAlertStatus {
  /** 无异常 */
  NORMAL = 0,
  /** 迟到 */
  LATE = 1,
  /** 早退 */
  EARLY_LEAVE = 2,
}

/**
 * 护理任务状态枚举
 */
export enum CareTaskStatus {
  /** 未完成 */
  INCOMPLETE = 0,
  /** 已完成 */
  COMPLETED = 1,
}

/**
 * 通用状态枚举
 */
export enum CommonStatus {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1,
}

/**
 * 签到状态枚举
 */
export enum SignInStatus {
  /** 未签到 */
  NOT_SIGNED_IN = 0,
  /** 已签到 */
  SIGNED_IN = 1,
  /** 请假 */
  LEAVE = 3,
  /** 迟到 */
  LATE = 4,
  /** 提前签到 */
  EARLY_SIGN_IN = 5,

}

/**
 * 签退状态枚举
 */
export enum SignOutStatus {
  /** 未签退 */
  NOT_SIGNED_OUT = 0,
  /** 已签退 */
  SIGNED_OUT = 1,
  /** 早退 */
  EARLY_LEAVE = 2,
}

/**
 * 护理任务等级枚举
 */
export enum CareTaskLevel {
  /** 基础 */
  BASIC = 'basic',
  /** 中级 */
  INTERMEDIATE = 'intermediate',
  /** 高级 */
  ADVANCED = 'advanced',
  /** 专业 */
  PROFESSIONAL = 'professional',
}

/**
 * 状态枚举的标签映射
 */
export const CareRecordStatusLabels = {
  [CareRecordStatus.NOT_STARTED]: '未开始',
  [CareRecordStatus.SIGNED_IN]: '已签到',
  [CareRecordStatus.IN_SERVICE]: '服务中',
  [CareRecordStatus.COMPLETED]: '已签退/服务结束',
  [CareRecordStatus.LEAVE]: '请假',
  [CareRecordStatus.CANCELLED]: '取消服务',
  [CareRecordStatus.POSTPONED]: '推迟服务',
} as const;

export const CareRecordAlertStatusLabels = {
  [CareRecordAlertStatus.NORMAL]: '无异常',
  [CareRecordAlertStatus.LATE]: '迟到',
  [CareRecordAlertStatus.EARLY_LEAVE]: '早退',
} as const;

export const CareTaskStatusLabels = {
  [CareTaskStatus.INCOMPLETE]: '未完成',
  [CareTaskStatus.COMPLETED]: '已完成',
} as const;

export const CommonStatusLabels = {
  [CommonStatus.DISABLED]: '禁用',
  [CommonStatus.ENABLED]: '启用',
} as const;

export const SignInStatusLabels = {
  [SignInStatus.NOT_SIGNED_IN]: '未签到',
  [SignInStatus.SIGNED_IN]: '已签到',
  [SignInStatus.LEAVE]: '请假',
  [SignInStatus.LATE]: '迟到',
  [SignInStatus.EARLY_SIGN_IN]: '提前签到',
} as const;

export const SignOutStatusLabels = {
  [SignOutStatus.NOT_SIGNED_OUT]: '未签退',
  [SignOutStatus.SIGNED_OUT]: '已签退',
  [SignOutStatus.EARLY_LEAVE]: '早退',
} as const;

export const CareTaskLevelLabels = {
  [CareTaskLevel.BASIC]: '基础',
  [CareTaskLevel.INTERMEDIATE]: '中级',
  [CareTaskLevel.ADVANCED]: '高级',
  [CareTaskLevel.PROFESSIONAL]: '专业',
} as const;
