<template>
  <div id="news_container">
    <header>
      <h3>부동산 뉴스</h3>
    </header>

    <div class="divider" />

    <v-tabs color="deep-orange" v-model="selected">
      <v-tab>
        투자심리
      </v-tab>
      <v-tab>
        실거래가
      </v-tab>
      <v-tab>
        규제
      </v-tab>
    </v-tabs>

    <div v-for="n in news[selected]" :key="n.title">
      <div class="news_item">
        <a :href="n.link" target="_blank" class="link">
          <h5 class="title">{{ n.title | strippedContent }}</h5>
          <span> - </span>
          <span> {{ n.pubDate | diffTime }} </span>
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
      await Promise.all(
        this.sections.map(async (section) => {
          const response = await newsApi.get({
            keyword: section.keyword,
            size: section.size,
          });
          this.news.push(response.items);
        })
      );
    } catch (err) {
      console.error(err);
    }
  },

  data() {
    return {
      selected: -1,
      news: [],
      sections: [
        { keyword: "부동산 투자심리", size: 10 },
        { keyword: "부동산 규제", size: 10 },
        { keyword: "부동산 실거래가", size: 10 },
      ],
    };
  },

  // watch: {
  //   news: function() {
  //     if (this.news[0].length !== 0) this.$emit("on-upload-complete");
  //   },
  // },

  filters: {
    diffTime: function(publised) {
      const oneMinute = 60 * 1000;
      const oneHour = oneMinute * 60;
      const oneDay = oneHour * 24;

      const pubDate = new Date(publised);
      const current = new Date();
      const diff = current.getTime() - pubDate.getTime();
      if (diff < oneMinute) {
        return "몇 초전";
      } else if (diff < oneHour) {
        const passedMinutes = Math.floor(diff / oneMinute);
        return `${passedMinutes} 분전`;
      } else if (diff < oneDay) {
        const passedHours = Math.floor(diff / oneHour);
        return `${passedHours} 시간 전`;
      } else {
        const passedDays = Math.floor(diff / oneDay);
        return `${passedDays} 일 전`;
      }
    },

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
  border-top: solid 2px #dcdcdc;
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

span {
  font-size: 12px;
  color: gray;
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
