<template>
  <div id="news_container">
    <header>
      <h3>부동산 뉴스</h3>
    </header>

    <div class="divider" />

    <v-tabs color="deep-orange" v-model="selected">
      <v-tab>
        규제
      </v-tab>
      <v-tab>
        실거래가
      </v-tab>
    </v-tabs>

    <div v-for="n in news" :key="n.title">
      <div class="news_item">
        <a :href="n.link" target="_blank" class="link">
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
import { newsApi } from "@/api/news";

export default {
  async mounted() {
    try {
      const regulationNews = await newsApi.get({
        keyword: "부동산 규제",
        size: 10,
      });
      const priceNews = await newsApi.get({
        keyword: "부동산 실거래가",
        size: 10,
      });
      this.regulationNews = regulationNews.items;
      this.priceNews = priceNews.items;
      this.news = this.regulationNews;
    } catch (err) {
      console.error(err);
    }
  },

  data() {
    return {
      selected: -1,
      news: [],
      priceNews: [],
      regulationNews: [],
    };
  },

  watch: {
    selected(val) {
      switch (val) {
        case 0:
          this.news = this.regulationNews;
          break;
        case 1:
          this.news = this.priceNews;
          break;
      }
    },

    regulationNews: function() {
      if (this.regulationNews.length !== 0) this.$emit("scroll-up");
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
