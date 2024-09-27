<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

import HelloWorld from './components/HelloWorld.component.vue';
</script>

<template>
  <div class="wrapper">
    <HelloWorld message="ザリガニねこシミュレーター" />
    
    <ul>
      <li><RouterLink to="/">Home</RouterLink></li>
      <li><RouterLink to="/admin">Admin</RouterLink></li>
    </ul>
    
    <hr>
    
    <RouterView />
  </div>
</template>

<style scoped>
</style>
