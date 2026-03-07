/**
 * 接口连通性测试工具
 * 验证前后端接口的基本连通性和响应格式
 */

import { userApi } from '@/api/user'
import { topicApi } from '@/api/topic'
import { documentApi } from '@/api/document'
import { departmentApi } from '@/api/department'
import type { UserQueryParams } from '@/types/api/user'
import type { TopicQueryParams } from '@/types/api/topic'
import type { DocumentQueryParams } from '@/types/api/document'
import type { ApiResponse, PageQuery } from '@/types/global'

// 测试结果接口
interface TestResult {
  moduleName: string
  apiName: string
  success: boolean
  message: string
  responseTime?: number
  error?: string
}

class ConnectivityTester {
  private results: TestResult[] = []

  /**
   * 运行所有连通性测试
   */
  async runConnectivityTests(): Promise<TestResult[]> {
    this.results = []
    
    console.log('🚀 开始接口连通性测试...')
    
    // 测试各模块API连通性
    await this.testUserModule()
    await this.testTopicModule()
    await this.testDocumentModule()
    await this.testDepartmentModule()
    
    this.printSummary()
    return this.results
  }

  /**
   * 测试用户模块
   */
  private async testUserModule(): Promise<void> {
    console.log('\n👤 测试用户管理模块...')
    
    await this.testApi('用户模块', '用户分页查询', async () => {
      const params: UserQueryParams = {
        current: 1,
        size: 5,
        username: '',
        userType: undefined
      }
      return await userApi.getUserPage(params)
    })
  }

  /**
   * 测试选题模块
   */
  private async testTopicModule(): Promise<void> {
    console.log('\n📝 测试选题管理模块...')
    
    await this.testApi('选题模块', '选题分页查询', async () => {
      const params: TopicQueryParams = {
        current: 1,
        size: 5,
        title: '',
        teacherId: undefined,
        status: undefined
      }
      return await topicApi.getTopicPage(params)
    })
  }

  /**
   * 测试文档模块
   */
  private async testDocumentModule(): Promise<void> {
    console.log('\n📄 测试文档管理模块...')
    
    await this.testApi('文档模块', '文档分页查询', async () => {
      const params: DocumentQueryParams = {
        current: 1,
        size: 5
      }
      return await documentApi.getDocumentPage(params)
    })
  }

  /**
   * 测试部门模块
   */
  private async testDepartmentModule(): Promise<void> {
    console.log('\n🏢 测试部门管理模块...')
    
    await this.testApi('部门模块', '获取所有部门', async () => {
      return await departmentApi.getAllDepartments()
    })
    
    await this.testApi('部门模块', '获取部门树', async () => {
      return await departmentApi.getDepartmentTree()
    })
  }

  /**
   * 测试单个API
   */
  private async testApi(
    moduleName: string,
    apiName: string,
    apiCall: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      const response = await Promise.race([
        apiCall(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时(10秒)')), 10000)
        )
      ])
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // 验证响应格式
      const isValid = this.validateResponse(response)
      
      const result: TestResult = {
        moduleName,
        apiName,
        success: isValid,
        message: isValid ? '✅ 连通正常' : '❌ 响应格式异常',
        responseTime
      }
      
      this.results.push(result)
      this.printResult(result)
      
    } catch (error: any) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      const result: TestResult = {
        moduleName,
        apiName,
        success: false,
        message: '❌ 连接失败',
        responseTime,
        error: error.message
      }
      
      this.results.push(result)
      this.printResult(result)
    }
  }

  /**
   * 验证响应格式
   */
  private validateResponse(response: any): boolean {
    if (!response) return false
    
    // 验证分页响应格式
    if (response.hasOwnProperty('records') && response.hasOwnProperty('total')) {
      return Array.isArray(response.records) && 
             typeof response.total === 'number' &&
             response.total >= 0
    }
    
    // 验证标准响应格式 {code, message, data}
    if (response.hasOwnProperty('code') && response.hasOwnProperty('message')) {
      return typeof response.code === 'number' && 
             typeof response.message === 'string'
    }
    
    // 验证数组响应
    if (Array.isArray(response)) {
      return true
    }
    
    // 验证对象响应
    if (typeof response === 'object') {
      return true
    }
    
    return false
  }

  /**
   * 打印单个测试结果
   */
  private printResult(result: TestResult): void {
    const status = result.success ? '✅' : '❌'
    const timeInfo = result.responseTime ? `(${result.responseTime}ms)` : ''
    const errorInfo = result.error ? ` - ${result.error}` : ''
    
    console.log(`  ${status} ${result.apiName} ${timeInfo}${errorInfo}`)
  }

  /**
   * 打印测试汇总
   */
  private printSummary(): void {
    const total = this.results.length
    const passed = this.results.filter(r => r.success).length
    const failed = total - passed
    
    console.log('\n📊 连通性测试汇总:')
    console.log(`   总计测试: ${total}`)
    console.log(`   ✅ 成功: ${passed}`)
    console.log(`   ❌ 失败: ${failed}`)
    console.log(`   成功率: ${(passed / total * 100).toFixed(1)}%`)
    
    if (failed > 0) {
      console.log('\n❌ 失败详情:')
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   ${r.moduleName} - ${r.apiName}: ${r.message}`)
          if (r.error) {
            console.log(`     错误: ${r.error}`)
          }
        })
    }
    
    // 按模块统计
    console.log('\n📈 模块成功率:')
    const modules = [...new Set(this.results.map(r => r.moduleName))]
    modules.forEach(module => {
      const moduleResults = this.results.filter(r => r.moduleName === module)
      const modulePassed = moduleResults.filter(r => r.success).length
      const moduleTotal = moduleResults.length
      const rate = (modulePassed / moduleTotal * 100).toFixed(1)
      console.log(`   ${module}: ${rate}% (${modulePassed}/${moduleTotal})`)
    })
  }

  /**
   * 获取测试结果
   */
  getResults(): TestResult[] {
    return [...this.results]
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    total: number
    passed: number
    failed: number
    successRate: number
    byModule: Record<string, { total: number; passed: number; rate: number }>
  } {
    const total = this.results.length
    const passed = this.results.filter(r => r.success).length
    const failed = total - passed
    
    // 按模块统计
    const byModule: Record<string, { total: number; passed: number; rate: number }> = {}
    const modules = [...new Set(this.results.map(r => r.moduleName))]
    
    modules.forEach(module => {
      const moduleResults = this.results.filter(r => r.moduleName === module)
      const modulePassed = moduleResults.filter(r => r.success).length
      const moduleTotal = moduleResults.length
      byModule[module] = {
        total: moduleTotal,
        passed: modulePassed,
        rate: parseFloat((modulePassed / moduleTotal * 100).toFixed(1))
      }
    })
    
    return {
      total,
      passed,
      failed,
      successRate: parseFloat((passed / total * 100).toFixed(1)),
      byModule
    }
  }
}

// 创建测试实例
export const connectivityTester = new ConnectivityTester()

// 导出便捷方法
export const runConnectivityTests = () => connectivityTester.runConnectivityTests()
export const getConnectionTestResults = () => connectivityTester.getResults()
export const getConnectionTestStats = () => connectivityTester.getStatistics()

export default connectivityTester