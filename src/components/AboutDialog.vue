<template>
  <el-dialog
    title="迅雷"
    v-model="visible"
    width="520px"
    center
    custom-class="about-dialog"
    @close="handleClose"
  >
    <div class="about-dialog__content">
      <div>版本号：{{ userInfo.client_version }}</div>
      <div>下载引擎：{{ userInfo.download_version}}</div>
      <div>编译号：{{ userInfo.build_version }}</div>
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
  emits: ['close'],
  data() {
    return {
      error: false,
      loading: false,
      url: ''
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo || {};
    }
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$emit("close");
    }
  }
});
</script>

<style lang="scss">
.about-dialog {
  padding: 12px 24px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    align-items: flex-start;
    padding: 20px 30px;
    line-height: 2;
  }

  .el-dialog__header {
    font-size: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    .el-dialog__close {
      color: #999;
    }
  }
}
</style>
