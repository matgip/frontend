import { ModeAPI } from "../service";

class AgencyAPI extends ModeAPI {
  async searchByKeyword(keyword) {
    try {
      const resp = await this.api.get(this.getUrl("search"), {
        params: {
          keyword: keyword,
        },
      });
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async searchByCenter(lng, lat) {
    try {
      const resp = await this.api.get(this.getUrl("search"), {
        params: {
          x: lng,
          y: lat,
        },
      });
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async searchByRect(swLat, swLng, neLat, neLng) {
    try {
      const resp = await this.api.get(this.getUrl("search"), {
        params: {
          swLat: swLat,
          swLng: swLng,
          neLat: neLat,
          neLng: neLng,
        },
      });
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async increaseViews(agencyId, viewEntity) {
    try {
      const resp = await this.put(agencyId, viewEntity);
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async increaseLikes(agencyId, likeEntity) {
    try {
      const resp = await this.api.put(this.getUrl(agencyId) + "/likes", likeEntity);
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getViews(agencyId) {
    try {
      const resp = await this.api.get(this.getUrl(agencyId) + "/views");
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getLikes(agencyId, userId) {
    try {
      const resp = await this.api.get(this.getUrl(agencyId) + "/likes", {
        params: {
          userId: userId,
        },
      });
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getTopHits() {
    try {
      const resp = await this.api.get(this.getUrl("realtime_agencies_views" + "?range=0~14"));
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

export default new AgencyAPI("agency");
