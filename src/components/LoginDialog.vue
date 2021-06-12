<template>
  <el-dialog
    title="扫码登录"
    v-model="visibleDialog"
    width="520px"
    center
    :close-on-click-modal="false"
    custom-class="nas-login-dialog"
    @close="handleClose"
  >
    <div class="nas-login__content">
      <div class="nas-login__qrcode">
        <div class="qrcode-loading" v-if="loading">
          二维码加载中...
        </div>
        <img :src="url" v-else />
        <div
          class="scan-status"
          v-if="
            scanStatus && scanStatus !== 'pending' && scanStatus !== 'complete'
          "
          @click="scanStatus === 'error' ? refresh() : null"
        >
          <i
            :class="
              `iconfont ${
                scanStatus === 'error' ? 'icon-retry' : 'icon-success'
              }`
            "
          />
          <span v-if="scanStatus === 'error'">点击刷新</span>
        </div>
      </div>
      <p v-if="scanStatus === 'running'" :class="`scan-status__${scanStatus}`">
        扫码成功，请在手机端确认登录
      </p>
      <p v-else-if="scanStatus === 'error'">登录失败，请刷新后重新扫码</p>
      <p v-else>打开 <span>手机迅雷</span> 扫描二维码</p>
    </div>
    <div class="nas-login__tip">
      <ul>
        <li>
          1、使用安卓迅雷7.20及其以上版本，或者ios迅雷扫码登录迅雷套件。（可用微信扫码下载最新迅雷）
        </li>
        <li>
          2、操作设备：设备与迅雷账号绑定后，在手机迅雷中即可控制设备畅享高速下载，并可实现对控制设备的随时切换
        </li>
        <li>3、如有疑问，请咨询官方客服 400-1111-000</li>
      </ul>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import Loading from "./Loading.vue";

export default defineComponent({
  props: ["visible"],
  components: {
    Loading
  },
  emits: ['close', 'login-success'],
  data() {
    return {
      loading: true,
      url: "",
      scanStatus: "",
      scanTimer: null,
      inRequest: false
    };
  },
  watch: {
    visible(val) {
      this.visibleDialog = val
      if (val) {
        this.genQrCode();
        this.stat("login_2dcode_pop_show");
      } else {
        this.clearScanTimer();
      }
    }
  },
  async mounted() {
    if (this.visible) {
      this.genQrCode();
    } else {
      this.clearScanTimer();
    }
  },
  beforeDestroy() {
    this.clearScanTimer();
  },
  methods: {
    stat(action, data) {
      this.$stat('remote_control_pc', action, data)
    },
    handleClose() {
      this.$emit("close");
    },
    refresh() {
      this.genQrCode();
    },
    clearScanTimer() {
      if (this.scanTimer) {
        clearInterval(this.scanTimer);
        this.scanTimer = null;
      }
    },
    async checkScanStatus() {
      if (this.inRequest) {
        return;
      }
      this.inRequest = true;
      const result = await this.$store.dispatch("user/checkScanStatus");
      if (result.status === "complete") {
        this.scanStatus = result.status;
        this.$emit("login-success");
        this.stat('login_result', { result: 'success' })
        this.clearScanTimer();
      } else if (result.status === "error") {
        this.scanStatus = result.status;
        this.stat('login_result', { result: 'fail' })
        this.clearScanTimer();
      } else {
        this.scanStatus = result.status;
        this.scanTimer = setTimeout(this.checkScanStatus, 1500);
      }
      this.inRequest = false;
    },
    async genQrCode() {
      try {
        this.clearScanTimer();
        this.scanStatus = "";

        this.loading = true;
        // 这个在拉取二维码前，刷新下device/info 规避同时登录两个账号问题
        await this.$store.dispatch("user/watchUserInfo", {});
        const qrcode = await this.$store.dispatch("user/getQrCode", {});
        if (qrcode) {
          this.url = URL.createObjectURL(qrcode);
        }

        this.loading = false;
        this.checkScanStatus();
      } catch (e) {
        this.scanStatus = "error";
      }
    }
  }
});
</script>

<style lang="scss">
.nas-login-dialog {
  padding: 12px 24px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

  .el-dialog__header {
    padding: 36px 0 25px 0;
    font-size: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .el-dialog__close {
      color: #999;
    }

    .el-dialog__title {
      font-size: 24px;
      color: #595959;
    }
  }
}

.nas-login {
  &__qrcode {
    position: relative;

    & + p {
      margin-top: 16px;
      font-size: 18px;
      color: rgba(0, 0, 0, 0.65);
      text-align: center;

      span {
        font-size: 20px;
      }
    }
  }

  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding-bottom: 46px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .qrcode-loading {
      width: 224px;
      height: 224px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.25);
      background: #f9f9f9;
      border-radius: 2px;
    }

    img {
      width: 224px;
      height: 224px;
    }

    span {
      color: var(--main-color);
    }

    a {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      font-size: 14px;
      color: #308bfd;
      margin: auto;
      background: rgba(255, 255, 255, 0.9);
      cursor: pointer;

      i {
        width: 28px;
        height: 28px;
        line-height: 28px;
        margin-bottom: 8px;
        font-size: 28px;
      }
    }
  }

  &__tip {
    padding-top: 16px;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      font-size: 14px;
      color: #999;
      line-height: 24px;
    }
  }
}

.scan-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 224px;
  height: 224px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.25);
  border-radius: 2px;
  background: rgba(249, 249, 249, 0.9);
  z-index: 1;
  cursor: pointer;

  i {
    color: var(--main-color);

    &.icon-success {
      color: #26cf79;
      font-size: 64px;
    }

    &.icon-retry {
      font-size: 64px;
      color: var(--main-color);

      & + span {
        color: var(--main-color);
      }
    }
  }

  span {
    margin-top: 16px;
  }

  &__running {
    color: #1abc6a !important;
  }
}
</style>
