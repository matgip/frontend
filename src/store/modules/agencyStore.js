import agencyApi from "@/api/agency";

const GET_AGENCY = "GET_AGENCY";
const CLEAR_AGENCY = "CLEAR_AGENCY";
const UPDATE_AGENCY = "UPDATE_AGENCY";

const IS_EMPTY_REPLY = (resp) => {
  return resp && resp.status === 204;
};

const FETCH = async (agencyId) => {
  return await agencyApi.get(agencyId);
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
    async agencySelected({ commit }, agency) {
      const resp = await FETCH(agency.id);
      if (IS_EMPTY_REPLY(resp)) {
        console.log("empty response...");
        return;
      }
      commit(UPDATE_AGENCY, resp.data);
    },
  },
};

export default agencyStore;
