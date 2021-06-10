import { driveFetch } from "../api";
import staticIcons from "@/utils/static-icons.js";

const USER_DOWNLOAD_URL = "user#download-url";
const ING_PHASE = [
  "PHASE_TYPE_PENDING",
  "PHASE_TYPE_RUNNING",
  "PHASE_TYPE_PAUSED",
  "PHASE_TYPE_ERROR",
];
const DONE_PHASE = ["PHASE_TYPE_COMPLETE"];
const FILE_PAGE_LIMIT = 20;
const TASK_PAGE_LIMIT = 20;

export default {
  namespaced: true,
  modules: {},
  state: () => ({
    all: {},
    cache_files: {},
    files: {
      list: [],
      pageToken: "",
      hasMore: false,
    },
    tasks: {
      list: [],
      pageToken: "",
      restCount: 0,
    },
    taskInfo: {
      list: [],
      pageToken: "",
    },
    taskExpiresIn: 5,
    pageToken: "",
    hasMore: false,
    userDeviceConfig: {},
    privilege: false,
    currentTabId: "ing",
    feedbackVisible: false, // 意见反馈的显示
    treeDataVisible: false, // 目录树选择的显示
    treeData: [], // 目录树
    treeNodeId: "", // 目录选择的ID
    treeNodePath: "", // 目录选择的真实路径
  }),
  getters: {},
  mutations: {
    set(state, file) {
      Vue.set(state.all, file.id, Object.assign({}, state.all[file.id], file));
    },
    add(state, file) {
      state.home.list.unshift(file);
    },
    setCurrentTabId(state, id) {
      state.currentTabId = id;
    },
    setPrivilege(state, data) {
      if (data.result && data.result.toLowerCase() === "accepted") {
        state.privilege = true;
      } else {
        state.privilege = false;
      }
    },
    setFiles(
      state,
      { files, space = "", parentId = "", hasMore = false, refresh = false }
    ) {
      state.files.hasMore = hasMore;
      state.files.space = space;
      state.files.parentId = parentId;
      if (refresh) {
        state.files.list = files;
      } else {
        state.files.list = [...state.files.list, ...files];
      }
    },
    setTasks(state, { refresh, list, pageToken }) {
      let newList = state.tasks.list;
      if (refresh) {
        newList = list;
      } else {
        newList = [...state.tasks.list, ...list];
      }

      const idHash = {};
      newList = newList.reduce(function (accumulator, currentValue) {
        if (!idHash[currentValue.id]) {
          idHash[currentValue.id] = true;
          accumulator.push(currentValue);
        }
        return accumulator;
      }, []);

      state.tasks = {
        list: newList,
        pageToken,
      };
    },
    setTaskExpiresIn(state, data) {
      state.taskExpiresIn = data;
    },
    delTasks(state, { ids, type }) {
      if (type === "spec") {
        // 改变任务状态，而非从列表删除，等待下次真实状态返回更新
        state.tasks.list = state.tasks.list.map((v) => {
          for (let id of ids) {
            if (v.id === id && v.params) {
              const spec = '{"phase":"delete"}';
              const params = Object.assign({}, v.params, { spec });
              v.params = params;
              return v;
            }
            return v;
          }
        });
      } else {
        state.tasks.list = state.tasks.list.filter((v) => !ids.includes(v.id));
      }
    },
    pauseTasks(state, { ids, type }) {
      state.tasks.list = state.tasks.list.map((v) => {
        for (let id of ids) {
          if (v.id === id && v.params) {
            const spec = '{"phase":"pause"}';
            const status = '{"phase": "running"}';
            const params = Object.assign({}, v.params, { spec, status });
            return Object.assign({}, v, { params });
          }
          return v;
        }
      });
    },
    resumeTasks(state, { ids, type }) {
      state.tasks.list = state.tasks.list.map((v) => {
        for (let id of ids) {
          if (v.id === id && v.params) {
            const spec = '{"phase":"running"}';
            const status = '{"phase": "pause"}';
            const params = Object.assign({}, v.params, { spec, status });
            return Object.assign({}, v, { params });
          }
          return v;
        }
      });
    },
    changeTaskInfo(state, { list, phaseType }) {
      // 已完成tab处理
      if (phaseType === "done") {
        // 解决移动端删除操作，PC同步更新问题
        const refreshDoneList = list.filter((item) =>
          DONE_PHASE.includes(item.phase.toUpperCase())
        );

        let pageDoneList = state.tasks.list;

        const pageLen = pageDoneList.length;
        const checkLen = refreshDoneList.length;
        let newPageList = pageDoneList;

        if (pageLen > checkLen) {
          let lastItem = refreshDoneList[checkLen - 1];
          let lastIndex = checkLen - 1;
          for (let index = 0; index < pageDoneList.length; index++) {
            if (pageDoneList[index].id === lastItem.id) {
              lastIndex = index;
            }
          }

          const former = pageDoneList.slice(0, lastIndex + 1);
          const latter = pageDoneList.slice(lastIndex + 1, pageLen);
          newPageList = refreshDoneList.concat(latter);

          const idHash = {};
          newPageList = newPageList.reduce(function (
            accumulator,
            currentValue
          ) {
            if (!idHash[currentValue.id]) {
              idHash[currentValue.id] = true;
              accumulator.push(currentValue);
            }
            return accumulator;
          },
          []);
        } else {
          let lastItem = pageDoneList[pageLen - 1];
          let lastIndex = pageLen - 1;
          for (let index = 0; index < refreshDoneList.length; index++) {
            if (refreshDoneList[index].id === lastItem.id) {
              lastIndex = index;
            }
          }

          const former = refreshDoneList.slice(0, lastIndex + 1);
          const latter = refreshDoneList.slice(lastIndex + 1, checkLen);
          newPageList = former;
          const idHash = {};
          newPageList = newPageList.reduce(function (
            accumulator,
            currentValue
          ) {
            if (!idHash[currentValue.id]) {
              idHash[currentValue.id] = true;
              accumulator.push(currentValue);
            }
            return accumulator;
          },
          []);
        }

        state.tasks.list = newPageList.filter((v) => v && v.id);
        return;
      }

      // 下载中tab
      const completed = list
        .map((item) => {
          if (DONE_PHASE.includes(item.phase.toUpperCase())) {
            return item.id;
          }
        })
        .filter((v) => v !== undefined);

      // 剔除已完成的
      const refreshRunningList = list.filter((item) => {
        if (ING_PHASE.includes(item.phase.toUpperCase())) {
          return true;
        }
        return false;
      });

      // 删除已完成的
      let pageRunningList = state.tasks.list.filter((v) => {
        if (completed.includes(v.id)) {
          return false;
        } else {
          return true;
        }
      });

      const pageLen = pageRunningList.length;
      const checkLen = refreshRunningList.length;
      let newPageList = pageRunningList;

      if (pageLen > checkLen) {
        let lastItem = refreshRunningList[checkLen - 1];
        let lastIndex = checkLen - 1;
        for (let index = 0; index < pageRunningList.length; index++) {
          if (pageRunningList[index].id === lastItem.id) {
            lastIndex = index;
          }
        }

        const former = pageRunningList.slice(0, lastIndex + 1);
        const latter = pageRunningList.slice(lastIndex + 1, pageLen);
        newPageList = refreshRunningList.concat(latter);

        const idHash = {};
        newPageList = newPageList.reduce(function (accumulator, currentValue) {
          if (!idHash[currentValue.id]) {
            idHash[currentValue.id] = true;
            accumulator.push(currentValue);
          }
          return accumulator;
        }, []);
      } else {
        let lastItem = pageRunningList[pageLen - 1];
        let lastIndex = pageLen - 1;
        for (let index = 0; index < refreshRunningList.length; index++) {
          if (refreshRunningList[index].id === lastItem.id) {
            lastIndex = index;
          }
        }

        const former = refreshRunningList.slice(0, lastIndex + 1);
        const latter = refreshRunningList.slice(lastIndex + 1, checkLen);
        newPageList = former;
        const idHash = {};
        newPageList = newPageList.reduce(function (accumulator, currentValue) {
          if (!idHash[currentValue.id]) {
            idHash[currentValue.id] = true;
            accumulator.push(currentValue);
          }
          return accumulator;
        }, []);
      }

      state.tasks.list = newPageList.filter((v) => v && v.id);
    },
    setTaskInfoList(state, { list }) {
      state.taskInfo = {
        list: list,
      };
    },
    setUserDeviceConfig(state, config) {
      state.userDeviceConfig = config;
    },
    update(state, data) {
      for (let key in data) {
        state[key] = data[key];
      }
    },
  },
  actions: {
    fetchPrivilege({ commit, state }, params) {
      // control the visibility of file tab
      return driveFetch("/drive/v1/privilege/PAN_CLI_FULL", "GET", {}).then(
        (res) => {
          commit("setPrivilege", res);
          return res;
        }
      );
    },
    fetchFile({ commit, state, rootState }, params = { space: "", id: "" }) {
      const { space } = params;
      const { id } = params;
      const newParams = Object.assign({}, params, {
        space: space,
      });
      return driveFetch("/drive/v1/files/" + id, "GET", newParams).then(
        (res) => {
          return res;
        }
      );
    },
    fetchFiles(
      { commit, state, rootState },
      params = {
        space: "",
        parent_id: "",
        refresh: true,
        limit: FILE_PAGE_LIMIT,
      }
    ) {
      const { refresh } = params;
      const { space } = params;
      const { parent_id } = params;
      const { limit } = params;
      const { target } = rootState.user.userInfo;

      var cache_files_key = space + "#" + parent_id;
      if (!state.cache_files[cache_files_key]) {
        state.cache_files[cache_files_key] = {
          files: [],
          next_page_token: "",
          hasMore: true,
        };
      }
      var files = state.cache_files[cache_files_key];
      commit("setFiles", {
        ...files,
        space: space,
        parentId: parent_id,
        hasMore: files.hasMore,
        refresh: true,
      });
      if (refresh) {
        state.cache_files[cache_files_key] = {
          files: [],
          next_page_token: "",
          hasMore: true,
        };
        files = state.cache_files[cache_files_key];
      }
      if (!files.hasMore) {
        return files;
      }

      const newParams = Object.assign({}, params, {
        space: space,
        page_token: files.next_page_token,
        parent_id: parent_id,
        limit: 20,
      });

      delete newParams.refresh;

      return driveFetch("/drive/v1/files", "GET", newParams).then((res) => {
        if (res && res.files) {
          files.files = [...files.files, ...res.files];
          if (!res.next_page_token) {
            res.next_page_token = "";
            files.hasMore = false;
          }
          files.next_page_token = res.next_page_token;
          commit("setFiles", {
            ...files,
            space: space,
            parentId: parent_id,
            hasMore: files.hasMore,
            refresh: true,
          });
        }
        return res;
      });
    },
    fetchTasks(
      { commit, state, rootState },
      params = { refresh: true, limit: TASK_PAGE_LIMIT, phaseCheck: false }
    ) {
      const { target } = rootState.user.userInfo;
      const refresh = params.refresh;
      const phaseType = params.phase;
      const phaseCheck = params.phaseCheck || false;
      const limit = params.limit || TASK_PAGE_LIMIT;
      const phaseTypeMap = {
        ing: ING_PHASE.join(","),
        done: DONE_PHASE.join(","),
      };

      const filters = {
        phase: { in: phaseTypeMap[phaseType] },
        type: { in: "user#download,user#download-url" },
      };

      if (phaseCheck) {
        filters.phase = {};
      }

      const newParams = Object.assign({}, params, {
        space: target,
        page_token: refresh ? "" : state.tasks.pageToken,
        filters: JSON.stringify(filters),
        limit,
      });

      delete newParams.phase;
      delete newParams.refresh;

      return driveFetch("/drive/v1/tasks", "GET", newParams).then((res) => {
        const tasks = res.tasks || [];
        const list = tasks.map((task) => {
          if (!task.params) {
            task.params = {};
          }

          return task;
        });

        if (phaseCheck) {
          commit("changeTaskInfo", { list, phaseType });
        }

        const ingList = list.filter((v) =>
          ["PHASE_TYPE_PENDING", "PHASE_TYPE_RUNNING"].includes(v.phase)
        );

        if (phaseCheck) {
          commit("setTaskExpiresIn", res.expires_in);
          return ingList;
        }

        commit("setTaskExpiresIn", res.expires_in);
        commit("setTasks", {
          list,
          refresh,
          pageToken: res.next_page_token || "",
        });

        return list;
      });
    },
    fetchTaskInfo({ commit, state }, params) {
      commit("setTaskInfoList", {
        list: [],
      });

      return driveFetch("/drive/v1/resource/list", "POST", params).then(
        (res) => {
          if (res && res.list && res.list.resources) {
            commit("setTaskInfoList", {
              list: res.list.resources,
            });
          } else {
            commit("setTaskInfoList", {
              list: [],
            });
          }
          return res;
        }
      );
    },
    addUrlTask({ commit, state }, params) {
      const { type, file, target } = params;
      const args = { target };
      if (type === USER_DOWNLOAD_URL) {
        args.url = file.url;
      } else {
        args.file_id = file.id;
      }

      const { name, file_name, file_size, file_count } = file;

      const newParams = {
        type,
        name: name || file_name,
        file_name: file_name || name,
        file_size: file_size.toString(),
        space: target,
        params: {
          ...args,
          sub_file_count: file_count.toString(),
          parent_folder_id: state.treeNodeId, // 保存的目录
        },
      };

      return driveFetch("/drive/v1/task", "POST", newParams).then((res) => {
        return res;
      });
    },
    async operateTask(
      { commit, state, dispatch },
      { id, space, type, action, phase }
    ) {
      // phase: running || complete
      const actionTypeMap = {
        delete: "delTasks",
        pause: "pauseTasks",
        running: "resumeTasks",
      };

      const params = {
        space,
        type,
        id,
        set_params: {
          spec: JSON.stringify({ phase: action }),
        },
      };

      return driveFetch("/drive/v1/task", "PATCH", params).then((res) => {
        if (res && actionTypeMap[action]) {
          commit(actionTypeMap[action], { ids: [id], type: "spec" });
        }

        setTimeout(() => {
          dispatch("fetchTasks", {
            refresh: true,
            limit: TASK_PAGE_LIMIT,
            phaseCheck: false,
            phase: state.currentTabId,
          });
        }, 5000);
        return res;
      });
    },
    deleteTasks({ commit }, { ids, space }) {
      // phase: pending || error
      let taskIdQs = "";
      if (Array.isArray(ids)) {
        taskIdQs = `task_ids=${ids.join("&task_ids=")}`;
      } else {
        taskIdQs = `task_ids=${ids}`;
      }

      return driveFetch(
        `/drive/v1/tasks?space=${encodeURIComponent(space)}&${taskIdQs}`,
        "DELETE",
        {}
      ).then((res) => {
        if (res) {
          commit("delTasks", { ids, type: "normal" });
        }
        return res;
      });
    },
    getDeviceConfig({ commit }, params) {
      return driveFetch("/device/config", "GET", params).then((res) => {
        if (res) {
          commit("setUserDeviceConfig", res);
        }
        return res;
      });
    },
    setDeviceConfig({ commit }, params) {
      return driveFetch("/device/config", "POST", params).then((res) => {
        return res;
      });
    },
    postFeedback({ commit }, params) {
      return driveFetch("/device/report", "POST", params);
    },
    postBt({ commit }, params) {
      return driveFetch("/device/btinfo", "POST", params);
    },
    loadFolders({ commit }, params) {
      params.filters = JSON.stringify({ kind: { eq: "drive#folder" } });
      return driveFetch("/drive/v1/files", "GET", params).then((res) => {
        const treeData = res.files
          .filter((v) => v.kind === "drive#folder")
          .map((v) => ({
            icon: staticIcons.dir,
            id: v.id,
            title: v.name,
            path: v.params.RealPath,
          }));
        commit("update", {
          treeData,
          treeDataVisible: true,
        });
        return res;
      });
    },
    addFileTreeFolder({ commit, state }, params) {
      return driveFetch("/drive/v1/files", "POST", params);
    },
  },
};
