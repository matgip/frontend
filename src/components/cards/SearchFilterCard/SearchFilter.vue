<template>
  <div id="search_filter_container">
    <header>
      <h3>검색 필터</h3>
    </header>
    <section>
      <BaseCheckBoxGroup :check-box-object="checkBox" :on-change="emitChange" />

      <div class="search_filter_button_container divider">
        <BaseButton :btn-props="vuetifyCloseButton" :on-click="onCloseCard" :button="'취소'" />
        <BaseButton :btn-props="vuetifyApplyButton" :on-click="onApplyFilter" :button="'적용'" />
      </div>
    </section>
  </div>
</template>

<script>
import BaseCheckBoxGroup from "@/common/BaseCheckBoxGroup.vue";
import BaseButton from "@/common/BaseButton.vue";

export default {
  components: {
    BaseCheckBoxGroup,
    BaseButton,
  },

  data() {
    return {
      checkBox: {
        name: "filter",
        title: "정렬 필터",
        select: null,
        items: [
          { value: "orderByViews", text: "조회수" },
          { value: "orderByRating", text: "평점순" },
        ],
      },

      vuetifyCloseButton: {
        color: "deep-orange",
        outlined: true,
        small: true,
        class: "my-3",
      },

      vuetifyApplyButton: {
        color: "deep-orange",
        outlined: true,
        small: true,
        class: "ma-3",
      },
    };
  },

  methods: {
    emitChange(name, newSelect) {
      this.checkBox.select = newSelect;
    },

    onApplyFilter() {
      this.$emit("apply-filter", this.checkBox.select);
    },

    onCloseCard() {
      this.$emit("close-filter-card");
    },
  },
};
</script>

<style>
#search_filter_container {
  margin: 14px;
}

#search_filter_container header {
  border-top: solid 1px #dcdcdc;
  padding-top: 12px;
}

.search_filter_button_container {
  display: flex;
  justify-content: flex-end;
}

.divider {
  margin: 4px 4px;

  border-top: 2px solid #e0e0e0;
  border-radius: 0;
}
</style>
