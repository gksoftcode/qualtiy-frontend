<script>
import { Pie } from "vue-chartjs";

export default {
  extends: Pie,
  props: { chartData: Object },
  watch: {
    chartData: function () {
      this.renderChart(this.chartData, this.options);
    },
  },
  data() {
    return {
      options: {
        legend: {
          display: true,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>