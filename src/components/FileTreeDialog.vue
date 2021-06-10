<template>
  <div>
    <td-dialog
      :visible="visible" custom-class="dialog-folder" @close="cancel"
      class="pan-dialog-cover"
    >
      <template v-slot:header>
        <h3>{{ type | displayTitle }}</h3>
      </template>
      <div class="file-tree-body-container">
        <td-tree-plus
          :data="data"
          :lazy="true"
          :load="loadFunction"
          :levelPadding="levelPadding"
          iconClass="file-tree-icon"
          ref="tree"
          :bindingKeyGenerator="bindingKeyGenerator"
          @create="handleCreate"
          @changeChosenNode="changeChosenNode"
        />
      </div>
      <template v-slot:footer>
        <div class="file-tree-btn-container">
          <div class="file-tree-btn__new">
            <a @click="handleCreateNode">新建文件夹</a>
          </div>
          <div class="file-tree-btn__normal">
            <a @click="confirm">确定</a>
            <a @click="cancel">取消</a>
          </div>
        </div>
      </template>
    </td-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import staticIcons from '@/utils/static-icons'

export default defineComponent({
  props: ['data', 'visible', 'type'],
  data () {
    return {
      levelPadding: 20,
      val: '',
      filePathArray: ['我的云盘'],
      parentId: ''
    }
  },
  computed: {
    ...mapState('user', ['userInfo']),
    target() {
      return this.userInfo.target;
    },
  },
  filters: {
    displayTitle (type) {
      const typeMap = {
        0: '复制到',
        1: '移动到',
        2: '选择保存位置'
      }
      return typeMap[type]
    }
  },
  mounted () {
    const tree = this.$refs.tree
    const treeChildren = tree.$children
    //const chosenNode = treeChildren[0]
    //this.$refs.tree.chosenNode = null
    this.changeChosenNode(this.$refs.tree.chosenNode)
  },
  methods: {
    disableFunction (node) {
      return false
    },
    bindingKeyGenerator (node) {
      return node.id
    },
    handleCreate ({ chosenNode, content }) {
      if (!content.trim()) {
        return
      }
      console.log(chosenNode.node)
      const id = chosenNode.node.id === '0' ? '' : chosenNode.node.id
      const data = { parent_id: id, name: content, space: this.target, kind: 'drive#folder' }

      this.$store.dispatch('drive/addFileTreeFolder', data)
        .then((res) => {
          this.onMessageTip('success', `目录 ${data.name} 创建成功`, 2000)
          this.$nextTick(() => {
            chosenNode.node.children.push({
              id: res.file.id,
              title: data.name,
              icon: staticIcons.dir,
              path: `${chosenNode.node.path}/${content}`,
              leaf: true,
              __order: -(chosenNode.node.children.length),
              __level: chosenNode.node.__level + 1
            })
            chosenNode.node.children.sort((a, b) => a.__order - b.__order)
          })

          setTimeout(() => {
            // this.$emit('refresh')
          }, 500)
        }).catch(err => {
          this.onMessageTip('fail', `创建失败，${err.error_description}`, 2000)
        })
    },
    async loadFunction (node) {
      const res = await this.$store.dispatch('drive/loadFolders', {
        space: this.target,
        parent_id: node.id,
        filters: { kind: { eq: 'drive#folder' }, trashed: { eq: false } }
      })

      if (res && Array.isArray(res.files)) {
        const children = res.files.map((f, index) => ({
          id: f.id,
          title: f.name,
          icon: staticIcons.dir,
          path: f.params.RealPath,
          __order: index
        }))
        return children
      } else {
        return []
      }
    },
    changeChosenNode (node) {
      if(!node){
        this.$store.commit('drive/update', {
          treeNodeId: "",
          treeNodePath: "",
        })
        return

      }
      this.filePathArray = []
      this.getNodeName(node)
      this.$store.commit('drive/update', {
        treeNodeId: node.node.id,
        treeNodePath: node.node.path
      })
    },
    handleCreateNode () {
      const chosenNode = this.$refs.tree.chosenNode
      if (chosenNode) {
        this.$refs.tree.chosenNode.mode = 'create'
      } else {
        this.onMessageTip('info', '请选择文件夹', 2000)
      }
    },
    confirm () {
      if (!this.$refs.tree.chosenNode) {
        this.onMessageTip('info', '请选择文件夹', 2000)
        return
      }
      this.$store.commit('drive/update', { 'treeDataVisible': false })
    },
    cancel () {
      this.$store.commit('drive/update', { 'treeDataVisible': false })
    },
    getNodeName (node) {
      this.filePathArray.push(node.node.title)
      if (node.$parent.node) {
        this.getNodeName(node.$parent)
      }
    },
    onMessageTip (type, p, time = 5000) {
      this.$message({
        type,
        message: p,
        timeout: time
      })
    }
  }
})
</script>

