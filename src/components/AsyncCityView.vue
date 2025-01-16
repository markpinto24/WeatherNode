<template>
  <div class="flex flex-col flex-1 items-center">
    <div v-if="isLoading" class="flex items-center h-screen">
      <h1 class="text-white text-4xl">Weather Data is Loading..</h1>
    </div>
    <!-- NavBar -->
    <section v-else class="w-full flex flex-col flex-1 items-center">
      <div class="w-full">
        <div
          v-if="route.query.preview"
          class="text-white p-4 bg-weather-secondary w-full text-center"
        >
          <p>
            This is a preview of the weather in {{ route.params.city }},
            {{ route.params.state }}
          </p>
        </div>
        <!-- Weather Overview -->
        <div class="max-w-screen flex flex-col items-center text-white py-12">
          <h1 class="text-4xl mb-2">
            {{ route.params.city }}
          </h1>
          <p class="text-sm mb-8">
            {{ formattedIST }}
          </p>
          <div class="flex items-center justify-center space-x-10">
            <p class="text-8xl">{{ dailyWeatherData.temp }}&deg;</p>
            <div class="flex flex-col items-center justify-end">
              <p v-if="isLoading"></p>
              <img
                v-else
                :src="`http://openweathermap.org/img/wn/${dailyWeatherData.code}@2x.png`"
                alt=""
              />
              <p>{{ dailyWeatherData.weather_name }}</p>
            </div>
          </div>
          <div class="flex flex-row gap-6 mt-10">
            <p class="text-center text-white mb-1">
              Humidity : {{ dailyWeatherData.humidity }}
            </p>
            <p class="text-center text-white mb-1">
              UV Index : {{ dailyWeatherData.uvIndex }}
            </p>
            <p class="text-center text-white mb-1">
              Wind Speed : {{ dailyWeatherData.windSpeed }}
            </p>
          </div>
        </div>
      </div>

      <!-- Hourly Weather -->
      <div class="max-w-screen-md overflow-x-h w-full py-12">
        <div
          class="mx-8 text-white flex flex-col justify-center items-center gap-y-10"
        >
          <h2 class="mb-4 text-2xl">3 Hourly Forecast</h2>
          <div class="flex gap-14">
            <div
              v-for="hourData in hourlyWeatherData"
              :key="hourData.dt"
              class="flex flex-col gap-4 items-center"
            >
              <p class="whitespace-nowrap text-md">
                {{
                  new Date(hourData.dt * 1000).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    hour12: true, // For AM/PM format
                    timeZone: "Asia/Kolkata", // Ensures the time is in IST
                  })
                }}
              </p>
              <img
                class="w-auto h-[50px] object-cover"
                :src="`http://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`"
                alt=""
              />
              <p class="text-xl">{{ Math.round(hourData.main.temp) }}&deg;</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Weather -->
      <div class="max-w-screen-md w-full py-12">
        <div class="mx-8 text-white flex flex-col space-y-10">
          <h2 class="mb-4 text-2xl text-center">7 Day Forecast</h2>
          <div
            v-for="day in forecastWeatherData"
            :key="day.dt"
            class="flex items-center px-10"
          >
            <p class="flex-1 text-start">
              {{
                new Date(day.dt * 1000).toLocaleDateString("en-IN", {
                  weekday: "long",
                })
              }}
            </p>
            <img
              class="w-[50px] h-[50px] object-cover mt-0"
              :src="`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`"
              alt=""
            />
            <div class="flex gap-2 flex-1 justify-end items-center">
              <p>HT: {{ Math.round(day.temp.max) }}</p>
              <p>LT: {{ Math.round(day.temp.min) }}</p>
              <p>RH: {{ Math.round(day.humidity) }}</p>
              <p>WS: {{ Math.round(day.speed) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import axios from "axios";
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
var isLoading = ref(true); // Loading State
let current_temp = ref(null); // Current Temperature
let formattedIST = ref(""); // Formatted IST Time
let weatherData = null; // Weather Data
let dailyWeatherData = {}; // Daily Weather Data
let hourlyWeatherData = []; // Hourly Weather Data
let forecastWeatherData = []; // Forecast Weather Data
const currentDateString = new Date().toISOString().split("T")[0]; // Current Date String

// Fetch Weather Data from Tomorrow.io API
const getWeatherData = async () => {
  try {
    const response = await axios.get(
      `https://api.tomorrow.io/v4/weather/forecast?location=${
        route.params.city
      }&apikey=${import.meta.env.VITE_TOMORROWIO_TOKEN}`
    );

    weatherData = response.data; // Assign API response to weatherData

    localStorage.setItem("WeatherData", JSON.stringify(weatherData)); // Cache Weather Data

    // Extract the current temperature
    current_temp.value = Math.round(
      weatherData.timelines.daily[0].values.temperatureApparentAvg
    );

    dailyWeatherData.temp = current_temp; // Assign Current Temperature
    dailyWeatherData.humidity =
      weatherData.timelines.daily[0].values.humidityAvg; // Assign Humidity
    dailyWeatherData.uvIndex = weatherData.timelines.daily[0].values.uvIndexAvg; // Assign UV Index
    dailyWeatherData.windSpeed =
      weatherData.timelines.daily[0].values.windSpeedAvg; // Assign Wind Speed
    dailyWeatherData.weatherCode =
      (weatherData.timelines.daily[0].values.weatherCodeMax +
        weatherData.timelines.daily[0].values.weatherCodeMin) /
      2; // Assign Weather Code

    // Parse the GMT time and convert to IST
    const gmtTime = response.headers.date; // Get GMT Time
    const dateInGMT = new Date(gmtTime); // Convert GMT Time to Date
    const options = {
      timeZone: "Asia/Kolkata", // Set Time Zone to IST
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    formattedIST.value = dateInGMT.toLocaleString("en-US", options); // Format IST Time

    // //console.log("IST Time:", formattedIST.value); // Log IST Time in //console
  } catch (err) {
    // //console.log("Weather API Error:", err); // Log Error
  } finally {
    isLoading.value = false; // Stop Loading
  }
};

// Fetch Weather Data from OpenWeatherMap API
const getOpenWeatherData = async () => {
  const openWeatherData = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${
      route.params.city
    }&appid=${import.meta.env.VITE_OPENWEATHER_TOKEN}`
  );

  const hourlyWeatherDataResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${
    route.params.city
  }&appid=${import.meta.env.VITE_OPENWEATHER_TOKEN}&units=metric
`);

  const daysForecastDataResponse = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast/daily?q=${
      route.params.city
    }&cnt=7&appid=${import.meta.env.VITE_OPENWEATHER_TOKEN}&units=metric`
  );

  hourlyWeatherData = hourlyWeatherDataResponse.data.list.slice(0, 8);

  //console.log(daysForecastDataResponse.data.list);
  forecastWeatherData = daysForecastDataResponse.data.list; // Assign Forecast Weather Data

  dailyWeatherData.code = openWeatherData.data.weather[0].icon; // Assign Weather Code
  dailyWeatherData.weather_name = openWeatherData.data.weather[0].main;
  isLoading.value = false; // Stop Loading
};

// Check localStorage first
const cachedData = localStorage.getItem("WeatherData");
getOpenWeatherData();

if (cachedData) {
  //console.log("Using cached weather data");
  weatherData = JSON.parse(cachedData);

  //console.log(weatherData);

  // Populate reactive variables from cached data
  current_temp = Math.round(
    weatherData.timelines.daily[0].values.temperatureApparentAvg
  );

  dailyWeatherData.temp = current_temp; // Assign Current Temperature
  dailyWeatherData.humidity = weatherData.timelines.daily[0].values.humidityAvg; // Assign Humidity
  dailyWeatherData.uvIndex = weatherData.timelines.daily[0].values.uvIndexAvg; // Assign UV Index
  dailyWeatherData.windSpeed =
    weatherData.timelines.daily[0].values.windSpeedAvg; // Assign Wind Speed
  dailyWeatherData.weatherCode =
    (weatherData.timelines.daily[0].values.weatherCodeMax +
      weatherData.timelines.daily[0].values.weatherCodeMin) /
    2; // Assign Weather Code

  formattedIST.value = new Date(
    weatherData.timelines.minutely[0].time
  ).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata", // Set Time Zone to IST
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Stop loading if using cached data
} else {
  //console.log("No cached data, fetching from API...");
  getWeatherData();
}
</script>
