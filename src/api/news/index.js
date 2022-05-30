import { ModeAPI } from "../service";

class NewsAPI extends ModeAPI {
  async get(query) {
    try {
      const resp = await this.api.get(this.getUrl(), {
        params: {
          keyword: query.keyword,
          size: query.size,
        },
      });
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

export const newsApi = new NewsAPI("news");
