<template>
  <div class="list-empty-container">
    <div class="list-empty-pic">
      <img :src="picEmpty" alt="无记录" />
    </div>
    <div class="list-empty-text">
      <h3>为什么会出现未找到远程下载设备？</h3>
      <div>
        使用远程下载前需同时确保：<br />
        1.智能硬件正常运行 <br />
        2.客户端与智能硬件连接正常 <br />
        3.迅雷账号登录正常 否则会出现未找到远程下载设备的情况。<br />
      </div>
      <h3>如何解决该问题？</h3>
      <div>
        1.请确保智能硬件设备正常运行 <br />
        2.请确保客户端正常与智能硬件连接正常 <br />
        3.迅雷账号登录正常 <br />
      </div>
      <p>排除以上情况后仍无法找到智能设备，请拨打迅雷客服热线400-1111-000</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import picEmpty from "../assets/tip_empty.png";

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      picEmpty
    };
  }
});
</script>

<style lang="scss">
.list-empty {
  &-container {
    display: flex;
    align-items: flex-start;
    padding: 84px 0;
    margin: 0 70px;

    img {
      display: block;
      width: 160px;
      height: 142px;
      margin: 0 auto 19px;
    }
  }

  &-pic {
    margin-right: 30px;
  }

  &-text {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.5);
    line-height: 24px;

    h3 {
      margin-bottom: 10px;
      font-size: 16px;
      color: #26292d;

      &:last-of-type {
        margin-top: 20px;
      }
    }

    p {
      margin-top: 10px;
    }
  }
}
</style>
