<template>
  <li class="task-item">
    <div class="task-item__main">
      <div class="task-item__container">
        <div class="task-item__content">
          <div class="task-item__icon">
            <img :src="iconLink" alt="图标" />
          </div>
          <div class="task-item__info">
            <div class="task-item__name" :title="taskName">
              {{ taskName }}
            </div>
            <div
              class="task-item__desc"
              v-if="task.phase === 'PHASE_TYPE_ERROR'"
            >
              <span
                class="task-item__status task-item__status-error"
                v-html="phaseTxt"
              />
            </div>
            <div class="task-item__desc" v-else>
              <span
                v-if="
                  task.phase === 'PHASE_TYPE_RUNNING' ||
                    task.phase === 'PHASE_TYPE_PENDING'
                "
                class="task-item__size"
              >
                {{
                  formatSize(
                    (task.file_size * (task.progress || 0)) / 100 || 0
                  )
                }}/{{ formatSize(task.file_size || 0) }}
              </span>
              <span v-else class="task-item__size">
                {{ formatSize(task.file_size || 0) }}
              </span>
              <span class="task-item__date"> {{ taskDate }}</span>
              <i class="task-item__date   el-icon-s-data" title="已经抱团"
                v-if="vipTeamJoined"
              ></i>
              <span
                :class="`task-item__status ${vipSpeed && 'status-isvip'}`"
                v-html="phaseTxt"
              ></span>
            </div>
            <div
              class="task-item__speed"
              v-if="hasSpeed"
            >
              <el-progress
                :percentage="task.progress"
                :stroke-width="4"
                :show-text="false"
              />
            </div>
          </div>
        </div>
        <div class="task-item__action">
          <a
            class="non-vip-icon"
            v-if="
              !vipData.isVip &&
                (task.phase === 'PHASE_TYPE_RUNNING' ||
                  task.phase === 'PHASE_TYPE_PENDING')
            "
            href="paycenter"
            target="_blank"
            @click="handleSpeedUp"
          >
            <i class="iconfont icon-lightning" />
            <span>超级加速</span>
          </a>
          <i
            class="iconfont icon-pause"
            v-if="pauseIconVisible"
            @click="pause(task)"
          />
          <i
            class="iconfont icon-down"
            @click="download(task)"
            v-if="downloadIconVisible"
          />
          <i
            class="iconfont icon-loading"
            v-if="
              (task.phase === 'PHASE_TYPE_RUNNING' ||
                task.phase === 'PHASE_TYPE_PENDING' ||
                task.phase === 'PHASE_TYPE_PAUSED') &&
                actionLoading &&
                actionSpecStatus !== 'delete'
            "
          />
          <i
            :class="`iconfont icon-refresh ${refreshFlag && 'active'}`"
            @click="refresh(task)"
            v-if="task.phase === 'PHASE_TYPE_ERROR'"
          />
          <i
            class="iconfont icon-cross"
            @click="remove(task)"
            v-if="actionSpecStatus !== 'delete'"
          />
          <i class="iconfont icon-loading icon-loading-delete" v-else />
        </div>
      </div>
    </div>
  </li>
</template>
<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import { formatSize } from "../utils/util";
import { taskPhaseCode } from "../utils/code-res";
import staticIcons from "../utils/static-icons";
import { parseTime } from "../utils/filters";

