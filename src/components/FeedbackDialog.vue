<template>
  <el-dialog
    title="意见反馈"
    v-if="visible"
    :visible="visible"
    width="580px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    class="nas-feedback-dialog"
    @close="handleClose"
  >
    <div class="task-dialog__content">
      <el-input
        type="textarea"
        :rows="9"
        resize="none"
        placeholder="请简要描述您遇到的问题，或者意见，并点击【确认】后提交。例如：创建任务后，点击暂停无法暂停"
        v-model="value"
      ></el-input>
      <el-button type="primary" class="feedback-parse-btn" @click="handleSubmit" :loading="loading">{{ btnText }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['visible'],
  components: {},
  data () {
    return {
      btnText: '确定',
      loading: false,
      value: ''
    }
  },
  computed: {},
  watch: {
    visible (val) {
      if (!val) {
        this.value = ''
      }
    }
  },
  methods: {
    handleClose () {
      this.$emit('close')
    },
    async handleSubmit() {
      if (!this.value.trim()) {
        this.$message({
          type: 'warning',
          message: '请输入内容'
        })
        return
      }
      this.loading = true
      const res = await this.$store.dispatch('drive/postFeedback', {
        content: this.value
      })
      console.log(res)
      this.loading = false
      if (res.error) {
        return this.$message({
          type: 'warning',
          message: '提交失败'
        })
      }
      this.$message({
        type: 'success',
        message: '提交成功'
      })
      this.handleClose()
    }
  }
})
</script>

<style lang="scss">
$file-size: 124px;

.nas-feedback-dialog {
  padding: 12PX 24PX;
  box-shadow: 0 0 10PX 0 rgba(0, 0, 0, .2);

  .el-dialog__body {
    padding-top: 12px;
  }
}

.feedback-dialog {
  &__title {
    padding-bottom: 20PX;
    text-align: center;
    font-size: 22PX;
    border-bottom: 1PX solid #eee;
  }

  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

    .el-textarea__inner {
      padding: 16px;
      margin-bottom: 10px;
      background: #F6F6F6;
      border: 1px solid rgba(0,0,0,0.10);
      border-radius: 2px;

      &::placeholder {
        font-size: 12px;
        color: rgba(0,0,0,0.50);
      }
    }
  }
}

.feedback-parse-btn {
  width: 100%;
  font-size: 16px;
  margin-top: 24px;
}
</style>
