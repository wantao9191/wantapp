'use client'
import { Calendar, ConfigProvider, Popover, Spin, Button, Input, Tag, App, Popconfirm } from 'antd'
import type { CalendarMode } from 'antd/es/calendar/generateCalendar';
import React, { useState, useEffect, useCallback } from 'react'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import type { Dayjs } from 'dayjs'
import AppIcon from '@/components/ui/AppIcons'
import EditModal from './components/editModal'
import CheckModal from './components/checkModal'
import { Modal } from 'antd'
import { http } from '@/lib/https'
import { useDict } from '@/hooks/useDict'
export default function SchedulingPage() {
  // 设置 dayjs 为中文
  dayjs.locale('zh-cn')
  const { message } = App.useApp()
  const { confirm } = Modal
  const { statusMap } = useDict()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [params, setParams] = useState<any>({})
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [checkOpen, setCheckOpen] = useState(false)
  const getList = async () => {
    try {
      setLoading(true)
      const res = await http.get('/admin/schedule', { month: currentDate.format('YYYY-MM'), ...params })
      const data = res.data.map((item: any) => ({
        ...item,
        isBefore: dayjs(item.startTime).isBefore(dayjs().startOf('day')) || dayjs(item.startTime).isSame(dayjs().startOf('day'), 'day')
      }))
      setList(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  const onReset = useCallback(() => {
    setParams({})
    getList()
  }, [])
  const getListData = useCallback((value: Dayjs) => {
    return list.filter((item: any) => dayjs(item.startTime).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'))
  }, [list]);
  const onPanelChange = (value: Dayjs) => {
    setCurrentDate(value)
  };
  const handleAdd = (value: Dayjs) => {
    setFormData({
      currentDate: value
    })
    setOpen(true)
  };
  const handleEdit = (item: any) => {
    setFormData(item)
    setOpen(true)
  }
  const handleCheck = (item: any) => {
    setFormData(item)
    setCheckOpen(true)
  }
  const handleChangeStatus = async (item: any) => {
    try {
      await http.put(`/admin/schedule/${item.id}`, {
        status: item.status === 0 ? 1 : 0,
        nurseId: item.nurse.id,
        insuredId: item.insured.id,
        packageId: item.package.id,
        startTime: item.startTime,
        endTime: item.endTime,
        description: item.description,
        duration: item.duration,
      })
      message.success('操作成功')
      getList()
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = () => {
    setOpen(false)
    getList()
  }

  const popoverContent = (data: any) => {
    const renderList = data
    return (
      <div className="min-w-80">
        <div className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
          <span>排班信息</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            共
            <span className="text-gray-700">
              {data.length}
            </span>
            条排班
          </span>
        </div>
        <div className='max-h-[240px] min-h-[80px] overflow-y-auto'>
          {renderList.map((item: any, index: number) => (
            <div key={item.id || index} className='flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg mb-2 text-sm border border-blue-100 hover:shadow-sm transition-all duration-200'>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {dayjs(item.startTime).format('HH:mm')} - {dayjs(item.endTime).format('HH:mm')}
                  </span>
                  <Tag color={statusMap[item.status].color}> {statusMap[item.status].label}</Tag>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">{item.insured?.name}</span>
                  <span className="text-gray-500 ml-1">的护理服务</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  套餐：<span className="font-medium text-indigo-600">{item.package?.name}</span>
                </div>
              </div>
              {item.isBefore ? (
                <Button
                  type='link'
                  size='small'
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
                  onClick={() => {
                    handleCheck(item)
                  }}
                >
                  查看
                </Button>
              ) : (
                <>
                  <Button
                    type='link'
                    size='small'
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded"
                    onClick={() => {
                      handleEdit(item)
                    }}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title={`${item.status === 0 ? '启用' : '停止'}排班计划`}
                    onConfirm={() => {
                      handleChangeStatus(item)
                    }}
                  >
                    <Button type='link' size='small' className={`${item.status === 0 ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded' : '!text-red-600 !hover:text-red-800 !hover:bg-red-50 px-2 py-1 rounded'}`}>
                      {item.status === 0 ? '启用' : '停止'}
                    </Button>
                  </Popconfirm>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
  const dateCellRender = (value: Dayjs) => {
    const listData: any = getListData(value);
    return (
      <div className={`h-[calc(100%-24px)] flex flex-col justify-center items-center gap-1`}>
        {listData.length > 0 ? (
          <Popover
            content={popoverContent(listData)}
            title=""
            trigger="click"
            placement="topLeft"
            styles={{
              body: {
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }
            }}
            arrow={false}
          >
            <div className='text-gray-700 text-xs cursor-pointer bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-full border border-green-200 hover:shadow-md hover:from-green-200 hover:to-emerald-200 transition-all duration-200 font-medium' onClick={(e) => {
              e.stopPropagation()
            }}>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {`${listData.length}条排班`}
              </span>
            </div>
          </Popover>
        ) : (
          <div className='text-gray-500 text-xs cursor-pointer bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors duration-200'>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              暂无排班
            </span>
          </div>
        )}
        {value.isAfter(dayjs().endOf('day')) && (
          <div
            className="flex justify-center items-center text-blue-500 text-xs mt-1 px-2 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              handleAdd(value)
            }}
          >
            <AppIcon name="PlusOutlined" className="mr-1" />
            添加计划
          </div>
        )}
      </div>
    );
  };
  useEffect(() => {
    getList()
  }, [currentDate])
  return (
    <Spin spinning={loading}>
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 flex-1 flex flex-col min-h-0 h-full overflow-y-auto shadow-sm">
        <ConfigProvider locale={zhCN}>
          <Calendar
            className='w-full flex-1 bg-white rounded-lg shadow-sm border border-gray-100'
            value={currentDate}
            onPanelChange={onPanelChange}
            cellRender={dateCellRender}
            headerRender={({ value, type, onChange, onTypeChange }) => (
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-14px text-gray-800 flex items-center">
                    <span className="mr-2 w-120px">参保人姓名</span>
                    <Input
                      value={params.insuredName}
                      onChange={(e) => setParams({ ...params, insuredName: e.target.value })}
                      size='small'
                    />
                  </div>
                  <div className="text-14px text-gray-800 flex items-center">
                    <span className="mr-2 w-120px">护理员姓名</span>
                    <Input
                      value={params.nurseName}
                      onChange={(e) => setParams({ ...params, nurseName: e.target.value })}
                      size='small'
                    />
                  </div>
                  <div className="text-14px text-gray-800 flex items-center">
                    <Button type="primary" onClick={getList} className='ml-2' size='small'> 查询 </Button>
                    <Button onClick={onReset} className='ml-2' size='small'>
                      重置
                    </Button>

                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="text"
                    icon={<AppIcon name="LeftOutlined" />}
                    onClick={() => onChange(value.subtract(1, 'month'))}
                    className="hover:bg-gray-100"
                  />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {value.format('YYYY年MM月')}
                  </h2>
                  <Button
                    type="text"
                    icon={<AppIcon name="RightOutlined" />}
                    onClick={() => onChange(value.add(1, 'month'))}
                    className="hover:bg-gray-100"
                  />
                  <Button
                    type="primary"
                    onClick={() => onChange(dayjs())}
                    className="ml-2"
                  >
                    今天
                  </Button>
                </div>
              </div>
            )}
          />
        </ConfigProvider>
        <Modal
          title={formData?.id ? '编辑排班计划' : '新增排班计划'}
          open={open}
          footer={null}
          destroyOnHidden={true}
          onCancel={() => setOpen(false)}
          width={600}
          zIndex={1999}
        >
          <EditModal formData={formData} onSubmit={onSubmit} onCancel={() => setOpen(false)} />
        </Modal>
        <Modal
          title='查看排班计划'
          open={checkOpen}
          footer={null}
          destroyOnHidden={true}
          onCancel={() => setCheckOpen(false)}
          width={600}
          zIndex={1999}
        >
          <CheckModal open={checkOpen} onCancel={() => setCheckOpen(false)} formData={formData} />
        </Modal>
      </div>
    </Spin>
  )
}