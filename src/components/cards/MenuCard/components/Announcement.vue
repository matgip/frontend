<template>
  <div id="anoucement_container">
    <div class="announcement" v-for="(announcement, i) in announcements" :key="i">
      <p>{{ announcement.title }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      announcements: [
        {
          title: "[공지] 신규 기능 추가: 내가 작성한 리뷰 확인!",
          content: "'오른쪽 상단 메뉴바 > 내가 작성한 리뷰'를 클릭하면 작성한 리뷰들을 확인할 수 있어요.",
        },
      ],
    };
  },

  methods: {},
};
</script>

<style>
#anoucement_container {
  background: #eaebed;

  padding: 8px;
  margin-right: 10px;

  border-radius: 10px;
}

.announcement p {
  font-size: 12px;
}

.announcement:hover {
  cursor: pointer;
  text-decoration: underline;
  color: black;
}
</style>
