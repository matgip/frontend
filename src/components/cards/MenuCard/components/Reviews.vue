<template>
  <div id="reviews_container">
    <!-- <div v-for="(review, i) in reviews" :key="i">
      <Review :review="review" />
    </div> -->
  </div>
</template>

<script>
import { userApi } from "../../../../api/user";
import { mapGetters } from "vuex";

export default {
  async mounted() {
    try {
      this.reviews = await userApi.getReviewsByUser(this.user.id);
      console.log(this.reviews);
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
  background: #eaebed;
  margin-right: 10px;
}
</style>
