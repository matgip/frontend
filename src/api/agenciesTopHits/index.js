import { ModeAPI } from "../service";

class AgenciesTopHitsApi extends ModeAPI {
  async get() {
    try {
      const resp = await this.api.get(this.getUrl() + "?range=0~15");
      return resp.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

export default new AgenciesTopHitsApi("realtime_agencies_views");
