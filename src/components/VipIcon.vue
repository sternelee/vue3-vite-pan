<template>
  <i :class="vipClass"></i>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    vipData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    vipClass () {
      const { vipType, isVip, vipLevel } = this.vipData
      let vipClass = ''
      let vasTypeMap = {
        '1':'',
        '2': '', // 普通会员
        '3': 'p', // 白金会员
        '5': 's' // 超级会员
      }
      if (vipLevel) {
        vipClass = `vip-icon-${vasTypeMap[vipType]}vip${vipLevel}`
      }
      if (!isVip) {
        vipClass += ' is-disabled'
      }
      return vipClass
    }
  }
})
</script>

<style lang="css" src="../assets/vip-icon.css"></style>
