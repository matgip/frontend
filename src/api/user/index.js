import { ModeAPI } from "../service";

class UserAPI extends ModeAPI {
  async getReviewsByUser(userId) {
    const response = await this.api.get(this.getUrl(userId) + "/reviews");
    if (response === undefined) {
      throw new Error("Failed to get reviews by user");
    }
    return response.data;
  }
}

export const userApi = new UserAPI("user");
