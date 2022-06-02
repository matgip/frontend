import { ModeAPI } from "../service";

const mapUserLike = new Map();

function createReview(oReview, entity) {
  const { userId, likes } = entity;
  const review = Object.assign(oReview);
  review.userId = userId;
  if (likes === undefined) {
    review.likes = mapUserLike.get(`user:${userId}`);
  } else {
    review.likes = likes;
    mapUserLike.set(`user:${userId}`, likes);
  }
  review.rating = parseFloat(oReview.rating);
  return review;
}

class ReviewAPI extends ModeAPI {
  async getReview(agencyId, userId) {
    const response = await this.api.get(this.getUrl(agencyId) + `/users/${userId}`);
    if (response === undefined) {
      throw new Error("Failed to get review");
    }
    return response.data;
  }

  async getReviewsByTimeOrder(agencyId, query) {
    const reviews = [];
    const response = await this.api.get(this.getUrl(agencyId) + `/times`, {
      params: {
        range: query,
      },
    });
    if (response === undefined) {
      throw new Error("Failed to get review by time");
    }

    for (let data of response.data) {
      const userId = data.value.split(":")[1];
      const resp = await this.getReview(agencyId, userId);
      reviews.push(createReview(resp, { userId }));
    }

    return reviews;
  }

  async getReviewsByLikeOrder(agencyId, query) {
    const reviews = [];
    const response = await this.api.get(this.getUrl(agencyId) + `/likes`, {
      params: {
        range: query,
      },
    });
    if (response === undefined) {
      throw new Error("Failed to get review by like");
    }

    for (let data of response.data) {
      const likes = data.score;
      const userId = data.value.split(":")[1];

      const resp = await this.getReview(agencyId, userId);
      reviews.push(createReview(resp, { userId, likes }));
    }

    return reviews;
  }

  async isUserLikeThisReview(likeEntity) {
    const { agencyId, writerId, userId } = likeEntity;
    try {
      const resp = await this.api.get(this.getUrl(agencyId) + `/writers/${writerId}/likes`, {
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
      const resp = await this.api.post(this.getUrl(agencyId) + "/users", postEntity);
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async updateLikes(likeEntity) {
    const { agencyId, writerId, userId, operation, increment } = likeEntity;
    const response = await this.api.put(this.getUrl(agencyId) + `/writers/${writerId}/likes`, {
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

export const reviewApi = new ReviewAPI("reviews");
