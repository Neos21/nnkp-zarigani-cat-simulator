import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../views/Home.view.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/admin',
      component: () => import('../views/Admin.view.vue'),
      children: [
        { path: ''          , component: () => import('../views/AdminHome.view.vue') },
        { path: 'upload'    , component: () => import('../views/AdminImageUpload.view.vue') },
        { path: 'images'    , component: () => import('../views/AdminImageList.view.vue') },
        { path: 'images/:id', component: () => import('../views/AdminImageEdit.view.vue') }
      ]
    }
  ]
});

export default router;
