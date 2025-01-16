<template>
  <main class="container font-Geist text-white">
    <div class="pt-4" mb-8 relative></div>
    <input
      type="text"
      v-model="searchQuery"
      @input="getSearchResults"
      placeholder="Search for a city or state"
      class="mt-6 py-2 px-1 w-full bg-transparent border-b focus:border-weather-secondary focus:outline-none focus:shadow-[0px_1px_0_0_#004E71]"
    />
    <ul
      class="relative bg-weather-secondary text-white w-full shadow-md py-2 px-1 mt-1"
      v-if="mapboxSearchResults"
    >
      <p class="py-2" v-if="searchError">
        Sorry, something went wrong, please try again.
      </p>
      <p class="py-2" v-if="!serverError && mapboxSearchResults?.length === 0">
        No results found, please try to search of an appropriate place.
      </p>
      <template v-else>
        <li
          v-for="searchResult in mapboxSearchResults"
          :key="searchResult.id"
          class="py-2 cursor-pointer"
          @click="previewCity(searchResult)"
        >
          {{ searchResult.place_name }}
        </li>
      </template>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter(); // Router

const previewCity = (searchResult: any) => {
  //console.log(searchResult);
  const [city, state] = searchResult.place_name.split(",");
  router.push({
    name: "cityView",
    params: { state: state.replaceAll(" ", ""), city: city }, // Navigate to City View
    query: {
      lat: searchResult.geometry.coordinates[1], // Latitude
      lng: searchResult.geometry.coordinates[0], // Longitude
      preview: "true", // Preview City
    },
  });
};

const searchQuery = ref<string>(""); // Search Query
const mapboxSearchResults = ref<any[] | null>(null); // Mapbox Search Results
const searchError = ref<boolean | null>(null); // Search Error
const serverError = ref<boolean | null>(null); // Server Error

const getSearchResults = async () => {
  try {
    if (searchQuery.value != "") {
      const result = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${
          searchQuery.value
        }.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&types=place`
      );
      mapboxSearchResults.value = result.data.features; // Assign Mapbox Search Results
    }
  } catch (error) {
    searchError.value = true; // Set Search Error
  }
};
</script>
