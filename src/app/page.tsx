'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/Loading'
export default function Index() {
  const router = useRouter()
  useEffect(() => {
    console.log('load...')
    router.replace('/admin/login')
  }, [])
  return (
    <Loading />
  )
}
