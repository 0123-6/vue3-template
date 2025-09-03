import {useElSelect} from '@/components/base-form/useElSelect.ts'
import {IEntity} from '@views/interfaceCommon.ts'

// 角色信息
export interface IRole extends IEntity {
  // 名称,唯一标识
  name: string,
  // 权限信息
  permissionList: string[],
}

// 获取全量角色列表
export const allRoleListSelectObject = useElSelect({
  config: {
    labelName: 'name',
    valueName: 'name',
  },
  fetchOptionFn: () => ({
    url: 'role/getAllRoleList',
    mockProd: true,
  }),
})