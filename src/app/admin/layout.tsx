'use client'
import React from 'react'
import BasicLayout from '@/components/layouts/BasicLayout'
import { usePathname } from 'next/navigation'
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return pathname === '/admin/login' ? children : <BasicLayout>{children}</BasicLayout>
}

export default AdminLayout