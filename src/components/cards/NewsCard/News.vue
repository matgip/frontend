<template>
  <div id="news_container">
    <header>
      <h3>부동산 뉴스</h3>
    </header>

    <div class="divider" />

    <div v-for="(n, i) in news" :key="i">
      <div class="news_item">
        <a :href="n.link" class="link">
          <h5 class="title">{{ n.title | strippedContent }}</h5>
        </a>
        <div class="news_summary_container">
          <p class="news_summary">{{ n.description | strippedContent }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    news: {
      type: Array,
      required: true,
    },
  },

  filters: {
    strippedContent: function(string) {
      return string.replace(/<\/?[^>]+>/gi, " ").replace(/&quot;/g, '"');
    },
  },
};
</script>

<style>
#news_container {
  margin: 14px;
}

#news_container header {
  display: flex;
  justify-content: space-between;
  align-content: center;

  margin-bottom: 8px;
}

.divider {
  border-top: solid 1px #dcdcdc;
}

.news_item {
  position: relative;
  border-bottom: 1px solid #eaebed;
}

.news_item .link {
  display: block;
  cursor: pointer;
  padding: 20px 20px 12px;
}

a {
  text-decoration: none;
}

.news_item .title {
  display: inline;
  font-size: 17px;
  font-weight: 600;
}

.news_summary_container {
  padding: 0 20px 10px;
  padding-bottom: 20px;
}

.news_summary {
  color: #333;
  font-size: 14px;
}
</style>
