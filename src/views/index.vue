<template>
  <el-container>
    <div>
      <LoginDialog
        :visible="loginVisible"
        @close="handleLoginClose"
        @login-success="handleLoginSuccess"
      />
      <TaskDialog
        :visible="taskDialogVisible"
        @close="handleTaskClose"
        @submit="handleParseTaskSubmit"
      />
      <TaskInfoDialog
        :visible="taskInfoDialogVisible"
        :urls="taskAddUrls"
        @close="handleTaskInfoClose"
        @submit="handleAddTaskSubmit"
      />
    </div>
    <div class="nas-page">
      <Aside
        @login="login"
        @change-tab="handleTabChange"
        @add-task="handleAddTask"
      />
      <div class="nas-content">
        <SvipTip v-if="svipTipVisible" />
        <TaskList
          v-if="tabId === 'ing' || tabId === 'done'"
          :title="tabId === 'ing' ? '下载中' : '已完成'"
          :phase="tabId"
          @add-url="handleAddTaskSubmit"
          @delete-success="handleTaskDeleteSuccess"
        />
        <FileList
          v-if="tabId === 'file' || tabId === 'devicefile'"
          :title="fileListTitle(tabId === 'file' ? '网盘文件' : '设备文件')"
          :phase="tabId"
          @open="openfile"
        />
      </div>
    </div>
    <DeviceExcessDialog
      :visible="deviceExcessVisible"
      :loading="logoutLoading"
      :text="deviceExcessText"
      @logout="logout"
      @close="handleDeviceDialogClose"
    />
    <TaskExcessDialog
      :visible="taskExcessVisible"
      @close="handleTaskDialogClose"
    />
    <UpdateDialog
      :visible="updateVisible"
      :text="updateText"
      @close="handleUpdateDialogClose"
    />
    <FeedbackDiglog
      :visible="feedbackVisible"
      @close="handleFeedbackClose"
    />
    <FileTreeDialog
      :visible="treeDataVisible"
      type="2"
    />
    <SvipTipBaotuan :visible="baotuanVisible" />
  </el-container>
</template>

<script>
import { defineComponent } from "vue"
import { mapState } from "vuex";
import Loading from "@/components/Loading.vue";
import Aside from "@/components/Aside.vue";
import TaskList from "@/components/TaskList.vue";
import FileList from "@/components/FileList.vue";
import LoginDialog from "@/components/LoginDialog.vue";
import TaskDialog from "@/components/TaskDialog.vue";
import TaskInfoDialog from "@/components/TaskInfoDialog.vue";
import UpdateDialog from "@/components/UpdateDialog.vue";
import DeviceExcessDialog from "@/components/DeviceExcessDialog.vue";
import TaskExcessDialog from "@/components/TaskExcessDialog.vue";
import FeedbackDiglog from "@/components/FeedbackDialog.vue";
import FileTreeDialog from "@/components/FileTreeDialog.vue";
import SvipTip from "@/components/SvipTip.vue";
import SvipTipBaotuan from "@/components/SvipTipBaotuan.vue"
import { driveFetch } from "@/api";

function task_param(task, name) {
  if (!task.params) {
    return "";
  }

  if (!task.params[name]) {
    return "";
  }
  return task.params[name];
}

