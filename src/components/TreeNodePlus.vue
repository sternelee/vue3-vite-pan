<template>
  <div class="td-tree-node is-expanded" :class="{ [root.disableClass]: isDisabledNode }" style="user-select: none;">
    <div
      class="td-tree-node__content"
      :style="{ paddingLeft: `${(node.__level - 1) * levelPadding}px` }"
      :class="{ 'is-leaf': node.leaf, 'is-chosen': isChosen }"
      @click="handleClickNodeContent"
      @dblclick="root.expandWhenDoubleClick && handelClickExpandIcon()"
    >
      <span
        class="td-tree-node__expand-icon td-icon-arrow-drop "
        :class="[{ 'is-expanded': node.expand }]"
        @click="handelClickExpandIcon"
        @dblclick.stop
      ></span>
      <label class="td-checkbox" :class="{ 'is-indeterminate': indeterminate }" v-show="checkable && !isInputLabel">
        <input type="checkbox" class="td-checkbox__inner" @click="handleClickCheckbox" :checked="!!node.checked" />
      </label>
      <i class="td-icon-loading" v-if="lazy && loading"></i>
      <span
        class="td-tree-node__image-icon"
        :class="[node.iconClass]"
        :style="iconStyle"
        v-show="!isInputLabel || inputLabelIconVisible"
        v-else
      >
      </span>
      <span class="td-tree-node__label is-checked">
        <template v-if="isInputLabel">
          <label class="td-input">
            <span class="td-input__label"></span>
            <input
              type="text"
              class="td-input__inner"
              placeholder="请输入文字"
              :value="root.defaultPlaceholder"
              @keydown.enter.prevent="handleConfirmInputCreate"
              @blur="handleConfirmInputCreate"
              ref="createInput"
            />
          </label>
        </template>
        <template v-else>
          {{ node.title }}
        </template>
      </span>
    </div>
    <div class="td-tree-node__children">
      <td-tree-node-plus
        v-show="node.expand"
        v-for="(childNode, index) in node.children"
        :node="childNode"
        :key="root.bindingKeyGenerator(childNode)"
        v-model="node.children[index]"
        :load="load"
        :lazy="lazy"
        :levelPadding="levelPadding"
        :isInputLabel="!!childNode.isInputLabel"
        :checkable="checkable"
        @createInputFinish="handleChildConfirmInputCreate"
      >
      </td-tree-node-plus>
    </div>
  </div>
</template>

