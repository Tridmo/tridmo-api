import { IPagination } from "../interface/pagination.interface"
import { IDefaultQuery } from "../interface/query.interface"

const buildPagination = (dataLength: number, sorts: IDefaultQuery): IPagination => {
  const { page, limit } = sorts

  const pagesCount: number = Math.ceil(dataLength / limit)
  const nextPage: number = page + 1 > pagesCount ? null : page + 1
  const pagination: IPagination = {
    data_count: Number(dataLength),
    pages: pagesCount,
    current: page,
    next: nextPage,
    limit: limit
  }
  return pagination
}

export default buildPagination