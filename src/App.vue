<template>
  <div>
    <v-app>
      <v-main>
        <Dashboard class="main_dashboard_container" />
        <router-view :key="$route.fullPath" class="main_router_container"></router-view>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import Dashboard from "./components/layouts/TheDashboard.vue";
export default {
  name: "App",

  components: {
    Dashboard,
  },

  async mounted() {
    await this.$store.dispatch("fetchUser");
  },

  methods: {},
};
</script>

<style>
.main_dashboard_container {
  position: absolute;
  z-index: 20;
  overflow-y: hidden;
  width: var(--dashboard-width);
  height: 100%;
}
.main_router_container {
  margin-left: var(--dashboard-width);
  height: 100%;
}

@media screen and (max-width: 768px) {
  .main_dashboard_container {
    width: 100%;
    height: fit-content;
  }

  .main_router_container {
    margin-left: 0;
  }
}

.v-application {
  font-family: "GmarketSansTTF", sans-serif !important;
}

/* Fonts */
@font-face {
  font-family: "EliceDigitalCoding";
  src: url("assets/fonts/EliceDigitalCoding_Bold.ttf") format("truetype");
  font-weight: 200;
}

@font-face {
  font-family: "EliceDigitalCoding";
  src: url("assets/fonts/EliceDigitalCoding_Regular.ttf") format("truetype");
  font-weight: 200;
}

@font-face {
  font-family: "NanumBarunGothic";
  src: url("assets/fonts/NanumBarunGothic-YetHangul.ttf") format("truetype");
  font-weight: 200;
}

@font-face {
  font-family: "locus_sangsang";
  src: url("assets/fonts/locus_sangsang.ttf") format("truetype");
  font-weight: 200;
}

@font-face {
  font-family: "GmarketSansTTF";
  src: url("assets/fonts/GmarketSansTTFBold.ttf") format("truetype");
  font-weight: 200;
}

@font-face {
  font-family: "GmarketSansTTF";
  src: url("assets/fonts/GmarketSansTTFLight.ttf") format("truetype");
  font-weight: 200;
}

@font-face {
  font-family: "GmarketSansTTF";
  src: url("assets/fonts/GmarketSansTTFMedium.ttf") format("truetype");
  font-weight: 200;
}
</style>
