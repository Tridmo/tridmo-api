import StatsDao from "./stats.dao";
import { IDateFilters } from "./stats.interface";

export default class StatsService {
  private dao = new StatsDao()

  async getRegisteredUsersStats({ month, year }: IDateFilters) {

    const currentDate = new Date();
    month = month || currentDate.getMonth() + 1;
    year = year || currentDate.getFullYear();

    const daily_registers_results = await this.dao.getRegistersDaily({ month, year })
    const monthly_registers_results = await this.dao.getRegistersMonthly({ year })

    let daily_registers = []
    let monthly_registers = []

    const lastDay = new Date(year, month, 0);
    const daysCount = lastDay.getDate()

    daily_registers.length = daysCount
    monthly_registers.length = 12

    daily_registers.fill(0)
    monthly_registers.fill(0)

    for (let index = 0; index < daily_registers_results.length; index++) {
      const element = daily_registers_results[index];
      daily_registers[Number(element['day']) - 1] = Number(element['count'] || 0)
    }

    for (let index = 0; index < monthly_registers_results.length; index++) {
      const element = monthly_registers_results[index];
      monthly_registers[Number(element['month']) - 1] = Number(element['count'] || 0)
    }

    return {
      daily_registers,
      monthly_registers
    }
  }

  async getDownloadsStats({ month, year }: IDateFilters) {

    const currentDate = new Date();
    month = month || currentDate.getMonth() + 1;
    year = year || currentDate.getFullYear();

    const daily_downloads_results = await this.dao.getDownloadsDaily({ month, year })
    const monthly_downloads_results = await this.dao.getDownloadsMonthly({ year })

    let daily_downloads = []
    let monthly_downloads = []

    const lastDay = new Date(year, month, 0);
    const daysCount = lastDay.getDate()

    daily_downloads.length = daysCount
    monthly_downloads.length = 12

    daily_downloads.fill(0)
    monthly_downloads.fill(0)

    for (let index = 0; index < daily_downloads_results.length; index++) {
      const element = daily_downloads_results[index];
      daily_downloads[Number(element['day']) - 1] = Number(element['count'] || 0)
    }

    for (let index = 0; index < monthly_downloads_results.length; index++) {
      const element = monthly_downloads_results[index];
      monthly_downloads[Number(element['month']) - 1] = Number(element['count'] || 0)
    }

    return {
      daily_downloads,
      monthly_downloads
    }
  }

  async getInteriorsStats({ month, year }: IDateFilters) {

    const currentDate = new Date();
    month = month || currentDate.getMonth() + 1;
    year = year || currentDate.getFullYear();

    const daily_interiors_results = await this.dao.getInteriorsDaily({ month, year })
    const monthly_interiors_results = await this.dao.getInteriorsMonthly({ year })

    let daily_interiors = []
    let monthly_interiors = []

    const lastDay = new Date(year, month, 0);
    const daysCount = lastDay.getDate()

    daily_interiors.length = daysCount
    monthly_interiors.length = 12

    daily_interiors.fill(0)
    monthly_interiors.fill(0)

    for (let index = 0; index < daily_interiors_results.length; index++) {
      const element = daily_interiors_results[index];
      daily_interiors[Number(element['day']) - 1] = Number(element['count'] || 0)
    }

    for (let index = 0; index < monthly_interiors_results.length; index++) {
      const element = monthly_interiors_results[index];
      monthly_interiors[Number(element['month']) - 1] = Number(element['count'] || 0)
    }

    return {
      daily_interiors,
      monthly_interiors
    }
  }

  async getTagsStats({ month, year }: IDateFilters) {

    const currentDate = new Date();
    month = month || currentDate.getMonth() + 1;
    year = year || currentDate.getFullYear();

    const daily_tags_results = await this.dao.getTagsDaily({ month, year })
    const monthly_tags_results = await this.dao.getTagsMonthly({ year })

    let daily_tags = []
    let monthly_tags = []

    const lastDay = new Date(year, month, 0);
    const daysCount = lastDay.getDate()

    daily_tags.length = daysCount
    monthly_tags.length = 12

    daily_tags.fill(0)
    monthly_tags.fill(0)

    for (let index = 0; index < daily_tags_results.length; index++) {
      const element = daily_tags_results[index];
      daily_tags[Number(element['day']) - 1] = Number(element['count'] || 0)
    }

    for (let index = 0; index < monthly_tags_results.length; index++) {
      const element = monthly_tags_results[index];
      monthly_tags[Number(element['month']) - 1] = Number(element['count'] || 0)
    }

    return {
      daily_tags,
      monthly_tags
    }
  }

  async getDownloadsCount({ model_id, brand_id, user_id }) {
    const data = await this.dao.getDownloadsCount({ model_id, brand_id, user_id })
    return data;
  }

  async getTagsCount({ model_id, brand_id, user_id }) {
    const data = await this.dao.getDownloadsCount({ model_id, brand_id, user_id })
    return data;
  }

  async getBrandsWithMostDownloads({ limit, month, year, week }) {
    const data = await this.dao.getBrandsWithMostDownloads({ limit, month, year, week })
    return data;
  }

  async getCategoriesWithMostDownloads({ limit, month, year, week }) {
    const data = await this.dao.getCategoriesWithMostDownloads({ limit, month, year, week })
    return data;
  }

  async getMostDownloadedModels({ limit, month, year, week }) {
    const data = await this.dao.getMostDownloadedModels({ limit, month, year, week })
    return data;
  }


  async getBrandsWithMostTags({ limit, month, year, week }) {
    const data = await this.dao.getBrandsWithMostTags({ limit, month, year, week })
    return data;
  }

  async getCategoriesWithMostTags({ limit, month, year, week }) {
    const data = await this.dao.getCategoriesWithMostTags({ limit, month, year, week })
    return data;
  }

  async getMostUsedModels({ limit, month, year, week }) {
    const data = await this.dao.getMostUsedModels({ limit, month, year, week })
    return data;
  }
}