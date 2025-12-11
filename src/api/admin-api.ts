import { http, get, post } from '@/utils/request'
import { pa } from 'element-plus/es/locales.mjs'

export const adminApi = {
  /**
   * 添加管理员
   * @param param 请求参数
   * @returns 请求结果
   */
  add: (param: any) => {
    return post('/admin/add', param)
  },

  /**
   * 修改管理员信息
   * @param param 请求参数
   * @returns 请求结果
   */
  update: (param: any) => {
    return post('/admin/update', param)
  },

  /**
   * 删除管理员
   * @param ids 管理员ID数组
   * @returns 请求结果
   */
  delete: (ids: any) => {
    return post('/admin/delete?ids=' + ids, {})
  },

  /**
   * 获取管理员列表
   * @param param 请求参数
   * @param pageNum 页码
   */
  list: (param: any, pageNum: any, pageSize: any) => {
    return post('/admin/list?' + 'pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /**
   * 登录
   * @param param 请求参数
   * @returns 请求结果
   */
  login: (param: any) => {
    return post('/admin/login', param)
  },

  /**
   * 退出登录
   * @param param 请求参数（可选）
   * @returns 请求结果
   */
  logout: (param?: any) => {
    return post('/admin/logout', param || {})
  },
}