export default defineComponent({
  components: {
    Aside,
    TaskList,
    FileList,
    LoginDialog,
    TaskDialog,
    TaskInfoDialog,
    DeviceExcessDialog,
    TaskExcessDialog,
    UpdateDialog,
    Loading,
    FeedbackDiglog,
    FileTreeDialog,
    SvipTip,
    SvipTipBaotuan
  },
  data() {
    return {
      runners: [],
      playerRunners: [],
      downloadRunners: [],
      tasks: [],
      openFiles: {},
      loginVisible: false,
      taskDialogVisible: false,
      taskInfoDialogVisible: false,
      deviceExcessVisible: false,
      deviceExcessText:"",
      taskExcessVisible: false,
      updateVisible: false,
      updateText: "",
      isLoading: false,
      checkTasksTimer: null,
      loginTimer: null,
      loginInRequest: false,
      qrCodeUrl: "",
      taskAddUrls: [],
      logoutLoading: false,
    };
  },
  computed: {
    ...mapState('drive', [
      'taskExpiresIn',
      'feedbackVisible',
      'treeDataVisible',
      'files',
      'svipTipVisible',
      'baotuanVisible'
    ]),
    ...mapState('user', ['userInfo', 'curUser']),
    tabId () {
      return this.$store.state.drive.currentTabId;
    },
    space() {
      return this.files.space;
    },
    parent_id() {
      console.log("get parentid",this.$store.state.drive.files)
      return this.files.parentId;
    },
    hasMore() {
      return this.files.hasMore;
    },
    hasLogin() {
      return this.curUser.userId !== "0";
    },
    target() {
      return this.userInfo.target;
    },
    runnerStatus() {
      return this.userInfo.runner_status;
    },
    showFileTab() {
      return this.$store.state.drive.privilege;
    },
    lastUpdateTime() {
      return this.userInfo.last_update_time;
    },
  },
  watch: {
    runnerStatus(val) {
      if (val.status === "permission_denied") {
        // 插件升级
        this.updateVisible = true;
        this.updateText = val.message;
      } else if (val.status === "task_run_nums_limit" && this.hasLogin) {
        // 绑定设备超限
        this.deviceExcessVisible = true;
        this.deviceExcessText = val.message;
        this.stat('bind_device_num_over_limit')
      }
    },
    curUser(newUser, oldUser) {
      if (newUser.userId !== oldUser.userId) {
        this.refreshPageData()
      }
    },
    lastUpdateTime(newTime, oldTime) {
      if (newTime !== oldTime) {
        this.$store.commit('drive/update', {
          taskExpiresIn: 1
        })
        this.checkTasks()
      }
    }
  },
  async mounted() {
    this.initPage();
  },
  beforeDestroy() {
    this.clearTaskTimers();
    this.clearLoginTimers();
  },
  methods: {
    stat(action, data) {
      this.$stat('remote_control_pc', action, data)
    },
    async initPage() {
      // initial login checking
      this.checkLogin(
        () => {
          this.stat('xunlei_suite_homepage_show', {
            is_login: 1
          })
          this.$store.dispatch("drive/fetchPrivilege");
          this.refreshPageData();
        },
        () => {
          // 打开套件时，没有登录弹窗引导用户手机扫码登录, 且套件不需要升级提示
          if (this.runnerStatus.status !== 'permission_denied') {
            this.loginVisible = true;
          }

          this.stat('xunlei_suite_homepage_show', {
            is_login: 0
          })
        }
      );
    },
    async checkLogin(onSuccess = () => {}, onFailure = () => {}) {
      this.clearLoginTimers();
      if (this.loginInRequest) {
        return;
      }
      this.loginInRequest = true;
      try {
        const userInfo = await this.$store.dispatch("user/watchUserInfo");
        if (userInfo && userInfo.user && userInfo.user.id) {
          onSuccess();
        } else {
          onFailure();
        }

        this.loginInRequest = false;

        this.loginTimer = setTimeout(async () => {
          this.checkLogin();
        }, 5000);

        return userInfo
      } catch (e) {
        this.loginInRequest = false;
      }
    },
    getParentId(){
      return this.$store.state.drive.files.parentId;
    },
    fileListTitle(title){
      var parentId=this.$store.state.drive.files.parentId;
      var file=this.openFiles[parentId]
      if(file){
        return file.name;
      }
      return title;
    },
    async getFile(params) {
      return await this.$store
        .dispatch("drive/fetchFile", {
          ...params
        })
    },
    getFiles(params) {
      if(params.loading){
        this.isLoading = true;
      }
      return this.$store
        .dispatch("drive/fetchFiles", {
          ...params
        })
        .then(res => {
          this.isLoading = false;
          return res
        })
        .catch(err => {
          console.log("error",err)
          if(err.error==="unauthenticated"){
            console.log("error",err)
            return
          }
          this.$message.error('请求失败:'+err);
          this.isLoading = false;
        });
    },
    getTasks(params) {
      if(params.loading){
        this.isLoading = true;
      }
      return this.$store
        .dispatch("drive/fetchTasks", {
          ...params
        })
        .then(res => {
          this.isLoading = false;
          return res
        })
        .catch(err => {
          if(err.error==="unauthenticated"){
            console.log("error",err)
            return
          }
          // TODO: 先临时关闭
          // this.$message.error('发生了错误'+err);
          console.error('发生了错误: ' + err);
          this.isLoading = false;
        });
    },
    checkTasks() {
      const m = this.taskExpiresIn || 30;
      this.clearTaskTimers();

      this.checkTasksTimer = setTimeout(() => {
        if (this.tabId !== "ing" && this.tabId !== "done") {
          return
        }
        this.getTasks({
          phase: this.tabId,
          refresh: true,
          phaseCheck: true,
          loading: false,
          limit: 30,
        }).then(rest => {
          this.checkTasks();
        });
      }, m * 1000);
    },
    clearTaskTimers() {
      if (this.checkTasksTimer) {
        clearTimeout(this.checkTasksTimer);
        this.checkTasksTimer = null;
      }
    },
    clearLoginTimers() {
      if (this.loginTimer) {
        clearTimeout(this.loginTimer);
        this.loginTimer = null;
      }
    },
    login() {
      this.loginVisible = true;
    },
    handleLoginSuccess() {
      this.$store.commit('drive/setCurrentTabId', 'ing');
      this.loginVisible = false;
      this.refreshPageData();
      this.checkLogin();
    },
    refreshPageData() {
      this.$store.dispatch("drive/fetchPrivilege");
      if (this.tabId === "ing" || this.tabId === "done") {
        this.getTasks({ phase: this.tabId, refresh: true,loading:true });
        this.checkTasks();
      } else {
        let space = ""
        if(this.tabId === "devicefile"){
          space = this.userInfo.target
        }
        this.openFiles = {}
        this.getFiles({ space:space,parent_id:"", refresh: true,loading:true });
        this.clearTaskTimers();
      }
    },
    async logout() {
      try {
        this.logoutLoading = true
        await this.$store.dispatch("user/logout");
        this.deviceExcessVisible = false;
        this.logoutLoading = false
        this.clearLoginTimers();
        this.clearTaskTimers();
      } catch (e) {
        this.logoutLoading = false
        this.$message({
          type: "error",
          message: e.error_description || "操作失败"
        });
      }
    },
    handleTabChange(id) {
      this.$store.commit('drive/setCurrentTabId', id)
      if (!this.hasLogin) {
        return;
      }

      this.refreshPageData();
    },
    handleLoginClose() {
      this.loginVisible = false;
    },
    handleTaskClose() {
      this.taskDialogVisible = false;
    },
    handleTaskInfoClose() {
      this.taskInfoDialogVisible = false;
    },
    handleUpdateDialogClose() {
      this.updateVisible = false;
    },
    handleDeviceDialogClose() {
      this.deviceExcessVisible = false;
    },
    handleTaskDialogClose() {
      this.taskExcessVisible = false;
    },
    async handleTaskDeleteSuccess() {
      await this.getTasks({ phase: this.tabId, refresh: true });
      // check immediately
      this.$store.commit('drive/update', {
        taskExpiresIn: 1
      })
      this.checkTasks()
    },
    async handleAddTask() {
      await this.$store.dispatch("drive/getDeviceConfig");
      this.taskDialogVisible = true;
    },
    handleParseTaskSubmit(urls) {
      this.taskAddUrls = urls
      this.taskDialogVisible = false
      this.taskInfoDialogVisible = true
    },
    async handleAddTaskSubmit(urls, resources = [], type) {
      try {
        const allPromise = [];
        for (let index = 0; index < urls.length; index++) {
          allPromise.push(
            this.$store.dispatch("drive/addUrlTask", {
              type: "user#download-url",
              target: this.target,
              file: {
                url: urls[index],
                name: resources[index] && resources[index].name
                    ? resources[index].name
                    : "",
                file_name:
                  resources[index] && resources[index].file_name
                    ? resources[index].file_name
                    : "",
                file_size:
                  resources[index] && resources[index].file_size
                    ? resources[index].file_size
                    : "0",
                file_count: resources[index] && resources[index].file_count
                    ? resources[index].file_count
                    : "1",
              }
            })
          );
        }

        const fileData = await Promise.all(allPromise);

        const successUrls = [];
        let excessFlag = false;
        for (let fileRes of fileData) {
          if (fileRes.task) {
            successUrls.push(fileRes);
          } else if (fileRes.error === "task_daily_create_limit") {
            excessFlag = true;
            break;
          }
        }

        this.taskDialogVisible = false;
        this.taskInfoDialogVisible = false;

        if (excessFlag) {
          this.taskExcessVisible = true;
          this.stat('over_limit_tasknum_pop_show')
          return;
        }

        this.$nextTick(async () => {
          this.$store.commit('drive/setCurrentTabId', 'ing');
          await this.getTasks({ phase: this.tabId, refresh: true });
          // check immediately
          this.$store.commit('drive/update', {
            taskExpiresIn: 1
          })
          this.checkTasks()
        })

        this.$message({
          type: "success",
          message: "添加成功"
        });

        if (type !== 'new') {
          this.stat('downloading_refresh_btn_click', {
            result: 'success'
          })
        } else {
          this.stat('create_download_task', {
            result: 'success',
            taskid: (fileData[0] && fileData[0].task) ? fileData[0].task.id : '',
            url: urls[0],
            gcid: resources[0] && resources[0].meta ? (resources[0].meta.hash || '') : '',
            file_name: resources[0]
                    ? (resources[0].file_name || resources[0].name)
                    : "",
            file_suffix: resources[0] && resources[0].meta ? (resources[0].meta.mime_type || '') : '',
            file_size: resources[0]
                    ? (resources[0].file_size || '0')
                    : "0",
            cpeerid: ''
          })
        }
      } catch (e) {
        this.$message({
          type: "error",
          message: e.error_description || "添加失败"
        });

        if (e.error === "task_daily_create_limit") {
          this.taskDialogVisible = false;
          this.taskInfoDialogVisible = false;
          setTimeout(() => {
            this.taskExcessVisible = true;
            this.stat('over_limit_tasknum_pop_show')
          }, 500);
        }

        if (type !== 'new') {
          this.stat('downloading_refresh_btn_click', {
            result: 'fail'
          })
        } else {
          this.stat('create_download_task', {
            result: 'fail',
            errorcode: e,
            taskid: '',
            url: urls[0],
            gcid: resources[0] && resources[0].meta ? (resources[0].meta.hash || '') : '',
            file_name: resources[0]
                    ? (resources[0].file_name || resources[0].name)
                    : "",
            file_suffix: resources[0] && resources[0].meta ? (resources[0].meta.mime_type || '') : '',
            file_size: resources[0]
                    ? (resources[0].file_size || '0')
                    : "0",
            cpeerid: ''
          })
        }
      }
    },
    async refreshAll() {
      this.getFiles({});
      // this.getTasks();

      var runner = await driveFetch("/drive/v1/runner", "GET", null);
      if (runner.tasks && runner.tasks.length > 0) {
        var runners = [];
        for (var i in runner.tasks) {
          var task = runner.tasks[i];
          var d = new Date(task.updated_time).getTime();
          var since = new Date().getTime() - d;
          //15分钟内活跃的runner 才列出
          if (since < 900 * 1000) {
            runners.push(task);
          }
        }
        this.runners = runners;
        this.playerRunners = runners.filter(function(task) {
          return task_param(task, "access").indexOf("user#play") >= 0;
        });
        this.downloadRunners = runners.filter(function(task) {
          return task_param(task, "access").indexOf("user#download") >= 0;
        });
      }
    },
    async play(file, runner) {
      var data = await driveFetch("/drive/v1/task", "POST", {
        type: "user#play",
        name: file.name,
        file_name: file.name,
        file_size: file.size,
        params: {
          file_id: file.id,
          target: runner.params.target
        }
      });

      this.getTasks();
    },
    async download(file, runner) {
      var data = await driveFetch("/drive/v1/task", "POST", {
        type: "user#download",
        name: file.name,
        file_name: file.name,
        file_id: file.id,
        file_size: file.size,
        params: {
          file_id: file.id,
          target: runner.params.target
        }
      });
    },
    async openfile(file) {
      var space = ""
      if(this.tabId === "devicefile"){
        space = this.userInfo.target
      }
      if (!file) {
        var ofile=this.openFiles[this.getParentId()]
        var parent_id = ""
        if(ofile){
          parent_id=ofile.parent_id;
        }
        this.getFiles({space:space,parent_id:parent_id, refresh: true });
        return;
      }
      this.openFiles[file.id]=file

      if (file.kind != "drive#folder") {
        //TODO 只支持近场
        if(this.tabId !== "devicefile"){
          return
        }
        file=await this.getFile({id:file.id,space:file.space})
        console.log("open", file);
        if(file.web_content_link!="" ){
          window.open(file.web_content_link)
        }
        return;
      }
      this.getFiles({space:file.space, parent_id:file.id, refresh: true });
    },
    handleFeedbackClose () {
      this.$store.commit('drive/update', {
        'feedbackVisible': false
      })
    }
  }
})
</script>

<style lang="scss" src="@/assets/index.scss"></style>
<style lang="scss">
.nas-page {
  width: 100%;
  min-width: 960px;
  display: flex;
  height: 100vh;
}

.nas-content {
  flex: 1;
  background: #f4f7fa;
}
</style>