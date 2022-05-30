<template>
  <!-- 검색 결과 없음 -->
  <div v-if="!agency.id && sorted.length === 0">
    <NoContent />
  </div>
  <!-- 리뷰 -->
  <div v-else-if="isReviewsVisible">
    <Reviews @close-reviews-card="onCloseReviews()" />
  </div>
  <div v-else>
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

      <div v-if="isFilterVisible">
        <SearchFilter @close-filter-card="onCloseFilter()" @apply-filter="onApplyFilter" />
      </div>

      <template
        v-for="agency in sorted.slice((agencyPage - 1) * MAX_AGENCIES_PER_PAGE, agencyPage * MAX_AGENCIES_PER_PAGE)"
      >
        <Agency :agency="agency" :key="agency.id" @open-reviews-card="onOpenReviews()" />
      </template>

      <v-pagination v-bind="vuetifyPagination" v-model="agencyPage" :length="agencyPageCount" :total-visible="5" />
    </div>
  </div>
</template>

<script>
import mergesort from "mergesort";
import agencyApi from "@/api/agency";

import Agency from "./AgencyCard.vue";
import SearchFilter from "@/components/cards/SearchFilterCard/SearchFilter.vue";

import NoContent from "@/components/cards/NoContentCard/NoContent.vue";
import Reviews from "@/components/cards/ReviewsCard/Reviews.vue";

import { mapGetters } from "vuex";

export default {
  components: {
    Agency,
    NoContent,
    SearchFilter,
    Reviews,
  },

  async mounted() {
    try {
      const { y, x } = this.center;
      this.agencies = await agencyApi.searchByCenter(x, y);
      this.sorted = mergesort(this.comparator, await agencyApi.searchByCenter(x, y));
    } catch (err) {
      console.error(err);
    }
  },

  data() {
    return {
      agencyPage: 1,
      agencies: [],
      sorted: [],

      comparator: this.$_orderByStars,

      MAX_AGENCIES_PER_PAGE: 4,

      isFilterVisible: false,
      isReviewsVisible: false,

      vuetifyPagination: {
        color: "deep-orange",
        circle: true,
        class: "mt-10",
      },
    };
  },

  props: {
    center: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters({
      agency: "GET_AGENCY",
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
      if (this.sorted.length !== 0) this.$emit("on-upload-complete");
    },

    center: async function() {
      try {
        const { y, x } = this.center;
        this.agencies = await agencyApi.searchByCenter(x, y);
        this.sorted = mergesort(this.comparator, await agencyApi.searchByCenter(x, y));
      } catch (err) {
        console.error(err);
      }
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
    $_calDistFromCenter(agency) {
      const { y, x } = this.center;
      const distX = Math.abs(y - agency.y) ** 2;
      const distY = Math.abs(x - agency.x) ** 2;
      return distX + distY;
    },
    $_orderByViews(a, b) {
      return this.$_sumOfViews(a) < this.$_sumOfViews(b);
    },
    $_orderByStars(a, b) {
      return a.stars < b.stars;
    },
    $_orderByDistance(a, b) {
      return this.$_calDistFromCenter(a) > this.$_calDistFromCenter(b);
    },

    async onApplyFilter(filter) {
      switch (filter) {
        case "orderByViews":
          this.comparator = this.$_orderByViews;
          break;
        case "orderByRating":
          this.comparator = this.$_orderByStars;
          break;
        case "orderByDistance":
          this.comparator = this.$_orderByDistance;
          break;
      }
      this.sorted = mergesort(this.comparator, this.sorted);
      this.isFilterVisible = false;
      this.agencyPage = 1;
    },

    onOpenFilter() {
      this.isFilterVisible = true;
    },
    onCloseFilter() {
      this.isFilterVisible = false;
    },
    onOpenReviews() {
      this.isReviewsVisible = true;
    },
    onCloseReviews() {
      this.isReviewsVisible = false;
    },
  },
};
</script>

<style>
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
</style>
