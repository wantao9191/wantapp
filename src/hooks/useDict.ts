import { useState } from 'react'
export const useDict = () => {
  const [dict, setDict] = useState<any>({
    status: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 }
    ],
    statusMap: {
      1: { label: '启用', value: 1, color: 'green' },
      0: { label: '停用', value: 0, color: 'red' }
    }
  })
  return dict
}