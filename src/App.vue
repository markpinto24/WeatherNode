<template>
  <div class="flex flex-col min-h-screen font-Geist bg-weather-primary">
    <AppNavigationBar />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import AppNavigationBar from "./components/AppNavigationBar.vue";
</script>
