<template>
  <header class="sticky top-0 shadow-lg bg-weather-primary bg-opacity-100 z-10">
    <nav
      class="container flex flex-col sm:flex-row items-center gap-4 text-white py-6"
    >
      <RouterLink :to="{ name: 'home' }">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-cloud-sun text-3xl"></i>
          <p class="text-3xl">WeatherNode</p>
        </div>
      </RouterLink>

      <div class="flex gap-3 flex-1 justify-end">
        <i
          class="fa-solid fa-circle-info text-xl hover:text-weather-secondary duration-150 cursor-pointer"
          @click="toggleAppInfo"
        ></i>
      </div>

      <AppInfo :InfoActive="InfoActive" @close-AppInfo="toggleAppInfo">
        <div class="text-black">
          <h1 class="text-3xl mb-2">About:</h1>
          <p class="text-lg mb-8">
            The WeatherNode allows you to track current weather and future
            weather of city you wish to see.
          </p>
          <h2 class="text-3xl mb-2">How it works:</h2>
          <ol class="text-lg list-decimal list-inside mb-8">
            <li class="mb-2">
              Search a city by entering name of city into the search bar
            </li>
            <li class="mb-2">Select a city within the results</li>
            <li class="mb-2">
              It will take you to current weather of your selected city
            </li>
          </ol>
        </div>
      </AppInfo>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AppInfo from "./AppInfo.vue";

const InfoActive = ref<boolean>(false); // App Info Active State
const toggleAppInfo = () => {
  InfoActive.value = !InfoActive.value; // Toggle App Info Active State
};
</script>
v
