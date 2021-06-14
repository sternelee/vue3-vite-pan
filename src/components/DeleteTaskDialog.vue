<template>
  <el-dialog
    title="确定要删除该任务吗？"
    v-model="isVisible"
    width="400px"
    :close-on-click-modal="false"
    custom-class="task-delete-dialog"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="delete-dialog__content">
      <el-checkbox v-model="checked">同时删除设备文件</el-checkbox>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  props: ['visible'],
  components: {},
  emits: ['close', 'confirm'],
  data () {
    return {
      isVisible: false,
      checked: false
    }
  },
  computed: {},
  watch: {
    visible (val) {
      this.isVisible = val
      if (this.checked) {
        this.checked = false
      }
    }
  },
  methods: {
    handleClose () {
      this.$emit('close')
    },
    async confirm() {
      this.$emit('confirm', this.checked)
    }
  }
})
</script>

<style lang="scss">
$file-size: 124px;

.task-delete-dialog {
  padding: 12PX 24PX;
  box-shadow: 0 0 10PX 0 rgba(0, 0, 0, .2);

  .el-dialog__header {
    text-align: left;
    font-size: 15px;
    color: #1A1A1A;
  }

  .el-dialog__title {
    font-size: 15px;
    color: #1A1A1A;
  }

  .el-dialog__body {
    padding-top: 12px;
  }

  .el-checkbox__label {
    font-size: 13px;
    color: #4D4D4D;
  }

  .el-checkbox__input.is-checked+.el-checkbox__label {
    color: var(--main-color);
  }

  .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #fff;
    border: 1px solid #E6E6E6;
  }

  .el-checkbox__inner::after {
    border: 2px solid var(--main-color);
    border-left: 0;
    border-top: 0;
  }

  .el-button {
    padding: 8px 22px;
    font-size: 12px;
  }
}

.delete-dialog {
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
    align-items: flex-start;

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
</style>
