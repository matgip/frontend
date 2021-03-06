<template>
  <div>
    <header class="reviews_header_container">
      <v-icon @click="onCloseCard()" v-bind="vuetifyLeftIcon">{{ fontAwesomeLeftArrow }}</v-icon>
      <h3>{{ agency.place_name }}</h3>
    </header>

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
      <div class="reviews_tabs_title">
        <h3>부동산 리뷰</h3>
      </div>
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
import agencyApi from "@/api/agency";

import BaseBarGraph from "@/common/BaseBarGraph.vue";
import BaseButton from "@/common/BaseButton.vue";

import ReviewDialogButton from "./ReviewDialogButton.vue";
import Review from "./Review.vue";

import { mapGetters } from "vuex";

import { reviewApi } from "@/api/reviews";

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
        title: "수수료",
        color: "#BA68C8",
        fields: ["veryCheap", "cheap", "avgPrice", "expensive", "veryExpensive"],
        categories: ["10% 이상 쌈", "5~10% 더 쌈", "평균 수수료", "5~10% 더 비쌈", "10% 이상 비쌈"],
      },
      {
        count: 0,
        data: [0, 0, 0, 0, 0],
        name: "kindness",
        title: "친절",
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

    vuetifyButton: {},
    buttonLiked: {
      color: "deep-orange",
      outlined: false,
      rounded: true,
      small: true,
      class: "mr-2 white--text",
    },
    buttonUnliked: {
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
    try {
      await this.fetch();

      this.vuetifyButton = (await agencyApi.isUserLikeThisAgency(this.agency.id, this.user.id))
        ? this.buttonLiked
        : this.buttonUnliked;

      this.$store.subscribe(async (mutation) => {
        if (mutation.type === "UPDATE_AGENCY") {
          this.clear();
          await this.fetch();
        }
      });
    } catch (err) {
      console.error(err);
    }
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
        if (await agencyApi.isUserLikeThisAgency(this.agency.id, this.user.id)) {
          await agencyApi.updateLikes(this.agency.id, { userId: this.user.id, operation: "decrease" });
          this.vuetifyButton = this.buttonUnliked;
          alert("'좋아요'를 취소했어요.");
        } else {
          await agencyApi.updateLikes(this.agency.id, { userId: this.user.id, operation: "increase" });
          this.vuetifyButton = this.buttonLiked;
          alert("이 부동산을 좋아합니다.");
        }
      } catch (err) {
        console.error(err);
      }
    },

    async onLikeReview(userId) {
      try {
        if (
          await reviewApi.isUserLikeThisReview({
            agencyId: this.agency.id,
            writerId: userId,
            userId: this.user.id,
          })
        ) {
          await reviewApi.updateLikes({
            agencyId: this.agency.id,
            writerId: userId,
            userId: this.user.id,
            operation: "decrease",
            increment: -1,
          });
          alert("'좋아요'를 취소했어요.");
        } else {
          await reviewApi.updateLikes({
            agencyId: this.agency.id,
            writerId: userId,
            userId: this.user.id,
            operation: "increase",
            increment: 1,
          });
          alert("이 리뷰를 좋아합니다.");
        }
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
        this.reviews["like"] = await reviewApi.getReviewsByLikeOrder(this.agency.id, maxRange);
        this.reviews["time"] = await reviewApi.getReviewsByTimeOrder(this.agency.id, maxRange);
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
  margin: 6px;
}

.reviews_button_container {
  display: flex;
  align-items: center;

  margin: 16px 18px;
}

.reviews_tabs_container {
  margin: 0px 18px;
}

.reviews_tabs_title {
  margin-top: 40px;
}
</style>
