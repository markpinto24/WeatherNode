import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue"; // Home View
import CityView from "@/views/CityView.vue"; // City View

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Create Router
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView, // Home View
      meta:{
        title: "Home"
      },
    },
    {
      path: "/weather/:state/:city",
      name: "cityView",
      component: CityView, // City View
      meta:{
        title: "Weather"
      },
    },
  ],
});

// Set Title for each Route
router.beforeEach((to, from, next) => {
  document.title = `${
    to.params.state
      ? `${to.params.city}, ${to.params.state}`
      : to.meta.title
  } | WeatherNode`;
  next();
});

export default router; // Export Router
