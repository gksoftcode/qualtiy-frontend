export default class DataTableResponse {
  constructor(total, currentPage, pageSize) {
    this.total = total
    this.currentPage = currentPage
    this.pageSize = pageSize
    this.data = []
  }
}
