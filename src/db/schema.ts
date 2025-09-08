// 从拆分的模块中导入所有表
export * from './schema/systems';
export * from './schema/person';
export * from './schema/care';
export * from './schema/files';

// 为了向后兼容，保留默认导出
import { 
  organizations, 
  roles, 
  users, 
  permissions, 
  menus, 
  apiPermissions, 
  dicts 
} from './schema/systems';

export default {
  organizations,
  roles,
  users,
  permissions,
  menus,
  apiPermissions,
  dicts,
};
