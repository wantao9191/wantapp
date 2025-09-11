import React, { useState } from 'react'
interface ConfigModalProps {
  slots: {
    body: React.ReactNode,
    footer: React.ReactNode,
    height?: string
  }
}
export default function ConfigModal({ slots }: ConfigModalProps) {
  return (
    <div className={`relative bg-gray-50 rounded-lg border border-gray-200 ${slots.height || 'h-400px'}`}>
      <div className='p-5 pb-20 overflow-y-auto h-full builterful-scrollbar'>
        {slots.body}
      </div>
      <footer className="absolute bottom-0 left-0 right-0 pt-4 bg-white border-t border-gray-100">
        <div className="flex justify-end gap-3">
          {slots.footer}
        </div>
      </footer>
    </div>
  )
}