<style lang="scss">
$active-hover-color: #619bff;
.td-cover {
  z-index: 2300;
  /* background: rgba(0,0,0,0.4); */
}
.file-tree-body-container .td-tree-node__content {
  display: flex;
  align-items: center;
}
.td-message {
  font-size: 14px;
}
.dialog-folder {
  width: 600PX;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: -270px;

  .td-button {
    width: 80%;
    height: 40PX;
    margin: 10PX auto;
    font-size: 16PX;
  }

  h3 {
    font-size: 15PX;
    color: var(--color-title);
    padding-left: 24PX;
    margin: 24PX 0 12PX 0;
  }

  .td-dialog__footer {
    margin: 12PX 0 24PX 0;
  }
}

.file-tree-icon {
  background-size: contain;
}

.td-tree-node__image-icon {
  width: 16PX;
  height: 16PX;
  margin: 0 2PX 0 6PX;
  background-size: contain;
}

.td-tree-node__label {
  margin: 0 7PX;
  font-size: 12PX;
  color: var(--color-default);
}

.file-tree-body-container {
  height: 240PX;
  margin: 12PX 24PX;
  padding: 1PX 0PX;
  border: 1PX solid var(--color-border);
  border-radius: 4PX;
  overflow: auto;

  input {
    width: 82PX;
    height: 30PX;
    margin-top: 4PX;
    font-size: 12PX !important;
    border: 1PX solid var(--color-border);
    border-radius: 4PX;

    &:focus {
      border: 1PX solid var(--color-border);
    }
  }

  &::-webkit-scrollbar {
    width: 10PX;
  }

  &::-webkit-scrollbar-track {
    border-radius: 1PX;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 1PX;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-border);
  }

  .td-tree-node__content {
    height: 30PX;
    line-height: 30PX;

    &.is-chosen {
      background: var(--color-item-active);
    }

    &:hover {
      background: var(--color-item-hover);;
    }

    .td-tree-node__expand-icon {
      margin-left: 6px;
      font-size: 16PX;
      color: var(--color-secondary);

      &.is-expanded {
        color: var(--color-secondary);
      }
    }
  }
}

.file-tree-btn {
  &-container {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0 24PX;
  }

  &__new {
    width: 90PX;
    height: 30PX;
    line-height: 30PX;
    color: var(--color-default);
    font-size: 12PX;
    border: 1PX solid var(--color-border);
    border-radius: 4PX;
    text-align: center;
    box-sizing: border-box;
    a {
      display: block;
      color: currentColor;
      cursor: pointer;
    }
    &:hover{
      background-color: var(--background-main);
    }
  }

  &__normal {
    flex: 1;
    text-align: right;
    height: 30PX;
    line-height: 30PX;
    display: flex;
    justify-content: flex-end;

    a {
      display: inline-block;
      width: 72PX;
      height: 30PX;
      line-height: 30PX;
      margin-left: 10PX;
      font-size: 12PX;
      color: var(--color-default);
      text-align: center;
      background: var(--background-module);
      border-radius: 4PX;
      border: 1PX solid var(--color-border-form);
      box-sizing: border-box;
      vertical-align: middle;
      cursor: pointer;

      &:first-of-type {
        color: #fff;
        background: var(--color-primary);
        border: 1PX solid var(--color-primary);
        &:hover {
          background-color: $active-hover-color;
        }
      }
      &:hover{
        background-color: var(--background-main);
      }
    }
  }
}
</style>
