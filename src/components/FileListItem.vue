<template>
  <li class="nas-file-item">
    <div class="nas-file-item__main">
      <div class="nas-file-item__container" @click="$emit('open', file)">
        <div class="nas-file-item__checkbox">
          <el-checkbox v-model="checked"></el-checkbox>
        </div>
        <div class="nas-file-item__icon">
          <img :src="file | displayIcon" alt="图标">
        </div>
        <div class="nas-file-item__content">
          <div class="nas-file-item__name">
            {{ file.name }}
          </div>
        </div>
        <div class="nas-file-item__desc">
          <span v-if="file.size" class="nas-file-item__size">{{ formatSize(file.size) }}</span>
          <span class="nas-file-item__date">{{ file.modified_time | parseTime }}</span>
        </div>
      </div>
    </div>
  </li>
</template>
<script>
import { defineComponent } from 'vue'
import { formatSize } from '../utils/util'
import staticIcons from '../utils/static-icons'
import { parseTime } from '../utils/filters'

export default defineComponent({
  props: {
    file: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      checked: false,
    }
  },
  filters: {
    parseTime (time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },
    displayIcon (file) {
      return file.thumbnail_link || file.icon_link || staticIcons.other
    }
  },
  computed: {
  },
  methods: {
    formatSize,
    openfile (file) {
      console.log('打开文件',file)
    }
  }
})
</script>

<style lang="scss">
.nas-file-item {
  list-style: none;
  
  &__container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10PX 0 10PX 12PX;
    margin: 12PX;
    background: #fff;
    transition: all 0.5 ease-in;

    &:hover {
      background-color: #eff6fe;
    }
  }

  &__checkbox {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 6px;
    margin-right: 8px;
  }

  &__icon {
    width: 34PX;
    height: 34PX;
    flex-shrink: 0;
    background: #eee;

    img {
      width: 100%;
    }
  }

  &__content {
    flex: 1;
    flex-shrink: 0;
    margin: 0 12PX;
  }

  &__name {
    font-size: 13PX;
    color: #1A1A1A;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__desc {
    display: flex;
    height: 18PX;
    line-height: 18PX;
  }

  &__size, &__date, &__status  {
    font-size: 11PX;
    color: #B3B3B3;
    vertical-align: middle;
    box-sizing: border-box;
  }

  &__size {
    width: 64PX;
  }

  &__date  {
    width: 116PX;
  }

  &__status-error {
    color: #E66056;
  }

  &__action {
    width: 90PX;
    padding: 0;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    margin-right: 20PX;

    i {
      color: #6a707c;
      font-size: 16PX;
      cursor: pointer;

      &.icon-cross {
        margin-left: 20PX;
      }

      &.iconfont {
        font-size: 16PX;
        padding: 8PX;
      }

      &.icon-refresh.active {
        animation: load 1.1s 1 linear;
      }
    }
  }
}

@keyframes load {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
