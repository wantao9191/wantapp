'use client'
import { Calendar, ConfigProvider, Popover } from 'antd'
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import React, { useState } from 'react'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { Dayjs } from 'dayjs'
import AppIcon from '@/components/ui/AppIcons'
import EditModal from './components/editModal'
import { Modal } from 'antd'
import InsuredModal from './components/insuredModal/insuredModal'
export default function SchedulingPage() {
  // 设置 dayjs 为中文
  dayjs.locale('zh-cn')
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [openInsured, setOpenInsured] = useState(false)
  const getListData = (value: Dayjs) => {
    let listData;
    switch (value.date()) {
      case 8:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'success', content: 'This is usual event.' },
        ];
        break;
      case 10:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'success', content: 'This is usual event.' },
          { type: 'error', content: 'This is error event.' },
        ];
        break;
      case 15:
        listData = [
          { type: 'warning', content: 'This is warning event' },
          { type: 'success', content: 'This is very long usual event。。....' },
          { type: 'error', content: 'This is error event 1.' },
          { type: 'error', content: 'This is error event 2.' },
          { type: 'error', content: 'This is error event 3.' },
          { type: 'error', content: 'This is error event 4.' },
        ];
        break;
      default:
    }
    return listData || [];
  };
  const onPanelChange = (value: Dayjs, mode: CalendarMode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };
  const handleAdd = () => {
    setFormData(null)
    setOpen(true)
  };
  const onSubmit = () => {
    setOpen(false)
  }
  const onOpenInsured = () => {
    setOpenInsured(true)
  }
  const popoverContent = (data: any) => {
    return (
      <div>
        {data.map((item: any, index: number) => (
          <div key={item.id || index} className='flex items-center justify-between'>
            {item.content}
          </div>
        ))}
      </div>
    )
  }
  const dateCellRender = (value: Dayjs) => {
    const listData: any = getListData(value);
    return (
      <div className="h-[calc(100%-24px)] flex flex-col justify-center items-center ">
        {listData.length > 0 && (
          <div className="flex-1 ">
            <Popover
              content={popoverContent(listData)}
              title="排班计划"
              trigger="click"
              placement="topLeft"
            >
              <div className='text-gray-500 text-12px cursor-pointer bg-green-100 px-2 py-1 rounded' onClick={(e) => {
                e.stopPropagation()
              }}>
                {`${listData.length}条排班计划`}
              </div>
            </Popover>
          </div>
        )}
        <div className="h-full flex justify-center items-center text-gray-500 text-12px" onClick={(e) => {
          e.stopPropagation()
          handleAdd()
        }}>
          <AppIcon name="PlusOutlined" />添加计划
        </div>
      </div>
    );
  };
  return <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0 h-full overflow-y-auto">
    <ConfigProvider locale={zhCN}>
      <Calendar className='w-full flex-1' onPanelChange={onPanelChange} cellRender={dateCellRender} />
    </ConfigProvider>
    <Modal
      title={formData?.id ? '编辑排班计划' : '新增排班计划'}
      open={open}
      footer={null}
      destroyOnHidden={true}
      onCancel={() => setOpen(false)}
    >
      <EditModal formData={formData} onSubmit={onSubmit} onCancel={() => setOpen(false)} onOpenInsured={onOpenInsured} />
    </Modal>
    <Modal
      title="选择参保人"
      open={openInsured}
      footer={null}
      destroyOnHidden={true}
      onCancel={() => setOpenInsured(false)}
      width={800}
    >
      <InsuredModal />
    </Modal>
  </div>
}