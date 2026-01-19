import { http, post } from '@/utils/request'
import type { ApiResponse } from '@/types/global'
import type { UploadResponse } from '@/types/api/common'

// 通用API
export const commonApi = {
  /**
   * 上传文件
   * @param formData 文件数据
   * @returns 上传结果
   */
  uploadFile: (formData: FormData) => {
    return http<ApiResponse<UploadResponse>>({
      url: '/api/upload',
      method: 'post',
      data: formData,
      // 不设置Content-Type，让浏览器自动设置
    })
  }
}