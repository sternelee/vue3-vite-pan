export default {
  namespaced: true,
  state: () => ({
    userInfo: {
      build_version: "",
      client_version: "",
      download_version: "",
      last_update_time: "",
      downloads: [{ path: "", usage: 0, limit: 0 }],
      runner_status: {
        status: "",
        message: "",
      },
      target: "",
      user: {
        id: "",
        name: "",
        picture: "",
        group: null,
      },
    },
    curUser: {
      userId: "0",
    },
  }),
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    setCurUser(state, user) {
      if (!(user && user.userId)) {
        user.userId = "0";
      }
      Object.assign(user, { userId: String(user.userId) });
      if (user.userId === "0") {
        state.curUser = Object.assign({}, user);
      } else {
        state.curUser = Object.assign({}, state.curUser, user);
      }
    },
  },
  actions: {
    async watchUserInfo({ commit, state }, params) {
      const prevUserInfo = params || state.userInfo;
      return driveFetch("/device/info/watch", "POST", prevUserInfo).then(
        (res) => {
          if (res) {
            commit("setUserInfo", res);

            if (res.user && res.user.id) {
              const { id, name, picture, group } = res.user;
              let vipData = {};
              if (group && group[0]) {
                // vip_${isvip}_${vipLevel}_${vas_type}
                const [_, isVip, vipLevel, vipType] = group[0].id.split("_");
                const expiresAt = group[0].expires_at;
                vipData = {
                  vipType: vipType || 0,
                  isVip: Number(isVip) ? true : false,
                  vipLevel: vipLevel || 0,
                  expiresAt,
                };
              }

              commit("setCurUser", {
                userId: id,
                nick_name: name,
                portrait_url: picture,
                vipData,
              });
            } else {
              commit("setCurUser", {
                userId: "0",
              });
            }

            return res;
          }

          return null;
        }
      );
    },
    getQrCode({ commit, state }, params) {
      return driveFetch("/auth/qrlogin", "GET", params, true).then((res) => {
        return res;
      });
    },
    checkScanStatus({ commit, state }, params) {
      // 1、pending 等待扫码 2、running 已经扫码，未登录 3、complete 已经登录 4、error 扫码失败
      return driveFetch("/auth/qrlogin/status", "GET", params).then((res) => {
        return res;
      });
    },
    logout({ commit, state }, params) {
      return driveFetch("/auth/signout", "POST", params).then((res) => {
        commit("setCurUser", {});
        return res;
      });
    },
    getClientQrCode({ commit, state }, params) {
      return driveFetch("/device/qrcontrol", "GET", params, true).then(
        (res) => {
          return res;
        }
      );
    },
  },
};
