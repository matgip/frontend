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
    <!-- 현재 조회 중인 부동산 -->
    <div v-if="agency.id">
      <div class="title_container">
        <h3 class="mr-14">지금 보고 있는 부동산</h3>
      </div>
      <Agency :agency="agency" :key="agency.id" @open-reviews-card="onOpenReviews()" />

      <!-- 연령대 분포 Pie chart -->
      <div v-if="Object.keys(this.agency.views).length !== 0" class="view_pie_chart_container">
        <h4 class="view_pie_chart_title">연령대별 조회</h4>
        <div class="view_pie_chart">
          <BasePieGraph :series="chartSeries" :labels="chartLabels" :key="agency.id" />
        </div>
      </div>
    </div>

    <!-- 주변 부동산 -->
    <div v-if="sorted.length !== 0">
      <div class="title_container">
        <h3 class="mr-14">근처에 이런 부동산 어때요?</h3>
        <img src="@/assets/images/filter.png" width="32" height="32" @click="onOpenFilter()" />
        <div class="agencies_filter" @click="onOpenFilter()">
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
import BasePieGraph from "../../../common/BasePieGraph.vue";

export default {
  components: {
    Agency,
    NoContent,
    SearchFilter,
    Reviews,
    BasePieGraph,
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

      chartSeries: [],
      chartLabels: [],

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
      return this.agencies.length <= this.MAX_AGENCIES_PER_PAGE
        ? 1
        : Math.trunc(this.agencies.length / this.MAX_AGENCIES_PER_PAGE + 1);
    },
  },

  watch: {
    agency: function() {
      this.chartSeries = [];
      this.chartLabels = [];
      for (const ageRange in this.agency.views) {
        this.chartSeries.push(parseInt(this.agency.views[ageRange]));
        this.chartLabels.push(`${ageRange.split(":")[1]}대`);
      }
    },

    sorted: function() {
      this.sorted.length !== 0 && this.$emit("on-upload-complete");
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
    async onApplyFilter(filter) {
      switch (filter) {
        case "orderByLikes":
          this.comparator = this.$_orderByLikes;
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

    $_orderByLikes(a, b) {
      return a.likes < b.likes;
    },
    $_orderByStars(a, b) {
      return a.stars < b.stars;
    },
    $_orderByDistance(a, b) {
      return this.$_calDistFromCenter(a) > this.$_calDistFromCenter(b);
    },
    $_calDistFromCenter(agency) {
      const { y, x } = this.center;
      const distX = Math.abs(y - agency.y) ** 2;
      const distY = Math.abs(x - agency.x) ** 2;
      return distX + distY;
    },
  },
};
</script>

<style>
.title_container {
  margin: 14px;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  cursor: pointer;

  border-bottom: 2px solid #e0e0e0;
}

.view_pie_chart_container {
  margin: 30px 14px;
}

.view_pie_chart_title {
  padding-left: 4px;
}

.view_pie_chart {
  display: flex;
  justify-content: center;
}

.agencies_filter {
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
  color: gray;
}
</style>
