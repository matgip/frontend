<template>
  <div>
    <section>
      <v-toolbar class="deep-orange" rounded>
        <v-icon v-bind="vuetifyBuildingIcon">{{ fontAwesomeBuilding }}</v-icon>

        <!-- 서치바 -->
        <Search />

        <!-- Menu 버튼 -->
        <v-btn icon @click="onOpenMenu()">
          <v-icon color="white">{{ fontAwesomeBar }}</v-icon>
        </v-btn>

        <!-- 하단 서치바 table -->
        <template v-slot:extension>
          <v-tabs v-bind="vuetifyTabs" v-model="selected">
            <v-tab @click="onSearchByCenter()">
              근처 부동산
            </v-tab>
            <v-tab>
              실시간 인기 부동산
            </v-tab>
            <v-tab>
              뉴스
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
    </section>

    <section v-show="isMenuVisible">
      <Menu @close-menu-card="onCloseMenu()" />
    </section>

    <div id="dashboard_container" :class="{ scrolled: isScrollUp }">
      <section>
        <v-btn
          id="dashboard_scroll_button"
          @click="scrollToggle"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
          block
        >
          <v-icon v-show="!isScrollUp">{{ fontAwesomeArrowUp }}</v-icon>
          <v-icon v-show="isScrollUp">{{ fontAwesomeArrowDown }}</v-icon>
        </v-btn>

        <!-- 부동산 -->
        <div v-if="selected === 0">
          <Agency :center="mapCenter" @scroll-up="scrollUp()" />
        </div>
        <!-- 실시간 인기 부동산 TOP 15 -->
        <div v-if="selected === 1">
          <RealTimeViews @scroll-up="scrollUp()" />
        </div>
        <!-- 부동산 관련 뉴스 -->
        <div v-if="selected === 2">
          <News @scroll-up="scrollUp()" />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Search from "@/components/cards/SearchBar.vue";
import Menu from "@/components/cards/MenuCard/Menu.vue";
import Agency from "@/components/cards/AgencyCard/Agency.vue";
import RealTimeViews from "@/components/cards/RealTimeViewsCard/RealTimeViews.vue";
import News from "@/components/cards/NewsCard/News.vue";

import { mapGetters } from "vuex";

export default {
  components: {
    Search,
    Menu,
    Agency,
    RealTimeViews,
    News,
  },

  data() {
    return {
      mapCenter: {},

      // Touch move
      startY: 0,
      endY: 0,

      isScrollUp: false,
      isMenuVisible: false,

      selected: 0,

      vuetifyBuildingIcon: {
        class: "mr-4",
        color: "white",
      },
      vuetifyTabs: {
        color: "white",
        "hide-slider": true,
        "slider-color": "white",
      },
      vuetifyFilter: {
        color: "black",
      },
      fontAwesomeBuilding: "fas fa-building",
      fontAwesomeArrowUp: "fa-solid fa-arrow-up",
      fontAwesomeArrowDown: "fa-solid fa-arrow-down",
      fontAwesomeBar: "fas fa-bars",
    };
  },

  computed: {
    ...mapGetters({
      map: "GET_MAP",
    }),
  },

  methods: {
    async onSearchByCenter() {
      this.mapCenter = this.map.getCenter();
    },

    onTouchStart(e) {
      this.startY = e.touches[0].clientY;
    },

    onTouchEnd(e) {
      this.endY = e.changedTouches[0].clientY;
      if (this.startY - this.endY >= 100) this.isScrollUp = true;
      if (this.startY - this.endY <= -150) this.isScrollUp = false;
    },

    scrollToggle() {
      this.isScrollUp = !this.isScrollUp;
    },

    scrollUp() {
      this.isScrollUp = true;
    },
    onOpenMenu() {
      this.isMenuVisible = true;
    },
    onCloseMenu() {
      this.isMenuVisible = false;
    },
  },
};
</script>

<style scope>
#dashboard_container {
  background-color: white;
  height: 100%;
  overflow-y: hidden;
}

#dashboard_container section {
  background-color: white;
  border: 10px solid #e0e0e0;
  height: 100%;
  overflow-y: auto;
}

/* Scroll button */
#dashboard_scroll_button {
  display: none;
}

@media screen and (max-width: 768px) {
  #dashboard_container {
    position: fixed;

    width: 100%;
    height: 100%;
    top: calc(100vh - var(--agency-card-height));

    transform: translateY(0);
    transition: all 0.5s;
  }

  #dashboard_container.scrolled {
    top: 0%;
  }

  #dashboard_scroll_button {
    display: block;

    color: white;
    background-color: #ff5722;
  }
}

/* SASS - remove bottom  divider */
.theme--light.v-divider {
  border-color: rgba(0, 0, 0, 0);
}

.v-toolbar__content {
  display: flex;
  justify-content: space-between;
}
</style>
