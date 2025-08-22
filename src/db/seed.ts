import { db } from './index';
import { organizations, roles, users } from './schema';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 检查是否已经初始化过（检查所有表）
    const existingOrgs = await db.select().from(organizations);
    const existingRoles = await db.select().from(roles);
    const existingUsers = await db.select().from(users);

    if (existingOrgs.length > 0 || existingRoles.length > 0 || existingUsers.length > 0) {
      console.log('数据库已经初始化过了，跳过seed操作');
      console.log(`现有数据: 机构(${existingOrgs.length}) 角色(${existingRoles.length}) 用户(${existingUsers.length})`);
      return;
    }

    // 初始化机构（为其他用户准备）
    await db.insert(organizations).values({
      name: '超级机构',
      code: 'default_org',
      description: '超级机构',
    });
    const org = await db.select().from(organizations);
    const orgId = org[0].id;
    console.log('默认机构创建成功');

    // 初始化角色
    await db.insert(roles).values({
      name: '系统管理员',
      code: 'system_admin',
      description: '系统管理员',
    });
    console.log('系统管理员角色创建成功');

    await db.insert(roles).values({
      name: '机构管理员',
      code: 'org_admin',
      description: '机构管理员',
    });
    console.log('机构管理员角色创建成功');

    await db.insert(roles).values({
      name: '护理员',
      code: 'org_nurse',
      description: '员工',
    });
    console.log('护理员角色创建成功');

    await db.insert(roles).values({
      name: '参保人',
      code: 'org_insured',
      description: '参保人',
    });
    console.log('参保人角色创建成功');

    await db.insert(roles).values({
      name: '家属',
      code: 'org_family',
      description: '家属',
    });
    console.log('家属角色创建成功');

    // 初始化超级管理员用户（不关联机构）
    await db.insert(users).values({
      username: 'admin',
      password: await bcrypt.hash('12345@Aa', 10),
      phone: '99999999999',
      name: '超级管理员',
      status: 1,
      organizationId: orgId,
      roles: [1],
    });
    console.log('超级管理员用户创建成功');

    console.log('数据库初始化完成！');
    console.log('超级管理员账号: admin');
    console.log('超级管理员密码: 12345@Aa');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}