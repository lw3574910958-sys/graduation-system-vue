// stores/counter.js
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import constants from '@/utils/constants'
import { clearLocalStorage, getLocalStorage, saveLocalStorage } from '@/utils/utils'

export const useAdminStore = defineStore('admin', () => {
  const token = ref('')
  const admin = reactive({
    id: '',
    userName: '',
    name: '',
    phone: '',
  })

  const getToken = computed(() => {
    if (token) {
      return token
    }
    return getLocalStorage(constants.USER_TOKEN)
  })

  function setAdminInfo(data: any) {
    admin.id = data.id
    admin.userName = data.userName
    admin.name = data.name
    admin.phone = data.phone
    token.value = data.token

    saveLocalStorage(constants.USER_TOKEN, data.token)
  }

  function logout() {
    admin.id = ''
    admin.userName = ''
    admin.name = ''
    admin.phone = ''
    token.value = ''

    clearLocalStorage()
  }
  return { token, setAdminInfo, logout }
})
