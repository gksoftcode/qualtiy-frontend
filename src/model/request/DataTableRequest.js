export default class DataTableRequest {
  constructor(currentPage, pageSize) {
    this.currentPage = currentPage
    this.pageSize = pageSize
    this.sortBy = ''
    this.sortDesc = false
    this.data = {}
  }
}
