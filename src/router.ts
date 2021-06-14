import {createRouter, createWebHashHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('./views/index.vue'),
    // redirect: '/home',
    // children: [
    //   {
    //     path: '/home',
    //     component: () => import('./views/home/index.vue')
    //   },
    // ]
  }
]

var router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router