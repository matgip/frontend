<template>
  <div>
    <section>
      <v-toolbar class="deep-orange">
        <!-- 서치바 -->
        <Search />

        <!-- Menu 버튼 -->
        <v-btn icon @click="onOpenMenu()">
          <v-icon>{{ fontAwesomeBar }}</v-icon>
        </v-btn>

        <!-- 하단 서치바 table -->
        <template v-slot:extension>
          <v-tabs color="white" slider-color="white">
            <v-tab @click="onSearchByCenter()">
              근처 부동산
            </v-tab>
            <v-tab>
              뉴스
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
    </section>

    <section v-if="menuVisibleFlag">
      <Menu @close-menu-card="onCloseMenu()" />
    </section>

    <div id="dashboard_container">
      <section>
        <v-btn id="dashboard_scroll_button" @click="scrollToggle" block>
          <v-icon v-if="!isScrollUp">{{ fontAwesomeArrowUp }}</v-icon>
          <v-icon v-else>{{ fontAwesomeArrowDown }}</v-icon>
        </v-btn>

        <!-- 검색 결과 없음 -->
        <div v-show="!agency.id && sorted.length === 0">
          <NoContent />
        </div>

        <div v-if="reviewVisibleFlag">
          <!-- 리뷰 -->
          <Reviews @close-reviews-card="onCloseReviews()" />
        </div>
        <div v-else>
          <!-- 선택된 부동산 -->
          <Agency v-if="agency.id" :agency="agency" :key="agency.id" @open-reviews-card="onOpenReviews()" />

          <!-- 주변 부동산 -->
          <div v-if="sorted.length !== 0">
            <div class="dashboard_agencies_title_container">
              <h3 class="mr-14">근처 부동산</h3>
              <img src="@/assets/images/filter.png" width="32" height="32" @click="onOpenFilter()" />
              <div class="dashboard_agencies_filter" @click="onOpenFilter()">
                필터
              </div>
            </div>

            <div v-if="filterVisibleFlag">
              <SearchFilter @close-filter-card="onCloseFilter()" @apply-filter="onApplyFilter" />
            </div>

            <template
              v-for="agency in sorted.slice(
                (agencyPage - 1) * MAX_AGENCIES_PER_PAGE,
                agencyPage * MAX_AGENCIES_PER_PAGE
              )"
            >
              <Agency :agency="agency" :key="agency.id" @open-reviews-card="onOpenReviews()" />
            </template>

            <v-pagination
              v-bind="vuetifyPagination"
              v-model="agencyPage"
              :length="agencyPageCount"
              :total-visible="5"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import mergesort from "mergesort";
import agencyApi from "@/api/agency";

import Search from "@/components/cards/SearchBar.vue";
import Menu from "@/components/cards/MenuCard/Menu.vue";
import Agency from "@/components/cards/AgencyCard/AgencyCard.vue";
import NoContent from "@/components/cards/NoContentCard/NoContent.vue";
import Reviews from "@/components/cards/ReviewsCard/Reviews.vue";
import SearchFilter from "@/components/cards/SearchFilterCard/SearchFilter.vue";

import { mapGetters } from "vuex";

export default {
  components: {
    Search,
    Menu,
    Agency,
    NoContent,
    Reviews,
    SearchFilter,
  },

  data() {
    return {
      agencyPage: 1,
      agencies: [],
      sorted: [],
      comparator: this.$_orderByStars,
      MAX_AGENCIES_PER_PAGE: 4,
      isScrollUp: false,

      menuVisibleFlag: false,
      filterVisibleFlag: false,
      reviewVisibleFlag: false,

      vuetifyPagination: {
        color: "deep-orange",
        circle: true,
        class: "mt-10",
      },
      vuetifyFilter: {
        color: "black",
      },
      fontAwesomeArrowUp: "fa-solid fa-arrow-up",
      fontAwesomeArrowDown: "fa-solid fa-arrow-down",
      fontAwesomeBar: "fas fa-bars",
      fontAwesomeFilter: "fa-solid fa-filter",
    };
  },

  computed: {
    ...mapGetters({
      agency: "GET_AGENCY",
      map: "GET_MAP",
    }),

    agencyPageCount() {
      const agenciesPageCnt = this.agencies.length;
      if (agenciesPageCnt <= this.MAX_AGENCIES_PER_PAGE) return 1;
      return Math.trunc(agenciesPageCnt / this.MAX_AGENCIES_PER_PAGE + 1);
    },
  },

  watch: {
    agency: function(val) {
      if (Object.keys(this.agency).length === 0) return;
      val.type = "agency";
    },

    sorted: function() {
      if (this.sorted.length !== 0) this.scrollUp();
    },
  },

  methods: {
    $_sumOfViews(agency) {
      if (agency.views === null || Object.keys(agency.views) === 0) return 0;
      let sumOfViews = 0;
      for (const view of Object.values(agency.views)) {
        sumOfViews += parseInt(view);
      }
      return sumOfViews;
    },
    $_orderByViews(a, b) {
      return this.$_sumOfViews(a) < this.$_sumOfViews(b);
    },
    $_orderByStars(a, b) {
      return a.stars < b.stars;
    },

    async onSearchByCenter() {
      try {
        const { y, x } = this.map.getCenter();
        this.agencies = await agencyApi.searchByCenter(x, y);
        this.sorted = mergesort(this.comparator, await agencyApi.searchByCenter(x, y));
      } catch (err) {
        console.error(err);
      }
    },

    // Scroll
    scrollToggle() {
      const item = document.getElementById("dashboard_container");
      item.classList.toggle("scrolled");

      if (!item.classList.contains("scrolled")) this.isScrollUp = false;
      else this.isScrollUp = true;
    },

    scrollUp() {
      const item = document.getElementById("dashboard_container");
      if (!item.classList.contains("scrolled")) {
        item.classList.toggle("scrolled");
        this.isScrollUp = true;
      }
    },

    async onApplyFilter(filter) {
      switch (filter) {
        case "orderByViews":
          this.comparator = this.$_orderByViews;
          break;
        case "orderByRating":
          this.comparator = this.$_orderByStars;
          break;
      }
      this.sorted = mergesort(this.comparator, this.sorted);
      this.filterVisibleFlag = false;
      this.agencyPage = 1;
    },

    onOpenFilter() {
      this.filterVisibleFlag = true;
    },
    onCloseFilter() {
      this.filterVisibleFlag = false;
    },
    onOpenMenu() {
      this.menuVisibleFlag = true;
    },
    onCloseMenu() {
      this.menuVisibleFlag = false;
    },
    onOpenReviews() {
      this.reviewVisibleFlag = true;
    },
    onCloseReviews() {
      this.reviewVisibleFlag = false;
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

.dashboard_agencies_title_container {
  margin: 14px;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  cursor: pointer;
}

.dashboard_agencies_filter {
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
  color: gray;
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
