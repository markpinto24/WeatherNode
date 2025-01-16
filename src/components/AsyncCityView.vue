<template>
  <div class="flex flex-col flex-1 items-center -z-0">
    <div v-if="isLoading" class="flex items-center h-screen">
      <h1 class="text-white text-4xl">Weather Data is Loading..</h1>
    </div>

    <section v-else class="w-full flex flex-col flex-1 items-center">
      <!-- Preview Banner -->
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
              Humidity: {{ dailyWeatherData.humidity }}
            </p>
            <p class="text-center text-white mb-1">
              UV Index: {{ dailyWeatherData.uvIndex }}
            </p>
            <p class="text-center text-white mb-1">
              Wind Speed: {{ dailyWeatherData.windSpeed }}
            </p>
          </div>
        </div>
      </div>

      <!-- Hourly Weather -->
      <div class="max-w-screen-md w-full">
        <h2 class="mb-4 text-2xl text-white text-center">3 Hourly Forecast</h2>
        <div class="relative overflow-x-auto md:overflow-x-hidden">
          <div class="flex py-12 px-8 min-w-max">
            <div
              v-for="hourData in hourlyWeatherData"
              :key="hourData.dt"
              class="flex flex-col gap-4 items-center mx-7 first:ml-0 last:mr-0"
            >
              <p class="whitespace-nowrap text-md text-white">
                {{
                  new Date(hourData.dt * 1000).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  })
                }}
              </p>
              <img
                class="w-auto h-[50px] object-cover"
                :src="`http://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`"
                alt=""
              />
              <p class="text-xl text-white">
                {{ Math.round(hourData.main.temp) }}&deg;
              </p>
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
const isLoading = ref(true);
const current_temp = ref(null);
const formattedIST = ref("");
const dailyWeatherData = ref({});
const hourlyWeatherData = ref([]);
const forecastWeatherData = ref([]);

// Fetch Weather Data from Tomorrow.io API
const getWeatherData = async () => {
  try {
    const response = await axios.get(
      `https://api.tomorrow.io/v4/weather/forecast?location=${
        route.params.city
      }&apikey=${import.meta.env.VITE_TOMORROWIO_TOKEN}`
    );

    const weatherData = response.data;
    localStorage.setItem("WeatherData", JSON.stringify(weatherData));

    // Extract and set current temperature
    current_temp.value = Math.round(
      weatherData.timelines.daily[0].values.temperatureApparentAvg
    );

    // Update daily weather data
    dailyWeatherData.value = {
      temp: current_temp.value,
      humidity: weatherData.timelines.daily[0].values.humidityAvg,
      uvIndex: weatherData.timelines.daily[0].values.uvIndexAvg,
      windSpeed: weatherData.timelines.daily[0].values.windSpeedAvg,
      weatherCode:
        (weatherData.timelines.daily[0].values.weatherCodeMax +
          weatherData.timelines.daily[0].values.weatherCodeMin) /
        2,
    };

    // Format IST time
    const gmtTime = response.headers.date;
    const dateInGMT = new Date(gmtTime);
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    formattedIST.value = dateInGMT.toLocaleString("en-US", options);
  } catch (err) {
    console.error("Weather API Error:", err);
  }
};

// Fetch Weather Data from OpenWeatherMap API
const getOpenWeatherData = async () => {
  try {
    const [currentWeather, hourlyWeather, dailyForecast] = await Promise.all([
      axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${
          route.params.city
        }&appid=${import.meta.env.VITE_OPENWEATHER_TOKEN}`
      ),
      axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${
          route.params.city
        }&appid=${import.meta.env.VITE_OPENWEATHER_TOKEN}&units=metric`
      ),
      axios.get(
        `https://api.openweathermap.org/data/2.5/forecast/daily?q=${
          route.params.city
        }&cnt=7&appid=${import.meta.env.VITE_OPENWEATHER_TOKEN}&units=metric`
      ),
    ]);

    hourlyWeatherData.value = hourlyWeather.data.list.slice(0, 8);
    forecastWeatherData.value = dailyForecast.data.list;

    dailyWeatherData.value = {
      ...dailyWeatherData.value,
      code: currentWeather.data.weather[0].icon,
      weather_name: currentWeather.data.weather[0].main,
    };
  } catch (err) {
    console.error("OpenWeather API Error:", err);
  } finally {
    isLoading.value = false;
  }
};

// Initialize data on component mount
const initializeWeatherData = async () => {
  const cachedData = localStorage.getItem("WeatherData");

  if (cachedData) {
    const weatherData = JSON.parse(cachedData);

    current_temp.value = Math.round(
      weatherData.timelines.daily[0].values.temperatureApparentAvg
    );

    dailyWeatherData.value = {
      temp: current_temp.value,
      humidity: weatherData.timelines.daily[0].values.humidityAvg,
      uvIndex: weatherData.timelines.daily[0].values.uvIndexAvg,
      windSpeed: weatherData.timelines.daily[0].values.windSpeedAvg,
      weatherCode:
        (weatherData.timelines.daily[0].values.weatherCodeMax +
          weatherData.timelines.daily[0].values.weatherCodeMin) /
        2,
    };

    formattedIST.value = new Date(
      weatherData.timelines.minutely[0].time
    ).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } else {
    await getWeatherData();
  }

  await getOpenWeatherData();
};

initializeWeatherData();
</script>
