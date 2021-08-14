<script>
import { Doughnut, mixins } from 'vue-chartjs'
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels'
export default {
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options', 'idx'],
  mounted() {
    this.addPlugin(ChartJsPluginDataLabels)
    this.renderChart(this.chartData, this.options)
  },
  watch: {
    idx() {
      this._data._chart.destroy()
      this.renderChart(this.chartData, this.options)
    }
  }
}
</script>
