<template>
  <div class="pan-loading" :style="styleCss">
    <div />
    <div />
    <div />
    <div />
  </div>
</template>
<script>
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    styleCss: {
      type: Object,
      default: () => ({})
    }
  }
})
</script>

<style lang="scss">
.pan-loading {
  position: relative;
  width: 16PX;
  height: 16PX;
  margin: 12PX auto;

  div {
    position: absolute;
    width: 16PX;
    height: 16PX;
    border: 2PX solid #3F85FF;
    border-radius: 50%;
    box-sizing: border-box;
    animation: loading 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #3F85FF transparent transparent transparent;

    &:nth-child(1) {
      animation-delay: -0.45s;
    }
    &:nth-child(2) {
      animation-delay: -0.3s;
    }
    &:nth-child(3) {
      animation-delay: -0.15s;
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