export default defineComponent({
  props: {
    tid: {
      type: String,
      default: ""
    }
  },
  emits: ['delete'],
  data() {
    return {
      refreshFlag: false,
      loading: false
    };
  },
  computed: {
    ...mapState('drive', ['all']),
    task () {
      return this.all[this.tid]
    },
    taskName () {
      return this.task.file_name || this.task.name || this.task.id
    },
    curUser() {
      return this.$store.state.user.curUser;
    },
    vipData() {
      return this.curUser.vipData || {};
    },
    actionSpecStatus() {
      if (this.task.params && this.task.params.spec) {
        try {
          const specStatus = JSON.parse(this.task.params.spec);
          return specStatus.phase;
        } catch (e) {
          return "";
        }
      }
      return "";
    },
    actionStatus() {
      if (this.task.params && this.task.params.status) {
        try {
          const phaseStatus = JSON.parse(this.task.params.status);
          return phaseStatus.phase;
        } catch (e) {
          return "";
        }
      }
      return "";
    },
    actionLoading() {
      const case1 =
        this.actionStatus !== "" &&
        this.actionSpecStatus !== "" &&
        this.actionSpecStatus !== this.actionStatus;
      const case2 =
        (this.task.phase === "PHASE_TYPE_RUNNING" ||
          this.task.phase === "PHASE_TYPE_PENDING" ||
          this.task.phase === "PHASE_TYPE_PAUSED") &&
        this.actionStatus === "" &&
        (this.actionSpecStatus === "pause" ||
          this.actionSpecStatus === "running");
      const case3 = this.actionSpecStatus === "delete";
      return case1 || case2 || case3;
    },
    vipTeamJoined() {
      return (
        this.task.phase === "PHASE_TYPE_RUNNING" &&
        this.task.params.team_isjoined=== "true"
      )
    },
    vipSpeed() {
      return (
        this.actionStatus !== "pause" &&
        this.task.phase === "PHASE_TYPE_RUNNING" &&
        this.vipData.isVip &&
        !this.actionLoading && (+this.task.params.speedup_count > 0)
      );
    },
    pauseIconVisible() {
      const iconVisible =
        (this.task.phase === "PHASE_TYPE_PENDING" ||
          this.task.phase === "PHASE_TYPE_RUNNING") &&
        this.actionStatus !== "pause" &&
        !this.actionLoading;
      return iconVisible;
    },
    downloadIconVisible() {
      const iconVisible =
        (this.task.phase === "PHASE_TYPE_PENDING" ||
          this.task.phase === "PHASE_TYPE_RUNNING" ||
          this.task.phase === "PHASE_TYPE_PAUSED") &&
        this.actionStatus === "pause" &&
        !this.actionLoading;
      return iconVisible;
    },
    phaseTxt() {
      // 优先级最高
      if (this.actionSpecStatus === "delete") {
        return `<i>删除中</i>`;
      }

      if (this.task.phase === "PHASE_TYPE_ERROR") {
        let msg = this.task.message;
        if (this.task.params && this.task.params.error) {
          msg = `${msg}【${this.task.params.error}】`;
        }

        return msg;
      }

      if (this.task.phase === "PHASE_TYPE_COMPLETE") {
        let msg = taskPhaseCode[this.task.phase];
        if (this.task.params && this.task.params.error) {
          msg = `${msg} [${this.task.params.error}]`;
        }
        return msg;
      }

      if (this.actionStatus !== this.actionSpecStatus) {
        if (this.actionSpecStatus === "pause") {
          return "暂停中";
        }

        if (this.actionSpecStatus === "running") {
          return "启动中";
        }
      }

      if (this.task.phase === 'PHASE_TYPE_PAUSED') {
        return taskPhaseCode[this.task.phase];
      }

      if (this.task.phase === "PHASE_TYPE_RUNNING") {
        // 如果updated_time大于15分钟，则不显示下载速度
        const currentTime = new Date().getTime();
        const updatedTime = new Date(this.task.updated_time).getTime();
        const span = (currentTime - updatedTime) / 1000;
        if (span > 15 * 60) {
          return "--";
        }
        var speedup_speed = "(+0KB/s)"
        if(this.task.params && this.task.params["speedup_speed"] !== undefined){
          var new_speed=this.formatSize(this.task.params["speedup_speed"]);
          if(new_speed !== 0 ){
            speedup_speed = "(+"+new_speed+"/s)";
          }
        }
        if(!this.vipData.isVip || this.task.type !=="user#download-url"){
          speedup_speed=""
        }

        if (this.task.params && this.task.params["speed"] !== undefined) {
          const speed = this.formatSize(this.task.params["speed"]);
          return speed === 0 ? (`${speed}KB/s`+speedup_speed) : (`${speed}/s`+speedup_speed);
        } else {
          return `0KB/s`;
        }
      }

      return taskPhaseCode[this.task.phase];
    },
    hasSpeed () {
      return this.task.phase === 'PHASE_TYPE_RUNNING' ||
        this.task.phase === 'PHASE_TYPE_PENDING' ||
        this.task.phase === 'PHASE_TYPE_PAUSED'
    },
    iconLink () {
      return this.task.thumbnail_link || this.task.icon_link || staticIcons.other;
    },
    taskDate () {
      return parseTime(this.task.created_time, "{y}-{m}-{d} {h}:{i}")
    }
  },
  methods: {
    formatSize,
    stat(action, data) {
      this.$stat("remote_control_pc", action, data);
    },
    remove(task) {
      this.$emit("delete", task);
    },
    async pause(task) {
      try {
        const params = {
          id: task.id,
          space: task.space,
          type: task.type,
          action: "pause"
        };
        await this.$store.dispatch("drive/operateTask", params);
        this.$message({
          type: "success",
          message: "操作成功"
        });
        this.stat("downloading_pause_btn_click", {
          result: "success"
        });
      } catch (e) {
        this.$message({
          type: "error",
          message: "暂停失败"
        });
        this.stat("downloading_pause_btn_click", {
          result: "fail"
        });
      }
    },
    async download(task) {
      const params = {
        id: task.id,
        space: task.space,
        type: task.type,
        action: "running"
      };

      try {
        await this.$store.dispatch("drive/operateTask", params);
        this.$message({
          type: "success",
          message: "操作成功"
        });

        this.stat("downloading_start_btn_click", {
          result: "success"
        });
      } catch (e) {
        this.$message({
          type: "error",
          message: "开启下载失败"
        });

        this.stat("downloading_start_btn_click", {
          result: "fail"
        });
      }
    },
    async refresh(task) {
      this.$confirm("确定要重新下载文件吗？", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        closeOnClickModal: false
      })
        .then(async () => {
          try {
            // delete before recreating
            const delParams = {
              ids: [task.id],
              space: task.space
            };

            const res = await this.$store.dispatch(
              "drive/deleteTasks",
              delParams
            );

            this.refreshFlag = true;
            if (task.params && task.params.url) {
              const urls = [task.params.url];
              const resource = [
                {
                  name: task.name,
                  file_size: task.file_size,
                  file_name: task.file_name,
                  file_count: task.params.sub_file_count || "1"
                }
              ];

              this.$parent.refresh(urls, resource, "refresh");
            }

            // animation
            setTimeout(() => {
              this.refreshFlag = false;
            }, 2000);
          } catch (e) {
            this.$message({
              type: "error",
              message: "操作失败"
            });
          }
        })
        .catch(() => {});
    },
    handleSpeedUp() {
      this.stat("vip_accelerate_btn_click");
    }
  }
});
</script>

