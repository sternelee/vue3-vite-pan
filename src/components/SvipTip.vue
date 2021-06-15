<template>
  <div class="svip-tip">
    <div class="svip-tip__banner">
      <img :src="banner" alt="" width="150" height="120">
    </div>
    <h3>设备连接成功</h3>
    <h4>迅雷nas远程下载为超级会员专属打造</h4>
    <div class="svip-tip__cards">
      <section>
        <img :src="svipTip1" width="48" height="48" alt="">
        <p>手机远程添加</p>
      </section>
      <section>
        <img :src="svipTip2" width="48" height="48" alt="">
        <p>迅雷超级加速</p>
      </section>
      <section>
        <img :src="svipTip3" width="48" height="48" alt="">
        <p>抱团下载</p>
      </section>
      <section>
        <img :src="svipTip4" width="48" height="48" alt="">
        <p>云盘远程取回</p>
      </section>
    </div>
    <el-button type="primary">开通超级会员</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import banner from '@/assets/device-pc@2x.png'
import svipTip1 from '@/assets/svip-tip1@2x.png'
import svipTip2 from '@/assets/svip-tip2@2x.png'
import svipTip3 from '@/assets/svip-tip3@2x.png'
import svipTip4 from '@/assets/svip-tip4@2x.png'

export default defineComponent({
  setup() {
    return {
      banner,
      svipTip1,
      svipTip2,
      svipTip3,
      svipTip4
    }
  },
})
</script>


<style lang="scss">
.svip-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90vh;
  h3 {
    margin-top: 13px;
    font-size: 22px;
    color: #7D8489;
  }
  h4 {
    font-size: 18px;
    color: #292929;
    margin-top: 60px;
  }
  &__cards {
    margin-top: 28px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    section {
      margin: 0 22px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      p {
        font-size: 10px;
        color: #7E7E7E;
        text-align: center;
      }
    }
  }
  .el-button {
    margin-top: 50px;
    width: 380px;
    height: 40px;
    background: #3D3838;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    color: #F1C37B;
  }
}
</style>