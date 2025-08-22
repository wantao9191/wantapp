import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center text-slate-800 bg-gradient-to-br from-[#4facfe] via-[#00f2fe] to-[#e0f7ff] relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-200 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-16 h-16 bg-white rounded-full blur-md animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-100 rounded-full blur-lg animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/2 w-12 h-12 bg-white rounded-full blur-sm animate-pulse delay-300"></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center">
        <div className='loading'></div>
        <div className='text-3xl font-bold loading-text'>长护管理系统</div>
        <div className='text-sm mt-2 opacity-80 animate-pulse'>加载中...</div>
      </div>

      {/* 底部渐变装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
    </div>
  )
}