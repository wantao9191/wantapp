/**
 * 枚举工具函数
 */
import {
  CareRecordStatus,
  CareRecordAlertStatus,
  CareTaskStatus,
  CommonStatus,
  SignInStatus,
  SignOutStatus,
  CareTaskLevel,
  CareRecordStatusLabels,
  CareRecordAlertStatusLabels,
  CareTaskStatusLabels,
  CommonStatusLabels,
  SignInStatusLabels,
  SignOutStatusLabels,
  CareTaskLevelLabels,
} from '@/types/enums';

/**
 * 获取状态标签
 */
export const getStatusLabel = {
  careRecord: (status: CareRecordStatus) => CareRecordStatusLabels[status],
  careRecordAlert: (status: CareRecordAlertStatus) => CareRecordAlertStatusLabels[status],
  careTask: (status: CareTaskStatus) => CareTaskStatusLabels[status],
  common: (status: CommonStatus) => CommonStatusLabels[status],
  signIn: (status: SignInStatus) => SignInStatusLabels[status],
  signOut: (status: SignOutStatus) => SignOutStatusLabels[status],
  careTaskLevel: (level: CareTaskLevel) => CareTaskLevelLabels[level],
};

/**
 * 获取所有状态选项
 */
export const getStatusOptions = {
  careRecord: () => Object.entries(CareRecordStatusLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
  careRecordAlert: () => Object.entries(CareRecordAlertStatusLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
  careTask: () => Object.entries(CareTaskStatusLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
  common: () => Object.entries(CommonStatusLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
  signIn: () => Object.entries(SignInStatusLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
  signOut: () => Object.entries(SignOutStatusLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
  careTaskLevel: () => Object.entries(CareTaskLevelLabels).map(([value, label]) => ({
    value,
    label,
  })),
};

/**
 * 验证状态值是否有效
 */
export const isValidStatus = {
  careRecord: (value: number): value is CareRecordStatus => 
    Object.values(CareRecordStatus).includes(value as CareRecordStatus),
  careRecordAlert: (value: number): value is CareRecordAlertStatus => 
    Object.values(CareRecordAlertStatus).includes(value as CareRecordAlertStatus),
  careTask: (value: number): value is CareTaskStatus => 
    Object.values(CareTaskStatus).includes(value as CareTaskStatus),
  common: (value: number): value is CommonStatus => 
    Object.values(CommonStatus).includes(value as CommonStatus),
  signIn: (value: number): value is SignInStatus => 
    Object.values(SignInStatus).includes(value as SignInStatus),
  signOut: (value: number): value is SignOutStatus => 
    Object.values(SignOutStatus).includes(value as SignOutStatus),
  careTaskLevel: (value: string): value is CareTaskLevel => 
    Object.values(CareTaskLevel).includes(value as CareTaskLevel),
};

/**
 * 状态转换逻辑
 */
export const statusTransitions = {
  careRecord: {
    [CareRecordStatus.NOT_STARTED]: [CareRecordStatus.SIGNED_IN],
    [CareRecordStatus.SIGNED_IN]: [CareRecordStatus.IN_SERVICE, CareRecordStatus.COMPLETED],
    [CareRecordStatus.IN_SERVICE]: [CareRecordStatus.COMPLETED],
    [CareRecordStatus.COMPLETED]: [], // 终态
  },
  careRecordAlert: {
    [CareRecordAlertStatus.NORMAL]: [
      CareRecordAlertStatus.LEAVE,
      CareRecordAlertStatus.CANCELLED,
      CareRecordAlertStatus.POSTPONED,
      CareRecordAlertStatus.LATE,
      CareRecordAlertStatus.EARLY_LEAVE,
    ],
    [CareRecordAlertStatus.LEAVE]: [CareRecordAlertStatus.NORMAL],
    [CareRecordAlertStatus.CANCELLED]: [CareRecordAlertStatus.NORMAL],
    [CareRecordAlertStatus.POSTPONED]: [CareRecordAlertStatus.NORMAL],
    [CareRecordAlertStatus.LATE]: [CareRecordAlertStatus.NORMAL],
    [CareRecordAlertStatus.EARLY_LEAVE]: [CareRecordAlertStatus.NORMAL],
  },
};

/**
 * 检查状态转换是否有效
 */
export const canTransitionTo = (from: CareRecordStatus, to: CareRecordStatus): boolean => {
  return statusTransitions.careRecord[from]?.includes(to) ?? false;
};

export const canTransitionAlertTo = (from: CareRecordAlertStatus, to: CareRecordAlertStatus): boolean => {
  return statusTransitions.careRecordAlert[from]?.includes(to) ?? false;
};