<style lang="scss">
.task-item {
  list-style: none;

  &__container {
    display: flex;
    align-items: center;
    padding: 16px 12px;
    margin: 10px;
    background: #fff;
    border: 1px solid #fff;
    transition: all 0.2s ease-in;
    box-sizing: border-box;

    &:hover {
      border: 1px solid #b0cdff;
    }
  }

  &__icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;

    img {
      width: 100%;
    }
  }

  &__content {
    display: flex;
    flex: 3;
  }

  &__info {
    flex: 1;
    flex-shrink: 0;
    margin: 0 12px;
  }

  &__name {
    margin-bottom: 6px;
    font-size: 13px;
    color: #1a1a1a;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }

  &__desc {
    display: flex;
    height: 18px;
    margin-bottom: 2px;
    line-height: 18px;
  }

  &__size,
  &__date,
  &__status {
    font-size: 11px;
    color: #b3b3b3;
    vertical-align: middle;
    box-sizing: border-box;

    i {
      padding-left: 24px;
      font-size: 11px;
      color: #b3b3b3;
    }
  }

  &__size {
    min-width: 100px;
  }

  &__date {
    width: 116px;
  }

  &__status-error {
    color: #e66056;
  }

  &__status {
    flex: 1;
    text-align: right;

    &.status-isvip {
      color: #e7bc77;
    }
  }

  &__speed {
    .el-progress-bar__inner {
      border-radius: 0;
      background: linear-gradient(to right, #3f85ff, #3f85ff 90%, #00ccff);
    }
  }

  &__action {
    flex: 1;
    padding: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
    margin-right: 12px;

    i {
      color: #6a707c;
      font-size: 16px;
      cursor: pointer;

      &.icon-cross {
        margin-left: 16px;
      }

      &.iconfont {
        font-size: 16px;
        padding: 8px;
      }

      &.icon-refresh.active {
        animation: load 1.1s linear 1s;
      }

      &.icon-lightning {
        padding: 0;
        color: #dda060;
        margin-right: 2px;
      }

      &.icon-loading {
        animation: load 1.5s linear 0s infinite;

        &-delete {
          margin-left: 16px;
        }
      }
    }

    .non-vip-icon {
      display: flex;
      width: 86px;
      justify-content: center;
      align-items: center;
      margin-right: 10px;
      font-size: 12px;
      color: #462609;
      height: 24px;
      line-height: 24px;
      padding: 0 8px;
      border-radius: 2px;
      background-image: linear-gradient(90deg, #ffe5ae 2%, #ffeaa0 100%);
      border-radius: 4px;
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
