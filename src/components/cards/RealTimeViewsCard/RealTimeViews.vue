<template>
  <div id="realtime_views_container">
    <h3>실시간 인기 부동산</h3>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log(this.agenciesTopHits);
  },

  props: {
    agenciesTopHits: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style>
#realtime_views_container {
  margin: 14px;

  display: flex;
  justify-content: space-between;
  align-content: center;
}
</style>
