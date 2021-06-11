<template>
  <el-dialog
    title="当前版本已经过期"
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    width="520px"
    center
    custom-class="nas-update-dialog"
    @close="handleClose"
  >
    <div class="nas-update__content">
      <div class="nas-update__text">
        {{ text || `当前版本${clientVersion || ''}已经过期，无法继续使用。您可以前往套件中心升级或者手动安装你获取到的最新版本。` }}
        <div style="margin-top: 24px; color: #999">
          手动安装教程：<br/>
          打开套件中心——点击手动安装——选择本地最新安装包进行安装
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-if="false">
        <el-button type="primary" @click="handleUpdate" v-if="false">前去升级</el-button>
        <el-button type="primary" @click="handleClose">我知道了</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  props: ["visible", 'text'],
  emits: ['close'],
  data() {
    return {
      loading: true
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    clientVersion() {
      return this.userInfo.client_version;
    },
  },
  watch: {},
  mounted() {},
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleUpdate () {
      console.log('update plugin')
    }
  }
});
</script>

<style lang="scss">
.nas-update-dialog {
  padding: 12px 24px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

  .el-dialog__header {
    padding: 25px 0 25px 0;
    font-size: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .el-dialog__close {
      color: #999;
    }
  }
}

.nas-update {
  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  &__text {
    margin: 30px 0 52px 0;
    font-size: 14px;
    color: #26292D;
  }
}
</style>
