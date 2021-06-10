<template>
  <el-dialog
    title="温馨提示"
    :visible="visible"
    width="520px"
    center
    class="task-excess-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="task-excess__content">
      <h3>您今日的免费下载数量已达上限</h3>
      <div class="task-excess__qrcode">
        <div class="qrcode-loading" v-if="loading">二维码加载中...</div>
        <img :src="url" v-else />
        <a @click="handleRefresh" v-if="error" class="qrcode-retry">
          <i class="iconfont icon-retry" />
          <span>点击刷新</span>
        </a>
      </div>
      <p><span>手机迅雷</span> 扫描进入远程控制</p>
      <div class="task-excess__tip">
        说明：用户在群晖NAS设备上，每日最多可免费新建三个迅雷任务，用户使用手机迅雷远程控制NAS，或者开通
        <a
          @click="handleClick"
          href="paycenter"
          target="_blank"
          >迅雷会员</a
        >，将解除任务数限制。
      </div>
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
  data() {
    return {
      error: false,
      loading: false,
      url: ''
    };
  },
  watch: {
    visible (val) {
      if (val) {
        this.genQrCode()
      }
    }
  },
  mounted() {
    if (this.visible) {
      this.genQrCode()
    }
  },
  methods: {
    stat(action, data) {
      this.$stat('remote_control_pc', action, data)
    },
    handleClose() {
      this.$emit("close");
    },
    handleLogout() {
      this.$emit("logout");
    },
    handleRefresh () {
      this.genQrCode();
    },
    handleClick() {
      this.stat('over_limit_tasknum_vip_recharge_click')
    },
    async genQrCode () {
      try {
        this.error = false
        this.loading = true
        const qrcode = await this.$store.dispatch('user/getClientQrCode', {})
        if (qrcode) {
          this.url = URL.createObjectURL(qrcode)
        }
        this.loading = false
      } catch (e) {
        this.error = true
      }
    }
  }
});
</script>

<style lang="scss">
.task-excess-dialog {
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
    font-size: 24px;
  }
}

.task-excess {
  &__tip {
    margin-top: 50px;
    padding-top: 16px;
    font-size: 14px;
    color: #999;
    line-height: 24px;
    border-top: 1px solid rgba(0,0,0,0.06);

    a {
      color: #3f85ff;
    }
  }

  &__qrcode {
    position: relative;

    & + p {
      margin-top: 2px;
      font-size: 18px;
      color: rgba(0,0,0,0.65);
    }

    .qrcode-retry {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 224PX;
      height: 224PX;
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
        &.icon-retry {
          font-size: 64px;
          color: var(--main-color);

          & + span {
            color: var(--main-color);
          }
        }
      }
    }
  }

  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

    h3 {
      margin: 12px 0 6px 0;
      font-size: 20px;
      color: rgba(0,0,0,0.85);
    }

    .qrcode-loading {
      width: 224PX;
      height: 224PX;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      color: rgba(0,0,0,0.25);
      background: #F9F9F9;
      border-radius: 2px;
    }

    img {
      width: 224px;
      height: 224px;
    }

    span {
      color: #3f85ff;
    }
  }
}
</style>
