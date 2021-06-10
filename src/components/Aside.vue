<template>
  <aside class="nas-aside">
    <div class="nas-user">
      <a
        class="nas-user__avatar"
        @mouseover="() => showUserPanel(true)"
        @mouseout="showUserPanel(false)"
      >
        <img :src="curUser.portrait_url || defaultAvatar" alt="avatar" @click="!hasLogin ? handleLogin() : null" />
        <user-panel :visible="userPanelVisible && hasLogin"></user-panel>
      </a>
      <div class="nas-user__nickname">
        {{ curUser.nick_name }}
      </div>
      <div class="nas-user__vip" v-if="hasLogin">
        <a
          class="vip-icon"
          href="paycenter"
          target="_blank"
        >
          <VipIcon :vipData="vipData" />
        </a>
        <a
          class="nas-user__vip-link"
          target="_blank"
          href="paycenter"
          @click="handleRecharge"
        >
          {{ vipData.isVip ? '续费会员' : '开通会员' }}
        </a>
      </div>
      <div v-else>
        <a @click="handleLogin" class="nas-user__login">登录</a>
      </div>
    </div>
    <div class="nas-task">
      <a
        class="nas-task__action"
        @click="hasLogin ? handleAddTask() : handleLogin()"
      >
        <i class="iconfont icon-plus" />
        新建任务
      </a>
      <div class="nas-task__menu">
        <a
          :class="tabId === 'ing' && 'active'"
          @click="() => handleTabChange('ing')"
        >
          <i class="iconfont icon-ing" />下载中
        </a>
        <a
          :class="tabId === 'done' && 'active'"
          @click="() => handleTabChange('done')"
        >
          <i class="iconfont icon-done" />已完成
        </a>
        <a
          v-if="showFileTab"
          :class="tabId === 'file' && 'active'"
          @click="() => handleTabChange('file')"
        >
          <i class="iconfont icon-folder" />网盘文件
        </a>
        <a
          v-if="showFileTab"
          :class="tabId === 'devicefile' && 'active'"
          @click="() => handleTabChange('devicefile')"
        >
          <i class="iconfont icon-folder" />设备文件
        </a>
      </div>
    </div>
    <div class="nas-tool">
      <a @click="handleSetSpeed">
        设置
      </a>
      <a @click="handleFeedbackShow" style="margin-top:6px">
        反馈
      </a>
      <div
        :class="`client-version ${userInfo.client_version ? 'visible' : 'hidden'}`"
        :title="userInfo.build_version +' '+(userInfo.is_connected ? '已经连接' : '已经断开')"
        @click="aboutVisible = true"
      >
        V{{ userInfo.client_version }}
        <i :class="`${userInfo.is_connected ? 'el-icon-success' : 'el-icon-error'}`"></i>
        <i :class="`${userInfo.download_running? 'el-icon-s-data' : ''}`"></i>
      </div>
      <el-dialog
        title="限制最大下载速度"
        :visible="visible"
        width="680px"
        destroy-on-close
        class="nas-speed-dialog"
        :show-close="false"
        :close-on-click-modal="false"
        @close="handleClose"
      >
        <div class="speed-dialog__content">
          <div class="speed-dialog__slider">
            <el-slider
              style="flex: 1;"
              v-model="sliderValue"
              :marks="marks"
              :format-tooltip="formatTooltip"
            >
            </el-slider>
            <div class="slider-text">
              <!-- <el-input
                v-model="speed"
                placeholder="速度"
                @input="handleSpeedChange"
              ></el-input> -->
              <em v-if="speed>0">{{ speed }}KB/s</em>
              <em v-if="speed<0">不限</em>
            </div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="visible = false">取 消</el-button>
          <el-button type="primary" @click="handleSpeedSubmit">确 定</el-button>
        </div>
      </el-dialog>
      <about-dialog :visible="aboutVisible" @close="handleAboutClose" />
    </div>
  </aside>
</template>

