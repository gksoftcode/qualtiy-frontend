<script>
import { Bar } from "vue-chartjs";

export default {
  extends: Bar,
  props: { chartData: Object },
  watch: {
    chartData: function () {
      this.renderChart(this.chartData, this.options);
    },
  },
  data() {
    return {
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            },
          ],
          xAxes: [
            {
              barPercentage: 0.2,
              gridLines: {
                display: false,
              },
            },
          ],
        },
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