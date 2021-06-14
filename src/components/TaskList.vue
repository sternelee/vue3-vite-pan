<template>
  <div class="task-list">
    <div>
      <div class="task-list__title">
        <h3>{{ title }}</h3>
      </div>
      <list-empty v-if="!hasLogin"></list-empty>
      <div v-else-if="showTasks.list.length === 0" class="task-list__empty">
        <file-empty text="暂无记录"></file-empty>
      </div>
      <div v-else class="task-list__content" ref="list">
        <ul>
          <TaskListItem
            v-for="item in showTasks.list"
            :key="item"
            :tid="item"
            @refresh="refresh"
            @delete="handleDelete"
          />
        </ul>
        <loading v-if="hasMore" v-see="loadMore" />
      </div>
    </div>
  </div>
  <delete-task-dialog
    :visible="deleteVisible"
    @confirm="handleDeleteConfirm"
    @close="handleClose"
  />
</template>
<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import TaskListItem from './TaskListItem.vue'
import FileEmpty from './FileEmpty.vue'
import Loading from './Loading.vue'
import ListEmpty from "./ListEmpty.vue"
import DeleteTaskDialog from "./DeleteTaskDialog.vue"

export default defineComponent({
  components: {
    TaskListItem,
    FileEmpty,
    Loading,
    ListEmpty,
    DeleteTaskDialog
  },
  props: {
    title: {
      type: String,
      default: false
    },
    phase: {
      type: String,
      default: 'ing'
    }
  },
  emits: ['delete-success', 'add-url'],
  data () {
    return {
      deleteVisible: false,
      deleteInfo: {}
    }
  },
  computed: {
    ...mapState('drive', ['tasks', 'tasksDone', 'currentTabId']),
    ...mapState('user', ['curUser']),
    showTasks () {
      return this.currentTabId === 'ing' ? this.tasks : this.tasksDone
    },
    hasMore () {
      return !!this.showTasks.pageToken
    },
    hasLogin() {
      return this.curUser.userId !== "0";
    }
  },
  watch: {
    title () {
      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0
      }
    }
  },
  methods: {
    stat(action, data) {
      this.$stat('remote_control_pc', action, data)
    },
    handleClose() {
      this.deleteVisible = false
    },
    handleDelete(info) {
      this.deleteInfo = info
      this.deleteVisible = true
    },
    async handleDeleteConfirm(checked) {
      const info = this.deleteInfo
      try {
        if (checked) {
          const params = {
            id: info.id,
            space: info.space,
            type: info.type,
            action: "delete"
          };
          await this.$store.dispatch("drive/operateTask", params);
        } else {
          const params = {
            ids: [info.id],
            space: info.space
          };
          await this.$store.dispatch("drive/deleteTasks", params);
        }

        this.deleteVisible = false

        this.$message({
          type: "success",
          message: "删除成功"
        });

        this.$emit('delete-success')

        if (this.currentTabId === 'ing') {
          this.stat('downloading_delete_btn_click', {
            result: 'success',
            if_delete_file: checked
          })
        } else if (this.currentTabId === 'done') {
          this.stat('complete_delete_btn_click', {
            result: 'success',
            if_delete_file: checked
          })
        }
      } catch (e) {
        this.$message({
          type: "error",
          message: "删除失败"
        });

        if (this.currentTabId === 'ing') {
          this.stat('downloading_delete_btn_click', {
            result: 'fail',
            if_delete_file: checked
          })
        } else if (this.currentTabId === 'done') {
          this.stat('complete_delete_btn_click', {
            result: 'fail',
            if_delete_file: checked
          })
        }
      }
    },
    loadMore () {
      this.$store.dispatch('drive/fetchTasks', { refresh: false, phase: this.phase })
    },
    refresh (urls, resource, type) {
      this.$emit('add-url', urls, resource, type)
    }
  },
  mounted () {}
})
</script>

<style lang="scss">
.task-list {
  &__content {
    height: calc(100vh - 57px);
    margin-bottom: 24PX;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 8PX;
    }

    &::-webkit-scrollbar-track {
      background-color:#fff;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, .2);
      border-radius: 1PX;
    }
  }

  &__title {
    display: flex;
    padding: 16PX 12PX;
    border-bottom: 1px solid #eee;
    justify-content: center;
    align-items: center;
    background: #fff;

    h3 {
      flex: 1;
      margin-left: 8PX;
      font-size: 16PX;
      color: #4D4D4D;
    }
  }

  &__empty {
    margin-top: 110PX;
  }

  ul {
    margin: 0;
    padding: 0;
  }
}
</style>