<script>
import { defineComponent } from 'vue'
import defaultAvatar from "../assets/avatar.jpg";
import VipIcon from "./VipIcon.vue";
import UserPanel from "./UserPanel.vue";
import AboutDialog from "./AboutDialog.vue";
var speedRange=[
  {
    percent: 0,
    min: 0,max:60,
  },
  {
    percent: 16,
    min: 60,max:500,
  },
  {
    percent: 32,
    min: 500,max:1024,
  },
  {
    percent: 48,
    min: 1024,max:5*1024,
  },
  {
    percent: 64,
    min: 5*1024,max: 50*1024,
  },
  {
    percent: 80,
    min: 50*1024,max: 100*1024,
  },
  {
    percent: 100,
    min: 100*1024, max: 150*1024,
  }
]
export default defineComponent({
  components: {
    VipIcon,
    UserPanel,
    AboutDialog
  },
  data() {
    return {
      defaultAvatar,
      userPanelVisible: false,
      aboutVisible: false,
      visible: false,
      sliderValue: 100,
      marks: {
        0: "60KB",
        16: "500KB",
        32: "1MB",
        48: "5MB",
        64: "50MB",
        80: "100MB",
        100: "全速"
      },
      speed: -1
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo;
    },
    curUser() {
      return this.$store.state.user.curUser;
    },
    vipData() {
      return this.curUser.vipData || {};
    },
    hasLogin() {
      return this.curUser.userId !== "0";
    },
    userDeviceConfig () {
      return this.$store.state.drive.userDeviceConfig
    },
    showFileTab () {
      return this.$store.state.drive.privilege
    },
    tabId () {
      return this.$store.state.drive.currentTabId;
    }
  },
  watch: {},
  async mounted() {},
  methods: {
    stat(action, data) {
      this.$stat('remote_control_pc', action, data)
    },
    handleLogin() {
      this.$emit("login");
    },
    showUserPanel(visible) {
      this.userPanelVisible = visible;
    },
    handleAddTask() {
      this.$emit("add-task");
    },
    handleTabChange(id) {
      this.$emit("change-tab", id);
    },
    handleRecharge() {
      this.stat('vip_recharge_btn_click', {
        type: this.vipData && this.vipData.isVip ? 'xufei' : 'new'
      })
    },
    async handleSetSpeed() {
      await this.$store.dispatch('drive/getDeviceConfig')
      this.visible = true;
      this.convertSpeedPercent(this.userDeviceConfig.speed_limit || -1)
    },
    convertSpeedPercent (val) {
      if (val === -1) {
        this.sliderValue = 100
      }
      var value=val/1024;


      var base = 0
      if(value<0){
        this.sliderValue = 100
        return;
      }
      for(var i=0; i<speedRange.length; i++){
        let r=speedRange[i]
        if(value>r.min && value<=r.max){
          if(r.min==r.max){
            return r.percent;
          }
          this.sliderValue=(r.percent-base)*((value-r.min)/(r.max-r.min))+base;
          return
        }
        base=r.percent;
      }
      this.sliderValue=100
    },
    handleClose() {
      this.visible = false;
    },
    async handleSpeedSubmit() {
      let speed = this.speed * 1024;
      if(speed<0){
        speed=-1
      }
      const result = await this.$store.dispatch("drive/setDeviceConfig", {
        speed_limit: speed
      });

      this.$message({
        type: 'success',
        message: '设置成功'
      })

      this.stat('speed_reset_success')

      this.visible = false;
    },
    formatTooltip(value) {
      let currentValue = 60
      let valueText = `${currentValue}KB`

      if (value === 0) {
        currentValue = 60
      }
      if (value === 100) {
        currentValue = -1
        this.speed=-1
        valueText="不限"
        return valueText
      }
      var base=0;
      for(var i in speedRange) {
        var r= speedRange[i]
        var step = r.percent-base
        if(value>base && value<=r.percent) {
          if(r.max==r.min){
            currentValue = r.max
          }else{
            currentValue=parseInt(((r.max-r.min) / (step)) * (value - base) + r.min, 10)
          }
          break;
        }
        base=r.percent;
      }

      valueText = `${currentValue}KB`
      this.speed = currentValue
      return valueText;
    },
    // handleSpeedChange (value) {
    //   if (value > 51200 || value < 60) {
    //     this.$message({
    //       type: 'warning',
    //       message: '数值应在60到51200之间'
    //     })
    //     return
    //   }

    //   // todo 可以支持手动输入数值
    //   if (value === 60) {
    //     this.sliderValue = 0
    //   }

    //   if (value === 500) {
    //     this.sliderValue = 25
    //   }

    //   if (value === 1024) {
    //     this.sliderValue = 50
    //   }

    //   if (value === 5120) {
    //     this.sliderValue = 75
    //   }

    //   if (value === 51200) {
    //     this.sliderValue = 100
    //   }
    // },
    handleAboutClose() {
      this.aboutVisible = false
    },
    handleFeedbackShow () {
      this.$store.commit('drive/update', {
        'feedbackVisible': true
      })
    }
  }
});
</script>

<style lang="scss">
.nas-aside {
  position: relative;
  width: 200px;
  min-width: 120px;
  flex-shrink: 0;
  background: linear-gradient(
    to bottom,
    var(--main-color-dark),
    var(--main-color)
  );
}

.nas-user {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: 30px;

  &__avatar {
    display: flex;
    justify-content: center;
    width: 100%;
    position: relative;
    cursor: pointer;

    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
    }
  }

  &__nickname {
    width: 100%;
    padding: 0 12px;
    margin-top: 10px;
    font-size: 16px;
    color: #fdf592;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
    overflow: hidden;
  }

  &__vip {
    &-link {
      display: inline-block;
      height: 24px;
      padding: 0 6px;
      margin-top: 8px;
      line-height: 24px;
      font-size: 12px;
      color: #ee2a1a;
      text-align: center;
      border-radius: 4px;
      background: #ffecbf;
      cursor: pointer;
    }

    .vip-icon {
      display: block;
    }
  }

  &__login {
    padding: 4px 30px;
    font-size: 12px;
    color: #fff;
    border: 1px solid #c2d7ff;
    border-radius: 4px;
    cursor: pointer;
  }
}

.nas-task {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 34px;

  &__action {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 152px;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
    text-align: center;
    color: #308bfd;
    background: #f6f8fc;
    border: 1px solid #eeeeee;
    border-radius: 2px;
    cursor: pointer;

    i {
      padding-right: 6px;
      font-size: 13px;
    }
  }

  &__menu {
    flex: 1;
    width: 100%;
    margin-top: 24px;

    a {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 12px 20px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;

      &.active {
        color: rgba(255, 255, 255, 1);
        background: rgba(255, 255, 255, 0.2);
      }
    }

    i {
      font-size: 16px;
      margin-right: 6px;
    }
  }
}

.nas-tool {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;

  .client-version {
    padding-top: 10px;
    font-size: 12px;
    color: rgba(255,255,255,.6);
    visibility: hidden;
    cursor: pointer;

    &.visible {
      visibility: visible;
    }
  }

  a {
    display: inline-block;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 2px 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
}

.speed-dialog__content {
  padding: 0 20px 20px 20px;

  .el-slider__marks-text {
    &:last-of-type {
      width: 48px;
    }
  }
}

.speed-dialog__slider {
  display: flex;

  .slider-text {
    display: flex;
    width: 120px;
    margin-left: 36px;
    justify-content: center;
    align-items: center;

    em {
      width: 80px;
    }
  }
}
</style>
