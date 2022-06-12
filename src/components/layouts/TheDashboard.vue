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
              실시간 인기
            </v-tab>
            <v-tab>
              뉴스
            </v-tab>
            <v-tab>
              자유 게시판
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
          v-touch="{ up: () => scrollUp(), down: () => scrollDown() }"
          block
        >
          <v-icon v-show="!isScrollUp">{{ fontAwesomeArrowUp }}</v-icon>
          <v-icon v-show="isScrollUp">{{ fontAwesomeArrowDown }}</v-icon>
        </v-btn>

        <!-- 부동산 -->
        <div v-show="selected === 0">
          <Agency :center="mapCenter" @on-upload-complete="scrollUp()" />
        </div>
        <!-- 실시간 인기 부동산 TOP 15 -->
        <div v-show="selected === 1">
          <RealTimeViews />
        </div>
        <!-- 부동산 관련 뉴스 -->
        <div v-show="selected === 2">
          <News />
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
        "show-arrows": true,
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
      // 기존에 보고 있던 부동산 제거
      this.$store.commit("CLEAR_AGENCY");
    },

    scrollToggle() {
      this.isScrollUp = !this.isScrollUp;
    },

    scrollUp() {
      this.isScrollUp = true;
    },
    scrollDown() {
      this.isScrollUp = false;
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
