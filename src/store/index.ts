import Vuex from "vuex";
import drive from "./drive"
import user from "./user"

export default new Vuex.Store({
  state: () => ({}),
  modules: {
    drive,
    user
  },
  mutations: {},
  actions: {},
  getters: {},
});
