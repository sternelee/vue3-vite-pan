<template>
  <el-dialog
    title="超过同时登录设备上限"
    width="520px"
    v-model="isVisible"
    :show-close="false"
    :close-on-click-modal="false"
    center
    custom-class="nas-device-dialog"
    @close="handleClose"
  >
    <div slot="title" class="el-dialog__title">
      <i class="iconfont icon-warning" />
      {{text}}
    </div>
    <div class="nas-device__content">
      <div class="nas-device__text">
        1、同一个迅雷账号最多可以登录并绑定3台NAS设备<br />
        2、当绑定设备数量达到上限后，需要退出某台设备的迅雷账号，并重新扫码登录绑定新设备<br />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleLogout" :loading="loading">关闭并退出登录</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: ["visible", "loading","text"],
  emits: ['close', 'logout'],
  data() {
    return {
      isVisible: false,
      expired: false
    };
  },
  watch: {
    visible (val) {
      this.isVisible = val
    }
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleLogout () {
      this.$emit("logout");
    }
  }
});
</script>

<style lang="scss">
.nas-device-dialog {
  padding: 12px 24px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

  .el-dialog__header {
    padding: 36px 0 25px 0;
    font-size: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .el-dialog__close {
      color: #999;
    }
  }

  .el-dialog__title {
    display: flex;
    justify-content: center;

    i {
      margin-right: 6px;
      font-size: 20px;
      color: #faad14;
    }
  }
}

.nas-device {
  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  &__text {
    margin-bottom: 52px;
  }
}
</style>
