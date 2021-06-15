<template>
  <el-dialog
    title=""
    v-model="isVisible"
    width="320px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    custom-class="svip-baotuan-dialog"
    @close="close"
  >
    <section>
      <img :src="svipTip" width="210" height="150" alt="抱团下载">
      <h5>抱团下载</h5>
    </section>
    <h6>超级会员专属特权</h6>
    <div class="svip-baotuan-dialog_table">
      <p style="border-bottom: 1px solid #E3E7EB;">
        <span>用户身份</span>
        <b>年费超级会员</b>
        <b>超级会员</b>
        <b style="border-right:none;">白金会员</b>
      </p>
      <p>
        <span>抱团次数</span>
        <span style="color: #916146;">无限次</span>
        <span><em style="color: #916146;">20</em>次/天</span>
        <span style="border-right:none;">无</span>
      </p>
    </div>
    <el-button type="primary">开通超级会员</el-button>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import svipTip from '@/assets/svip-tip5@3x.jpg'

export default defineComponent({
  props: ['visible'],
  data () {
    return {
      isVisible: false,
      svipTip
    }
  },
  watch: {
    visible (val) {
      this.isVisible = val
    }
  },
  methods: {
    close () {
      this.$store.commit("drive/update", {
        baotuanVisible: false
      })
    }
  }
})
</script>
<style lang="scss">
.svip-baotuan-dialog {
  .el-dialog__body {
    padding: 30px 10px;
  }
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    h5 {
      font-size: 18px;
      color: #916146;
    }
  }
  h6 {
    font-size: 16px;
    color: #26292D;
    margin-top: 2px;
    text-align: center;
  }
  &_table {
    border: 1px solid #E3E7EB;
    border-radius: 1px;
    font-size: 12px;
    color: #949BA5;
    box-sizing: border-box;
    span, b {
      width: 74px;
      height: 34px;
      line-height: 34px;
      text-align: center;
      display: inline-block;
      box-sizing: border-box;
      border-right: 1px solid #E3E7EB;
    }
  }
  .el-button {
    margin-top: 20px;
    width: 288px;
    height: 40px;
    background: #3D3838;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    color: #F1C37B;
  }
}
</style>