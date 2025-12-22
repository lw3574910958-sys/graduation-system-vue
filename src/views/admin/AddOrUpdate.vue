<template>
  <el-dialog
    v-model="visible"
    :title="!formData.id ? '新增管理员信息' : '修改管理员信息'"
    width="40%"
  >
    <el-form :rules="rules" :model="formData" ref="formRef" label-width="80px">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="formData.userName" :readonly="ureadonly" style="width: 50%" />
      </el-form-item>

      <el-form-item label="密码" prop="userPwd">
        <el-input v-model="formData.userPwd" type="password" style="width: 50%" />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" style="width: 50%" />
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-select v-model="formData.sex" placeholder="请选择" style="width: 50%">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>

      <el-form-item label="电话" prop="phone">
        <el-input v-model="formData.phone" style="width: 50%" />
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <file-upload
          :max-upload-size="1"
          :default-file-list="defaultFileList"
          ref="uploadRef"
          accept="jpg,jpeg,png,gif"
          button-text="上传头像"
          list-type="picture-card"
          @update:value="handleAvatarUpdate"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel()">取消</el-button>
        <el-button type="primary" @click="onSubmit()" :loading="btnLoading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { adminApi } from '@/api/admin-api'
import { ElMessage } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { urls2FileList } from '@/utils/utils'

//暴露方法给父组件调用
defineExpose({
  showModel,
  onCancel,
})

//上传文件列表
const defaultFileList = ref([])

// 控制对话框显示与否
const visible = ref(false)
// 按钮加载状态
const btnLoading = ref(false)
// 触发自定义事件
const emit = defineEmits(['refreshList'])

//表单组件
const formRef = ref()

//用户名是否只读
const ureadonly = ref(false)

//表单初始值
const formDefault = {
  id: undefined,
  userName: undefined,
  userPwd: undefined,
  name: undefined,
  sex: undefined,
  phone: undefined,
  avatar: '' as string | undefined,
}

//表单数据
const formData = reactive({ ...formDefault })

//显示对话框
function showModel(row?: any) {
  if (row) {
    ureadonly.value = true
    Object.assign(formData, row)
    let urls = formData.avatar
    const fileList = urls2FileList(urls)
    defaultFileList.value = fileList
  } else {
    ureadonly.value = false
    Object.assign(formData, formDefault)
    defaultFileList.value = []
  }
  visible.value = true
}

/**
 * 头像上传后触发的回调
 */
function handleAvatarUpdate(value: string) {
  formData.avatar = value
}

//文件上传组件
const uploadRef = ref<any>(null)

//提交表单
function onSubmit() {
  const validFiles = uploadRef.value?.getValidFiles()
  if (validFiles.length === 0) {
    ElMessage.warning('头像尚未上传成功，请等待上传完成后再提交')
    return
  }

  formRef.value
    .validate()
    .then(async () => {
      try {
        btnLoading.value = true
        if (formData.id) {
          await adminApi.update(formData)
        } else {
          await adminApi.add(formData)
        }
        ElMessage.success(`${!formData.id ? '新增' : '修改'}管理员信息成功`)
        visible.value = false
        emit('refreshList')
      } catch (e) {
        console.error('Failed to submit form:', e)
        ElMessage.error('提交失败')
      } finally {
        btnLoading.value = false
      }
    })
    .catch((err: any) => {
      console.log('Form validation failed:', err)
    })
}

//取消按钮
function onCancel() {
  formRef.value?.clearValidate()
  visible.value = false
}

//表单校验规则
const rules = reactive({
  userName: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  userPwd: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
  ],
  name: [
    {
      required: true,
      message: '请输入姓名',
      trigger: 'blur',
    },
  ],
  sex: [
    {
      required: true,
      message: '请选择性别',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: true,
      message: '请输入电话',
      trigger: 'blur',
    },
  ],
  avatar: [
    {
      required: true,
      message: '请上传头像',
      trigger: 'blur',
    },
  ],
})
</script>
