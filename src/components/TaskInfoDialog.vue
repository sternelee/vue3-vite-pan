<template>
  <el-dialog
    title="添加下载链接"
    v-if="visible"
    v-model="visible"
    width="580px"
    :close-on-click-modal="false"
    custom-class="nas-task-dialog"
    @close="handleClose"
  >
    <div class="task-dialog__content">
      <div class="url-info">
        <div class="url-info-title">
          <span>文件名</span>
          <!-- <span>类型</span> -->
          <span>大小</span>
        </div>
        <div v-if="taskInfo.list.length" class="url-info-list">
          <div
            v-for="(item, index) in taskInfo.list"
            :key="index"
            class="url-info-item"
          >
            <img :src="item | displayIcon" alt="图标" />
            <span>{{ item.name }}</span>
            <span
              >{{ formatSize(item.file_size || 0) }}(共{{
                item.file_count
              }}个文件)</span
            >
          </div>
          <div class="url-info-sum">
            总: {{ totalInfo.count }}个文件({{ formatSize(totalInfo.size) }})
          </div>
        </div>
        <div v-else class="url-info-list">
          <file-empty text="无数据" />
        </div>
      </div>
      <div class="task-dialog__tip">下载到：</div>
      <div class="task-dialog__folder">
        <span @click="handleShowFolder" :title="downloadPath">{{ downloadPath }}</span>
        <span style="text-align:right;">剩余：{{ formatSize(deviceInfo.limit - deviceInfo.usage) }}</span>
        <span v-if="notEnouth" style="color: #E66056;position:absolute;left:34%;">磁盘剩余空间不足(请保证空间大于文件大小)</span>
      </div>
      <el-button
        :type="notEnouth ? 'info' : 'primary'"
        style="width: 100%; font-size: 16px"
        @click="handleAddTask"
        :disabled="notEnouth"
        >立即下载</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState } from "vuex";
import Loading from "./Loading.vue";
import FileEmpty from "./FileEmpty.vue";
import { formatSize, checkValidLink, debounce } from "../utils/util";
import staticIcons from "../utils/static-icons";

export default defineComponent({
  props: ["visible", "urls"],
  components: {
    Loading,
    FileEmpty
  },
  emits: ['close', 'submit'],
  data() {
    return {
      loading: true
    };
  },
  computed: {
    ...mapState('drive', ['taskInfo', 'treeNodePath']),
    ...mapState('user', ['userInfo']),
    target() {
      return this.userInfo.target;
    },
    deviceInfo() {
      return this.userInfo.downloads[0] || {};
    },
    totalInfo() {
      let size = 0;
      let count = 0;

      for (let res of this.taskInfo.list) {
        size += res.file_size;
        count += res.file_count;
      }

      return {
        size,
        count
      };
    },
    notEnouth () {
      // 空间不足
      return Number(this.deviceInfo.limit - this.deviceInfo.usage) < Number(this.totalInfo.size)
    },
    downloadPath () {
      return this.treeNodePath || this.deviceInfo.path || "--"
    }
  },
  watch: {},
  filters: {
    displayIcon(info) {
      if (info.meta && info.meta.icon) {
        return info.meta.icon
      }
      return staticIcons.other;
    }
  },
  methods: {
    formatSize,
    stat(action, data) {
      this.$stat("remote_control_pc", action, data);
    },
    handleClose() {
      this.$emit("close");
    },
    handleAddTask() {
      this.$emit("submit", this.urls, this.taskInfo.list, "new");
    },
    handleShowFolder() {
      this.$store.dispatch('drive/loadFolders', {
        space: this.target
      })
    }
  }
});
</script>

<style lang="scss">
$file-size: 124px;

.nas-task-dialog {
  padding: 12px 24px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);

  .el-dialog__body {
    padding-top: 12px;
  }
}

.task-dialog {
  &__title {
    padding-bottom: 20px;
    text-align: center;
    font-size: 22px;
    border-bottom: 1px solid #eee;
  }

  &__content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  &__tip {
    width: 100%;
    margin-top: 22px;
    font-size: 13px;
    color: #4d4d4d;
  }

  &__folder {
    display: flex;
    width: 100%;
    align-items: center;
    height: 30px;
    line-height: 30px;
    margin: 10px 0 20px 0;
    background: #ffffff;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    position: relative;

    span {
      flex: 1;
      padding: 0 12px;
      font-size: 12px;
      color: #b3b3b3;
      text-overflow: ellipsis;
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;

      &:last-child {
        text-align: right;
      }
    }
  }
}

.url-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 152px;
  padding: 10px;
  margin: 10px 0 0 0;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: auto;

  &-sum {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
  }

  &-title {
    display: flex;
    height: 18px;
    line-height: 18px;
    margin-bottom: 5px;
    font-size: 12px;
    color: #4d4d4d;

    span {
      border-right: 1px solid #e6e6e6;

      &:first-of-type {
        flex: 1;
        margin-left: 28px;
      }

      &:last-of-type {
        width: $file-size;
        border: 0;
        text-align: center;
      }
    }
  }

  &-list {
    .list-empty {
      img {
        width: 60px;
        height: auto;
        margin: 0 auto 8px;
      }
    }
  }

  &-item {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 0;

    img {
      width: 16px;
      height: 16px;
      margin-right: 10px;
    }

    span {
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      font-size: 12px;
      color: #4d4d4d;

      &:first-of-type {
        flex: 1;
      }

      &:last-of-type {
        width: $file-size;
        flex-shrink: 0;
        padding-left: 8px;
        font-size: 12px;
        color: #b3b3b3;
      }
    }
  }
}
</style>
