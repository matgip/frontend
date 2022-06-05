<template>
  <div id="reviews_container">
    <div class="reviews" v-for="(review, i) in reviews" :key="i">
      <ReviewCard :review="review" />
    </div>
  </div>
</template>

<script>
import { userApi } from "../../../../api/user";
import { mapGetters } from "vuex";
import ReviewCard from "./ReviewCard.vue";

export default {
  components: {
    ReviewCard,
  },

  async mounted() {
    try {
      this.reviews = await userApi.getReviewsByUser(this.user.id);
    } catch (err) {
      console.error(err);
    }
  },
  computed: {
    ...mapGetters({
      user: "GET_USER",
    }),
  },
  data() {
    return {
      reviews: [],
    };
  },
};
</script>

<style>
#reviews_container {
  margin-right: 10px;
}

.reviews {
  margin-bottom: 8px;
}
</style>
