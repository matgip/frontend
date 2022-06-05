<template>
  <div id="review_card">
    <div class="review_title_container">
      <h5>{{ review.agencyName }}</h5>
      <p class="review_title_time">{{ review.time }} 일 작성</p>
    </div>
    <div class="review_rating_container">
      <span>
        <v-rating v-bind="vuetifyRating" :value="parseFloat(review.rating)" />
      </span>
      <span class="review_rating_text">({{ review.rating }})</span>
    </div>
    <div class="review_contents_container">
      <div v-show="review.title" class="review_contents_title">{{ review.title }}</div>
      <div v-show="!review.title" class="review_contents_no_title">한줄 요약이 없어요</div>
      <div v-show="review.text" class="review_contents_text">{{ review.text }}</div>
      <div v-show="!review.text" class="review_contents_no_text">리뷰 내용이 없어요</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      vuetifyRating: {
        size: 12,
        color: "amber",
        dense: true,
        readonly: true,
        "half-increments": true,
      },
    };
  },

  props: {
    review: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
#review_card {
  background: #eaebed;
  border-radius: 10px;
}

.review_title_container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 8px 8px 0 8px;
}

.review_title_time {
  font-size: 12px;
}

.review_rating_container {
  padding-left: 10px;
}

.review_rating_container span {
  display: inline-block;
}

span.review_rating_text {
  font-size: 10px;
}

.review_contents_container {
  padding-left: 10px;
}

.review_contents_title {
  font-size: 12px;
}

.review_contents_no_title {
  font-size: 12px;
  color: gray;
}

.review_contents_text {
  font-size: 10px;
}

.review_contents_no_text {
  font-size: 10px;
  color: gray;
}
</style>
