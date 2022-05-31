<template>
  <div>
    <apexcharts type="donut" width="400" height="400" :options="chartOptions" :series="series" />
  </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
  components: {
    apexcharts: VueApexCharts,
  },

  props: {
    series: {
      type: Array,
      required: true,
    },
    labels: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      chartOptions: {
        chart: {
          type: "donut",
        },
        labels: this.labels,
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 280,
              },
              legend: {
                position: "right",
              },
            },
          },
        ],
      },
    };
  },
};
</script>

<style></style>
