<template>
  <div>
    <div class="nas-task-list">
      <div>
        <div class="nas-task-list__title" >
          <h3 @click='$emit("open",null)'>{{ title }}</h3>
        </div>
        <div v-if="files.list.length === 0" class="nas-task-list__empty">
          <file-empty text="暂无记录"></file-empty>
        </div>
        <div v-else class="nas-task-list__content" ref="list">
          <ul>
            <file-list-item
              v-for="item in files.list"
              :key="item.id"
              :file="item"
              @refresh="refresh"
              @open='$emit("open",item)'
            />
          </ul>
          <loading v-if="hasMore" @click="loadMore" v-see="loadMore" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import FileListItem from './FileListItem.vue'
import FileEmpty from './FileEmpty.vue'
import Loading from './Loading.vue'

export default defineComponent({
  components: {
    FileListItem,
    FileEmpty,
    Loading
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
  data () {
    return {
      parent_id:""
    }
  },
  computed: {
    driveStore () {
      return this.$store.state.drive
    },
    files () {
      return this.driveStore.files || {}
    },
    space() {
      return this.files.space
    },
    parentId() {
      return this.files.parentId
    },
    hasMore () {
      return this.files.hasMore
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
    openfile(file){
      if(file.kind == "drive#folder"){
        //console.log("open",file)
        this.parent_id = file.id
        this.refresh()
      }
    },
    loadMore () {
      console.log("load more",{parent_id: this.parentId,space:this.space})
      this.$store.dispatch('drive/fetchFiles', { refresh: false,parent_id: this.files.parentId,space:this.files.space })
    },
    refresh () {
      this.$store.dispatch('drive/fetchFiles', { refresh: true, parent_id: this.parentId })
    }
  }
})
</script>

<style lang="scss">
.nas-task-list {
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
