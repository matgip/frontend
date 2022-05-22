import agencyApi from "@/api/agency";

const GET_AGENCY = "GET_AGENCY";
const CLEAR_AGENCY = "CLEAR_AGENCY";
const UPDATE_AGENCY = "UPDATE_AGENCY";

const isEmptyResponse = (resp) => {
  return resp && resp.status === 204;
};

const agencyStore = {
  state: {
    agency: {},
  },

  getters: {
    [GET_AGENCY](state) {
      return state.agency;
    },
  },

  mutations: {
    [UPDATE_AGENCY](state, agency) {
      state.agency = agency;
    },
    [CLEAR_AGENCY](state) {
      state.agency = {};
    },
  },

  actions: {
    async agencySelected({ commit }, agencyUser) {
      const { agencyId, userAge } = agencyUser;
      const response = await agencyApi.get(agencyId);
      if (isEmptyResponse(response)) {
        console.log("empty agency response...");
        return;
      }
      await agencyApi.increaseViews(agencyId, { agencyId: agencyId, ageRange: userAge });
      response.data.views = await agencyApi.getViews(agencyId);
      commit(UPDATE_AGENCY, response.data);
    },
  },
};

export default agencyStore;
