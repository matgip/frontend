import { ModeAPI } from "../service";

class NestedAPI extends ModeAPI {
  subResources;

  constructor(baseResource, subResources) {
    super(baseResource);
    if (!subResources) throw new Error("Sub resource is not provided");
    this.subResources = subResources;
  }

  getUrl(baseId, subIds = [], range = "") {
    if (!baseId) throw Error("base id is not provided");
    let url = `${this.baseURL}/${this.resource}/${baseId}`;
    this.subResources.forEach((subResource, idx) => {
      url += `/${subResource}`;
      if (subIds[idx]) url += `/${subIds[idx]}`;
    });
    if (range.length > 0) {
      url += `?range=${range}`;
    }
    return url;
  }

  async get(getEntity) {
    try {
      const { baseId, subIds, range } = getEntity;
      if (!baseId) throw Error("id is not provided");
      const resp = await this.api.get(this.getUrl(baseId, subIds, range));
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }

  async post(postEntity) {
    try {
      const { baseId, subIds, data } = postEntity;
      if (!baseId) throw Error("base id is not provided");
      const resp = await this.api.post(this.getUrl(baseId, subIds), data);
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }

  async put(putEntity) {
    try {
      const { baseId, subIds, data } = putEntity;
      if (!baseId) throw Error("base id is not provided");
      const resp = await this.api.put(this.getUrl(baseId, subIds), data);
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }
}

class ReviewAPI extends NestedAPI {
  async fetch(agencyId, userId) {
    const response = await this.get({
      baseId: agencyId,
      subIds: [userId],
    });
    if (response === undefined) {
      throw new Error("Failed to get review");
    }
    return response.data;
  }
}

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

class ReviewByLikeAPI extends NestedAPI {
  async fetch(agencyId, queryRange) {
    const reviewsByLike = [];
    const response = await this.get({
      baseId: agencyId,
      range: queryRange,
    });
    if (response === undefined) {
      throw new Error("Failed to get review by like");
    }

    for (let data of response.data) {
      const likes = data.score;
      const userId = data.value.split(":")[1];

      const resp = await reviewApi.fetch(agencyId, userId);
      reviewsByLike.push(createReview(resp, { userId, likes }));
    }

    return reviewsByLike;
  }

  async added(agencyId, userId) {
    await this.put({
      baseId: agencyId,
      data: { user: userId, count: 1 },
    });
  }
}

class ReviewByTime extends NestedAPI {
  async fetch(agencyId, queryRange) {
    const reviewsByTime = [];
    const response = await this.get({
      baseId: agencyId,
      range: queryRange,
    });
    if (response === undefined) {
      throw new Error("Failed to get review by time");
    }

    for (let data of response.data) {
      const userId = data.value.split(":")[1];
      const resp = await reviewApi.fetch(agencyId, userId);
      reviewsByTime.push(createReview(resp, { userId }));
    }

    return reviewsByTime;
  }
}

class ReviewLike extends NestedAPI {
  async add(agencyId, writerUserId, likeUserId) {
    const response = await this.post({
      baseId: agencyId,
      subIds: [writerUserId],
      data: {
        user: likeUserId,
      },
    });
    if (response === undefined) {
      throw new Error("Failed to update review like count");
    }

    return response.data;
  }
}

export const reviewApi = new ReviewAPI("reviews", ["users"]);
export const reviewByLikeApi = new ReviewByLikeAPI("reviews", ["likes"]);
export const reviewByTimeApi = new ReviewByTime("reviews", ["time"]);
export const reviewLikeApi = new ReviewLike("reviews", ["users", "likes"]);
