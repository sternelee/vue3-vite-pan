<template>
  <div class="svip-tip">
    <div class="svip-tip__banner">
      <img src="http://via.placeholder.com/400x100" alt="">
    </div>
    <h4>迅雷Nas远程下载</h4>
    <div class="svip-tip__cards">
      <img src="http://via.placeholder.com/50" alt="">
      <img src="http://via.placeholder.com/50" alt="">
      <img src="http://via.placeholder.com/50" alt="">
      <img src="http://via.placeholder.com/50" alt="">
    </div>
    <el-button type="primary">开通超级会员</el-button>
  </div>
</template>

<style lang="scss">
.svip-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  h4 {
    font-size: 20px;
    margin-top: 20px;
  }
  &__cards {
    margin-top: 20px;
    img {
      margin: 0 10px;
    }
  }
  .el-button {
    margin-top: 20px;
  }
}
</style>