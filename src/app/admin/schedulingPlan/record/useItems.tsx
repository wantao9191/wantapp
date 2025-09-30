import { FormItemConfig } from '@/types/form-config'
import { TableColumnConfig } from '@/components/ui/ConfirmTable/ConfigTable'
import { CareRecordStatus, CareRecordAlertStatus, CareRecordStatusLabels, CareRecordAlertStatusLabels } from '@/types/enums'
const useItems = () => {
  const searchFormSchema: FormItemConfig[] = [
    {
      label: '状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择',
      options: Object.values(CareRecordStatus).filter((v): v is CareRecordStatus => typeof v === 'number').map((status) => ({ label: CareRecordStatusLabels[status], value: status })),
    },
    {
      label: '异常状态',
      name: 'alertStatus',
      type: 'select',
      placeholder: '请选择',
      options: Object.values(CareRecordAlertStatus).filter((v): v is CareRecordAlertStatus => typeof v === 'number').map(alertStatus => ({ label: CareRecordAlertStatusLabels[alertStatus], value: alertStatus })),
    },
  ]
  const tableColumns: TableColumnConfig[] = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
    },
    {
      title: '参保人',
      dataIndex: 'insured',
      key: 'personName',
      width: 150,
      render:(_,record)=>{
        return record.schedulePlan.insured.name
      }
    },
    {
      title: '护理套餐',
      dataIndex: 'packageName',
      key: 'packageName',
      width: 150,
      render:(_,record)=>{
        return record.schedulePlan.package.name
      }
    },
    {
      title: '护理人员',
      dataIndex: 'nurseName',
      key: 'nurseName',
      width: 150,
      render:(_,record)=>{
        return record.schedulePlan.nurse.name
      }
    },
    {
      title: '服务地点',
      dataIndex: 'serviceLocation',
      key: 'serviceLocation',
      width: 150,
      render:(_,record)=>{
        return record.schedulePlan.insured.address
      }
    },
    {
      title: '计划时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render:(_,record)=>{
        return record.schedulePlan.startTime
      }
    },
    {
      title: '签到时间',
      dataIndex: 'signInTime',
      key: 'signInTime',
      width: 150,
    },
    {
      title: '签退时间',
      dataIndex: 'signOutTime',
      key: 'signOutTime',
      width: 160,
    },
    {
      title: '签到地点',
      dataIndex: 'signInLocation',
      key: 'signInLocation',
      width: 160,
    },
    {
      title: '签退地点',
      dataIndex: 'signOutLocation',
      key: 'signOutLocation',
      width: 160,
    },

    {
      title: '异常状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      width: 100,
      align: 'center',
    },
    {
      title: '机构名称',
      dataIndex: 'organizationName',
      key: 'organizationName',
      width: 150,
      render:(_,record)=>{
        return record.schedulePlan.organization.name
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '排班人员',
      dataIndex: 'schedulePersonName',
      key: 'schedulePersonName',
      width: 150,
    }
  ]
  return {
    tableColumns,
    searchFormSchema
  }
}
export default useItems