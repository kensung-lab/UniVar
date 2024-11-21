import { PagingRequest } from '../requests';

export class Paging {
  total_count: number;
  filtered_total_count: number;
  current_page: number;
  per_page: number;
  total_page: number;

  constructor(pagingRequest: PagingRequest) {
    this.current_page = pagingRequest.page + 1;
    this.per_page = pagingRequest.per_page;
  }
}
