// Reference: Smart api module for VueJS
// https://itnext.io/vue-tricks-smart-api-module-for-vuejs-b0cae563e67b
import axios from "axios";

class BaseAPI {
  baseURL = "api";
  resource;
  api;

  constructor(resource) {
    if (!resource) throw new Error("Resource is not provided");
    this.resource = resource;
    this.api = axios.create({
      // baseURL: this.baseURL,
    });
  }

  getUrl(id = "") {
    return `${this.baseURL}/${this.resource}/${id}`;
  }

  handleError(err) {
    console.log({ message: "Errors is handled here", err });
  }
}

class ReadOnlyAPI extends BaseAPI {
  constructor(resource) {
    super(resource);
  }

  async fetch(config = {}) {
    try {
      const resp = await this.api.fetch(this.getUrl(), config);
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }

  async get(id = "") {
    try {
      const resp = await this.api.get(this.getUrl(id));
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }
}

export class ModeAPI extends ReadOnlyAPI {
  constructor(resource) {
    super(resource);
  }

  async post(data = {}) {
    try {
      const resp = await this.api.post(this.getUrl(), data);
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }

  async put(id, data = {}) {
    if (!id) throw Error("id is not provided");
    try {
      const resp = await this.api.put(this.getUrl(id), data);
      return resp;
    } catch (err) {
      this.handleError(err);
    }
  }

  async delete(id) {
    if (!id) throw Error("id is not provided");
    try {
      await this.api.delete(this.getUrl(id));
      return true;
    } catch (err) {
      this.handleError(err);
    }
  }
}

export const $api = {
  likes: new ModeAPI("likes"),
  // review: new NestedAPI("reviews", ["users"]),
  // // reviewCount: new NestedAPI("reviews", ["count"]),
  // // reviewRatings: new NestedAPI("reviews", ["ratings"]),
  // reviewUserLikes: new NestedAPI("reviews", ["users", "likes"]),
  // reviewsByLike: new NestedAPI("reviews", ["likes"]),
  // reviewsByTime: new NestedAPI("reviews", ["time"]),
};