<script>
import { debounce } from '@/utils/util'
export default {
  name: `td-tree-node-plus`,
  model: {
    prop: 'node',
    event: 'change'
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    lazy: {
      type: Boolean,
      default: false
    },
    load: {
      type: Function
    },
    levelPadding: {
      type: Number,
      default: 16
    },
    // 用来标记是否是一个输入框节点
    isInputLabel: {
      type: Boolean,
      default: false
    },
    checkable: {
      type: Boolean
    }
  },
  data () {
    return {
      indeterminate: false,
      loading: false,
      innerLazy: false,
      mode: '' // 当前只有两种mode， '' 和 'create'
      // create mode用来在当前节点的children中创建一个新的节点
    }
  },
  inject: ['root'],
  watch: {
    mode (newVal, oldVal) {
      if (newVal === 'create') {
        this.handleInCreateMode()
      }
    },
    'node.children.length': {
      handler (newVal) {
        this.node.leaf = !this.node.children.length
        this.node.children.sort((a, b) => a.__order - b.__order)
      }
    },
    'node.children': {
      deep: true,
      immediate: true,
      // 监听children 是否有变化，如果有变化，自己的checked 属性也需要及时更新
      handler () {
        if (this.$children && this.$children.length) {
          let allChecked = true
          let allNotChecked = true
          let anyChildIndeterminate = false
          // 如果任意child的`indeterminate`是true，说明当前node 的所有子集至少有一个没有被选中，因此它的 `indeterminate` 也是true
          for (let i = 0; i < this.$children.length; i++) {
            if (this.$children[i].isInputLabel) {
              continue
            }
            if (this.$children[i].indeterminate) {
              anyChildIndeterminate = true
            }
            if (this.$children[i].node.checked) {
              allNotChecked = false
            } else {
              allChecked = false
            }
          }
          // 当一个node 的children 都是leaf时，这时不能根据他们的 `indeterminate` 来判断，因为leaf 的`indeterminate` 一定是false，
          // 所以根据所以子节点即不都被选中，也没有都不被选中来做 `indeterminate` 的状态依据
          let indeterminate = anyChildIndeterminate || (!allChecked && !allNotChecked)
          // 当前 node 的`indeterminate` 修改时，它的所有祖先节点的 `indeterminate` 都有可能被修改，所以需要不断想上更新祖先节点的`indeterminate`状态
          if (indeterminate) {
            if (!allChecked) {
              let cur = this
              while (cur && cur.$options._componentTag === 'td-tree-node-plus') {
                cur.indeterminate = indeterminate
                cur = cur.$parent
              }
            }
          } else {
            let cur = this
            while (cur && cur.$options._componentTag === 'td-tree-node-plus') {
              let allChecked = cur.$children.every(child => child.node.checked)
              let indeterminate = cur.$children.some(child => child.indeterminate || child.node.checked)
              cur.indeterminate = !allChecked && indeterminate
              cur = cur.$parent
            }
            // 设置为false 时，有可能是最后一个indeterminate 要检测下 父级元素的所有child 是否有任意一个时indeterminate,这是一个递归的过程
          }
          const checked = allChecked
          if (checked !== !!this.node.checked) {
            this.node['checked'] = checked
            this.$emit('change', this.node)
          }
        }
      }
    }
  },
  methods: {
    handleClickNodeContent (event) {
      if (this.isDisabledNode) {
        event.preventDefault()
        return
      }
      this.root.chosenNode = this
    },
    updateChildren (checked) {
      for (let i = 0; i < this.$children.length; i++) {
        this.$children[i].updateChildren(checked)
        this.$children[i].node['checked'] = checked
      }
    },
    // 这个函数是当子代node input，确认输入后，需要被从当前node.children 中删除时调用
    handleChildConfirmInputCreate (childNode) {
      if (this.node.children && this.node.children.length) {
        const index = this.node.children.findIndex(node => node === childNode)
        if (index !== -1) {
          this.node.children.splice(index, 1)
        }
      }
      this.mode = ''
    },
    handleClickCheckbox () {
      if (this.indeterminate) {
        this.indeterminate = false
        this.updateChildren(true)
        this.node['checked'] = true
      } else {
        this.updateChildren(!this.node.checked)
        this.node['checked'] = !this.node.checked
      }
      this.$emit('change', this.node)
    },
    // 这时当前node 节点是一个input 节点用来创建新的内容并确认后触发的函数
    handleConfirmInputCreate: debounce(
      async function () {
        const refContent = this.$refs['createInput']
        if (refContent) {
          const refContentValue = refContent.value
          this.$parent.innerLazy && await this.$parent.loadData()
          this.root.$emit('create', {
            chosenNode: this.$parent,
            content: refContentValue
          })
          this.$emit('createInputFinish', this.node)
          this.$parent.mode = ''
        }
      },
      10,
      this
    ),
    handleInCreateMode () {
      const node = {
        __level: this.node.__level + 1,
        isInputLabel: true,
        leaf: true,
        // 这里是为了保证，加入虚拟节点，不会改变父级的checked 状态
        checked: this.node.checked,
        __order: this.node.children ? -this.node.children.length : 0
      }
      if (this.node.children) {
        this.node.children.push(node)
      } else {
        this.node['children'] = [node]
      }
      this.node['expand'] = true
    },
    async loadData () {
      try {
        this.loading = true
        let res = await this.load(this.node)
        if (res && res.length) {
          for (let i = 0; i < res.length; i++) {
            this.root.autoGeneratedKey(res[i], this.node)
          }
          this.node['children'] = res
          this.innerLazy = false
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async handelClickExpandIcon () {
      if (this.isDisabledNode) {
        return
      }
      let nextExpandState = !this.node.expand
      if (nextExpandState && this.innerLazy && (!this.node.children || !this.node.children.length)) {
        await this.loadData()
      }
      this.node['expand'] = nextExpandState
      this.$emit('change', this.node)
    }
    // 根据层级和child所在下标自动生成key
  },
  computed: {
    inputLabelIconVisible () {
      return this.root.nodeInsertionIconManifest.visible
    },
    iconStyle () {
      const obj = Object.create(null)
      if (this.node.icon) {
        obj['background-image'] = `url(${this.node.icon})`
      }
      if (this.isInputLabel) {
        const { visible, icon } = this.root.nodeInsertionIconManifest
        if (visible) {
          obj['background-image'] = `url(${icon})`
        }
        // 文件夹图片
      }
      return obj
    },
    isDisabledNode () {
      return this.root.disableFunction(this.node)
    },
    isChosen () {
      return this.root.chosenNode === this
    }
  },
  mounted () {
    if (this.lazy && !this.load) {
      console.warn('Load function must not be empty if lazy is true')
    }
    // HACK: 边界情况，父级expand 为false， 子级中的checked 为true，因为被渲染，watch 走不到，所以这里hack下
    // let expand = !!this.node.expand
    // this.node['expand'] = expand

    this.innerLazy = this.lazy
    this.$refs['createInput'] && this.$refs['createInput'].focus()
    this.$refs['createInput'] && this.$refs['createInput'].select()
  }
}
</script>
