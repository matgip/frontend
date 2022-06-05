import { ModeAPI } from "../service";

class ReviewAPI extends ModeAPI {
  async getReview(agencyId, userId) {
    const response = await this.api.get(this.getUrl(agencyId) + `/user/${userId}`);
    if (response === undefined) {
      throw new Error("Failed to get review");
    }
    return response.data;
  }

  async getReviewsByTimeOrder(agencyId, query) {
    const response = await this.api.get(this.getUrl(agencyId) + `/times`, {
      params: {
        range: query,
      },
    });
    if (response === undefined) {
      throw new Error("Failed to get review by time");
    }
    return response.data;
  }

  async getReviewsByLikeOrder(agencyId, query) {
    const response = await this.api.get(this.getUrl(agencyId) + `/likes`, {
      params: {
        range: query,
      },
    });
    if (response === undefined) {
      throw new Error("Failed to get review by like");
    }
    return response.data;
  }

  async isUserLikeThisReview(likeEntity) {
    const { agencyId, writerId, userId } = likeEntity;
    try {
      const resp = await this.api.get(this.getUrl(agencyId) + `/writer/${writerId}/likes`, {
        params: {
          userId: userId,
        },
      });
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async postReview(agencyId, postEntity) {
    try {
      const resp = await this.api.post(this.getUrl(agencyId) + "/user", postEntity);
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateLikes(likeEntity) {
    const { agencyId, writerId, userId, operation, increment } = likeEntity;
    const response = await this.api.put(this.getUrl(agencyId) + `/writer/${writerId}/likes`, {
      userId: userId,
      operation: operation,
      increment: increment,
    });
    if (response === undefined) {
      throw new Error("Failed to update review like count");
    }

    return response.data;
  }
}

export const reviewApi = new ReviewAPI("review");
