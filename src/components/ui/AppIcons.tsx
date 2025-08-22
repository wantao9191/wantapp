import React from 'react';
import * as Icons from '@ant-design/icons';
import type { ComponentType } from 'react';

// 定义所有可用的图标名称类型
export type IconName = keyof typeof Icons;

// 组件属性接口
export interface AppIconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any; // 允许传递其他属性
}

/**
 * 通用图标组件
 * 支持所有 Ant Design 图标，通过 name 属性指定图标名称
 * 
 * @example
 * <AppIcon name="HomeOutlined" />
 * <AppIcon name="UserOutlined" size={24} color="#1890ff" />
 * <AppIcon name="SettingOutlined" className="custom-icon" />
 */
const AppIcon: React.FC<AppIconProps> = ({
  name,
  size,
  color,
  className,
  style,
  ...restProps
}) => {
  // 获取对应的图标组件
  const IconComponent = Icons[name] as ComponentType<any>;
  
  // 如果图标不存在，返回 null 或默认图标
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in @ant-design/icons`);
    return null;
  }

  // 合并样式，确保 size 和 color 正确应用
  const iconStyle: React.CSSProperties = {
    fontSize: size,
    color,
    ...style,
  };

  return (
    <IconComponent
      className={className}
      style={iconStyle}
      {...restProps}
    />
  );
};

export default AppIcon;

// 导出所有图标名称，方便使用
export { Icons };

// 导出常用的图标名称常量
export const ICON_NAMES = {
  // 导航图标
  HOME: 'HomeOutlined',
  USER: 'UserOutlined',
  SETTING: 'SettingOutlined',
  MENU: 'MenuOutlined',
  CLOSE: 'CloseOutlined',
  
  // 操作图标
  EDIT: 'EditOutlined',
  DELETE: 'DeleteOutlined',
  ADD: 'PlusOutlined',
  SAVE: 'SaveOutlined',
  SEARCH: 'SearchOutlined',
  
  // 状态图标
  SUCCESS: 'CheckCircleOutlined',
  ERROR: 'CloseCircleOutlined',
  WARNING: 'ExclamationCircleOutlined',
  INFO: 'InfoCircleOutlined',
  LOADING: 'LoadingOutlined',
  
  // 方向图标
  UP: 'UpOutlined',
  DOWN: 'DownOutlined',
  LEFT: 'LeftOutlined',
  RIGHT: 'RightOutlined',
  
  // 文件图标
  FILE: 'FileOutlined',
  FOLDER: 'FolderOutlined',
  DOWNLOAD: 'DownloadOutlined',
  UPLOAD: 'UploadOutlined',
  
  // 通信图标
  MAIL: 'MailOutlined',
  PHONE: 'PhoneOutlined',
  MESSAGE: 'MessageOutlined',
  NOTIFICATION: 'NotificationOutlined',
} as const;
