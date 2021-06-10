<template>
  <div class="nas-user__panel-wrapper">
    <div class="nas-user__panel" v-show="visible">
      <a class="nas-user__logout" @click="logout" target="_blank">
        <i class="iconfont icon-poweroff" />
        退出登录
      </a>
      <div class="nas-user__avatar">
        <img :src="curUser.portrait_url || defaultAvatar" alt="avatar" />
      </div>
      <div class="nas-user__nickname">
        {{ curUser.nick_name }}
      </div>
      <div class="nas-user__vip" >
        <a
          class="vip-icon"
          href="paycenter"
          target="_blank"
        >
          <VipIcon :vipData="vipData" />
        </a>
        <a
          class="nas-user__vip-link"
          href="paycenter"
          target="_blank"
          @click="handleRecharge"
        >
          {{ vipData.isVip ? '续费会员' : '开通会员' }}
        </a>
        <div
          class="nas-user__vip-tip"
          v-if="vipData.isVip"
        >
          你的会员将于{{ vipData.expiresAt | parseTime }}到期
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { parseTime } from '../utils/filters'
import defaultAvatar from '../assets/avatar.jpg'
import VipIcon from './VipIcon.vue'

export default defineComponent({
  props: ['visible'],
  components: {
    VipIcon
  },
  data() {
    return {
      defaultAvatar
    }
  },
  computed: {
    curUser() {
      return this.$store.state.user.curUser
    },
    vipData() {
      return this.curUser.vipData || {}
    },
    hasLogin() {
      return this.curUser.userId !== '0'
    }
  },
  filters: {
    parseTime (time) {
      return parseTime(time, '{y}-{m}-{d}')
    }
  },
  async mounted() {},
  methods: {
    stat(action, data) {
      this.$stat('remote_control_pc', action, data)
    },
    handleRecharge() {
      this.stat('vip_recharge_btn_click', {
        type: this.vipData && this.vipData.isVip ? 'xufei' : 'new'
      })
    },
    async logout () {
      this.$store.dispatch('user/logout')
    }
  }
})
</script>

<style lang="scss">
.nas-user {
  a {
    text-decoration: none;
  }

  &__vip-tip {
    margin: 12PX 0 0 0;
    font-size: 12px;
    color: rgba(0,0,0,0.50);
  }

  &__panel {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    padding-top: 48PX;
    padding-bottom: 20PX;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    background: #fff;
    border-radius: 6PX;
    transition: all 1s ease;
    box-shadow: 0 0 10PX 0 rgba(26, 26, 26, 0.2);
    z-index: 999;
    cursor: default;

    .nas-user__nickname {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.85);
    }

    .nas-user__avatar {
      cursor: default;
    }

    &::after {
      display: block;
      content: '';
      position: absolute;
      top: 48PX;
      left: -6PX;
      width: 12PX;
      height: 12PX;
      margin: auto;
      background: #fff;
      box-sizing: border-box;
      transform: rotate(-45deg);
    }

    &-wrapper {
      position: absolute;
      left: 100%;
      width: 240PX;
      top: -30px;
    }

    .nas-user__vip-link {
      width: 220px;
      height: 34px;
      margin-top: 20px;
      line-height: 34px;
      font-size: 13px;
      color: #7D523A;
      background: #FCD68F;
      border-radius: 4px;
    }
  }

  &__logout {
    position: absolute;
    display: flex;
    align-items: center;
    top: 0;
    right: 0;
    padding: 12PX 16PX;
    font-size: 12px;
    color: rgba(0,0,0,0.25);
    cursor: pointer;

    i {
      margin-right: 4px;
    }
  }
}
</style>
