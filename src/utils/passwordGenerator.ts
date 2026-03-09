/**
 * 随机密码生成工具
 * 生成的密码符合前后端校验规则：
 * - 至少包含一个字母和一个数字
 * - 长度至少 6 位
 * - 可包含特殊字符：@$!%*#?&
 */

/**
 * 密码生成配置
 */
interface PasswordOptions {
  length?: number        // 密码长度，默认 10
  includeSpecial?: boolean  // 是否包含特殊字符，默认 true
}

/**
 * 生成随机密码
 * @param options 密码生成配置
 * @returns 生成的随机密码
 */
export function generateRandomPassword(options: PasswordOptions = {}): string {
  const {
    length = 10,
    includeSpecial = true
  } = options

  // 字符集定义
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specialChars = '@$!%*#?&'

  // 基础字符集（字母 + 数字）
  let allChars = lowercaseChars + uppercaseChars + numbers

  // 如果需要特殊字符
  if (includeSpecial) {
    allChars += specialChars
  }

  // 确保密码至少包含一个字母和一个数字
  const randomLower = lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]!
  const randomNumber = numbers[Math.floor(Math.random() * numbers.length)]!

  // 至少包含一个字母和一个数字
  const requiredChars: string[] = [
    randomLower,
    randomNumber
  ]

  // 如果需要特殊字符，也确保至少包含一个
  if (includeSpecial) {
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]!
    requiredChars.push(randomSpecial)
  }

  // 剩余长度用随机字符填充
  const remainingLength = length - requiredChars.length
  const passwordArray: string[] = [...requiredChars]

  for (let i = 0; i < remainingLength; i++) {
    const randomChar = allChars[Math.floor(Math.random() * allChars.length)]!
    passwordArray.push(randomChar)
  }

  // 打乱密码字符顺序（Fisher-Yates 洗牌算法）
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = passwordArray[i]!
    passwordArray[i] = passwordArray[j]!
    passwordArray[j] = temp
  }

  return passwordArray.join('')
}

/**
 * 验证密码是否符合要求
 * @param password 密码
 * @returns 是否符合要求
 */
export function isValidPassword(password: string): boolean {
  if (!password || password.length < 6) {
    return false
  }
  
  // 检查是否包含至少一个字母和一个数字
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  return hasLetter && hasNumber
}
