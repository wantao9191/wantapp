'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/Loading'
export default function Index() {
  const router = useRouter()
  useEffect(() => {
    console.log('load...')
    // 使用push而不是replace，避免页面刷新
    router.push('/admin/login')
  }, [router])
  return (
    <Loading />
  )
}
