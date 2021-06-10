<template>
  <div class="list-empty">
    <img :src="picEmpty" alt="无记录" />
    <p>{{text}}</p>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import picEmpty from '../assets/tip_empty.png'

export default defineComponent({
  props: {
    text: {
      type: String,
      default: '暂无记录'
    }
  },
  data () {
    return {
      picEmpty
    }
  }
})
</script>

<style lang="scss">
.list-empty {
  img {
    display: block;
    width: 160PX;
    height: 142PX;
    margin: 0 auto 19PX;
  }

  p {
    font-size: 12PX;
    color: #b3b3b3;
    text-align: center;
  }
}
</style>
