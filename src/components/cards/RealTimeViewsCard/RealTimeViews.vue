<template>
  <div id="realtime_views_container">
    <header>
      <h3>실시간 인기 부동산</h3>
      <div v-if="agenciesTopHits.length !== 0" class="realtime_views_basetime">
        {{ agenciesTopHits[0].baseTime }} 기준
      </div>
    </header>

    <div class="divider"></div>

    <ul class="realtime_view_list" v-for="(agency, i) in agenciesTopHits" :key="i">
      <li class="realtime_view_list_item">
        <div class="realtime_view_list_item_ranking">{{ i + 1 }}</div>
        <div class="realtime_view_list_item_agency_info">{{ agency.name }}</div>
        <div class="realtime_view_list_item_views">{{ agency.views }}명이 봤어요</div>
      </li>
      <li class="realtime_view_list_item">
        <div class="realtime_view_list_item_address_name">{{ agency.address_name }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
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
}

#realtime_views_container header {
  display: flex;
  justify-content: space-between;
  align-content: center;

  margin-bottom: 8px;
}

#realtime_views_container ul {
  padding-top: 12px;
}

.realtime_views_basetime {
  padding-top: 6px;

  font-size: 12px;
}

.realtime_view_list {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 0 6px;
  overflow: hidden;
  white-space: nowrap;
}

.realtime_view_list_item {
  display: table-row;
}

.realtime_view_list_item_ranking {
  display: table-cell;

  font-size: 16px;
  font-weight: bold;

  margin-right: 12px;
  width: 20px;
}

.realtime_view_list_item_agency_info {
  display: table-cell;
  width: 144px;
  padding-left: 12px;
  white-space: nowrap;
  vertical-align: middle;
}

.realtime_view_list_item_views {
  display: table-cell;
  font-size: 12px;
  color: #111;
  vertical-align: middle;
  padding-left: 6px;
  padding-right: 10px;
  text-align: right;
}

.realtime_view_list_item_address_name {
  display: table-cell;
  font-size: 12px;

  color: gray;

  padding-left: 32px;
}

.divider {
  border-top: solid 1px #dcdcdc;
}
</style>
