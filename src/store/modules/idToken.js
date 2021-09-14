import axios from "../../axios-auth";

const state = {
  idToken: null,
};
const mutations = {
  updateIdToken(state, idToken) {
    state.idToken = idToken;
  },
};
const actions = {
  signup({ commit }, authData) {
    axios
      .post(`/accounts:signUp?key=${this.$store.getters.APIKEY}`, {
        email: authData.email,
        password: authData.secondPassword,
        returnSecureToken: true,
      })
      .then((response) => {
        commit("updateIdToken", response.data.idToken);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  signin({ commit }, authData) {
    axios
      .post(`/accounts:signInWithPassword?key=${this.$store.getters.APIKEY}`, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      })
      .then((response) => {
        commit("updateIdToken", response.data.idToken);
      });
  },
};

export default {
  state,
  mutations,
  actions,
};
