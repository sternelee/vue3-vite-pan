<template>
  <el-dialog
    title="添加下载链接"
    v-model="visibleDialog"
    width="580px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    custom-class="nas-task-dialog"
  >
    <div class="task-dialog__content">
      <el-input
        type="textarea"
        :rows="9"
        resize="none"
        placeholder="请添加一个有效下载链接"
        v-model="value"
      ></el-input>
      <p class="upload">
        <a href="javascript:;" style="position:relative;"><input type="file" class="btn"  @change="handleFile" accept=".torrent" /><i class="el-icon-plus"></i>添加本地BT文件</a>
      </p>
      <el-button type="primary" class="task-parse-btn" @click="handleParseTask" :loading="loading">{{ btnText }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import { checkValidLink } from '../utils/util'

export default defineComponent({
  props: ['visible'],
  components: {},
  emits: ['submit'],
  data () {
    return {
      visibleDialog: false,
      btnText: '确定',
      loading: false,
      value: ''
    }
  },
  computed: {},
  watch: {
    visible (val) {
      this.visibleDialog = val
      if (!val) {
        this.value = ''
      }
    }
  },
  methods: {
    async handleParseTask() {
      if (!this.value.trim()) {
        this.$message({
          type: 'warning',
          message: '请输入链接地址'
        })
        return
      }

      const rawUrls = this.value.split('\n').filter(v => v.trim()).map(v => v.trim())
      const urls = Array.from(new Set(rawUrls))
      // if (urls.length > 50) {
      //   this.$message({
      //     type: 'warning',
      //     message: '最多支持同时添加50个链接'
      //   })
      //   return
      // }
      const validUrls = []
      for (let url of urls) {
        if (checkValidLink(url)) {
          validUrls.push(url)
        }
      }

      if (validUrls.length === 0) {
        this.$message({
          type: 'error',
          message: '请添加有效链接'
        })
        return
      }

      try {
        // 交互暂时限定单个链接
        this.loading = true
        this.btnText = '资源解析中...'
        const result = await this.$store.dispatch('drive/fetchTaskInfo', {urls: validUrls[0]})
        this.loading = false
        this.btnText = '确定'

        if (result.list.resources && result.list.resources[0]) {
          const metaInfo = result.list.resources[0].meta
          if (metaInfo.error) {
            this.$message({
              type: 'error',
              message: '请添加有效链接'
            })
            return
          }
        }

        this.$emit('submit', validUrls.slice(0, 1))
      } catch (e) {
        this.loading = false
        this.btnText = '确定'
        this.$message({
          type: 'error',
          message: '解析失败，请重试'
        })
      }
    },
    async handleFile (e) {
      const files = e.target.files
      console.log('选择文件', files)
      for (let i = 0; i < files.length; i++) {
        const res = await this.$store.dispatch("drive/postBt", { file: files[i] })
        console.log(res)
        if (res.url) {
          this.value = res.url
          this.handleParseTask()
        }
      }
    }
  }
})
</script>

<style lang="scss">
$file-size: 124px;

.nas-task-dialog {
  padding: 12PX 24PX;
  box-shadow: 0 0 10PX 0 rgba(0, 0, 0, .2);

  .el-dialog__body {
    padding-top: 12px;
  }
}

.task-dialog {
  &__title {
    padding-bottom: 20PX;
    text-align: center;
    font-size: 22PX;
    border-bottom: 1PX solid #eee;
  }

  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;

    .el-textarea__inner {
      padding: 16px;
      margin-bottom: 10px;
      background: #F6F6F6;
      border: 1px solid rgba(0,0,0,0.10);
      border-radius: 2px;

      &::placeholder {
        font-size: 12px;
        color: rgba(0,0,0,0.50);
      }
    }
    .upload {
      display:flex;
      justify-content:flex-end;
      width:100%;
      .btn {
        position:absolute;
        left:0;
        top:0;
        width:100%;
        height:100%;
        opacity:0;
        font-size:10px;
        cursor:pointer;
        z-index:1;
      }
    }
  }
}

.task-parse-btn {
  width: 100%;
  font-size: 16px;
  margin-top: 10px;
}
</style>
