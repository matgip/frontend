<template>
  <div>
    <div class="reviews_header_container">
      <v-icon @click="onCloseCard()" v-bind="vuetifyLeftIcon">{{ fontAwesomeLeftArrow }}</v-icon>
      <h3>{{ agency.place_name }}</h3>
    </div>

    <div class="reviews_statistics_container">
      <v-container>
        <v-row>
          <v-col v-for="stat in stats" :key="stat.title">
            <BaseBarGraph :key="stat.count" :stat="stat" />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <div class="reviews_button_container">
      <BaseButton
        :btn-props="vuetifyButton"
        :icon-props="vuetifyIcon"
        :on-click="onLikeAgency"
        :icon="'fas fa-heart'"
        :button="'좋아요'"
      />
      <ReviewDialogButton />
    </div>

    <div class="reviews_tabs_container">
      <v-tabs v-bind="vuetifyTabs">
        <v-tab id="like" @click="onChangeOrder">좋아요 순</v-tab>
        <v-tab id="time" @click="onChangeOrder">최신 순</v-tab>
      </v-tabs>
    </div>

    <div
      v-for="(review, i) in reviewsSelected.slice((page - 1) * MAX_REVIEWS_PER_PAGE, page * MAX_REVIEWS_PER_PAGE)"
      :key="i"
    >
      <Review :review="review" @like-review="onLikeReview" />
    </div>

    <v-pagination v-bind="vuetifyPagination" v-model="page" :length="pageCount" :total-visible="7" />
  </div>
</template>

<script>
import BaseBarGraph from "@/common/BaseBarGraph.vue";
import BaseButton from "@/common/BaseButton.vue";

import ReviewDialogButton from "./ReviewDialogButton.vue";
import Review from "./Review.vue";

import { mapGetters } from "vuex";

import { reviewByLikeApi, reviewByTimeApi, reviewLikeApi } from "@/api/reviews";

export default {
  components: {
    BaseBarGraph,
    BaseButton,
    ReviewDialogButton,
    Review,
  },

  data: () => ({
    page: 1,
    MAX_REVIEWS_PER_PAGE: 4,
    orderBy: "like",
    stats: [
      {
        count: 0,
        data: [0, 0, 0, 0, 0],
        name: "price",
        title: "가격",
        color: "#BA68C8",
        fields: ["veryCheap", "cheap", "avgPrice", "expensive", "veryExpensive"],
        categories: ["10% 이상 쌈", "5~10% 더 쌈", "평균 가격", "5~10% 더 비쌈", "10% 이상 비쌈"],
      },
      {
        count: 0,
        data: [0, 0, 0, 0, 0],
        name: "kindness",
        title: "친절함",
        color: "#4DD0E1",
        fields: ["veryKind", "kind", "soso", "unKind", "veryUnkind"],
        categories: ["매우 친절", "친절", "보통", "불친절", "매우 불친절"],
      },
      {
        count: 0,
        data: [0, 0],
        name: "contract",
        title: "계약률",
        color: "#81C784",
        categories: ["여기서 계약했어요", "여기서 계약 안했어요"],
        fields: ["true", "false"],
      },
    ],
    reviews: {
      like: [],
      time: [],
    },

    fontAwesomeLeftArrow: "fa fa-arrow-left",
    vuetifyLeftIcon: {
      color: "black",
    },

    vuetifyButton: {
      color: "deep-orange",
      outlined: true,
      rounded: true,
      small: true,
      class: "mr-2",
    },
    vuetifyIcon: {
      left: true,
    },
    vuetifyTabs: {
      left: true,
      color: "deep-orange",
    },
    vuetifyPagination: {
      color: "deep-orange",
      circle: true,
      class: "mt-10",
    },
  }),

  computed: {
    ...mapGetters({
      agency: "GET_AGENCY",
      user: "GET_USER",
    }),

    reviewsSelected() {
      return this.reviews[this.orderBy];
    },

    pageCount() {
      const reviewCnt = this.reviews[this.orderBy].length;
      if (reviewCnt <= this.MAX_REVIEWS_PER_PAGE) return 1;
      return Math.trunc(reviewCnt / this.MAX_REVIEWS_PER_PAGE + 1);
    },
  },

  async mounted() {
    await this.fetch();

    this.$store.subscribe(async (mutation) => {
      if (mutation.type === "UPDATE_AGENCY") {
        this.clear();
        await this.fetch();
      }
    });
  },

  destroyed() {
    this.clear();
  },

  methods: {
    onCloseCard() {
      this.$emit("close-reviews-card");
    },

    async onLikeAgency() {
      try {
        const resp = await this.$api.likes.put(this.agency.id, { user_id: this.user.id });
        if (resp.data.result === "already-added") {
          alert("이미 좋아요를 누르셨습니다.");
          return;
        }
        if (resp.data.result === "success") {
          alert("이 부동산을 좋아합니다.");
        }
      } catch (err) {
        console.error(err);
      }
    },

    async onLikeReview(userId) {
      try {
        const response = await reviewLikeApi.add(this.agency.id, userId, this.user.id);
        console.log(response);
        if (response.result === "already-added") {
          alert("이미 이 리뷰를 좋아합니다.");
          return;
        } else if (response.result === "success") {
          alert("이 리뷰를 좋아합니다.");
        }
        await reviewByLikeApi.added(this.agency.id, userId);
      } catch (err) {
        console.error(err);
      }
    },

    onChangeOrder(event) {
      this.orderBy = event.currentTarget.id;
    },

    async fetch() {
      const maxRange = "0~-1";

      try {
        this.reviews["like"] = await reviewByLikeApi.fetch(this.agency.id, maxRange);
        this.reviews["time"] = await reviewByTimeApi.fetch(this.agency.id, maxRange);
        this.calculate(this.reviews["like"]);
      } catch (err) {
        console.error(err);
      }
    },

    calculate(reviews) {
      for (let review of reviews) {
        this.stats.forEach((stat) => {
          this.$_accomulate(stat, review[stat.name]);
          this.$_percentFormula(stat);
        });
      }
    },

    $_accomulate(stat, field) {
      if (!field) return;
      stat.count += 1;
      const matchedIndex = stat.fields.findIndex((f) => f === field);
      stat.data[matchedIndex]++;
    },

    $_percentFormula(stat) {
      if (stat.count === 0) return;
      for (let i = 0; i < stat.data.length; i++) {
        stat.data[i] = Math.floor((stat.data[i] / stat.count) * 100);
      }
    },

    clear() {
      this.reviews["like"] = [];
      this.reviews["time"] = [];
      this.stats.forEach((stat) => {
        stat.count = 0;
        stat.data.fill(0, 0, stat.data.length);
      });
    },
  },
};
</script>

<style>
.reviews_header_container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin: 20px 20px;
}

.reviews_statistics_container {
  /* width: 380px; */
}

.reviews_button_container {
  display: flex;
  align-items: center;

  margin: 16px 18px;
}

.reviews_tabs_container {
  margin: 0px 18px;
}
</style>
