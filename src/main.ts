import { createApp } from "vue";
import App from "@/App.vue"; // Import App Component
import router from "@/router"; // Import Router
import "@/index.css"; // Import CSS File

const app = createApp(App); // Create App

app.use(router); // Use Router

app.mount("#app"); // Mount App
