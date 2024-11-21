import { createStore } from 'vuex';
import ApiService from '@/services/api-service';

const store = createStore({
  state: {
    ssoToken: null,
    isExporting: false,
    apiService: ApiService,
    appVersion: 'internal',
    autoRefreshToken: null,
    isNearlyExpire: false,
  },
  getters: {
    isExporting(state) {
      return state.isExporting;
    },
    getApiService(state) {
      return state.apiService;
    },
    getAppVersion(state) {
      return state.appVersion;
    },
    isNearlyExpire(state) {
      return state.isNearlyExpire;
    },
    getAutoRefreshToken(state) {
      return state.autoRefreshToken;
    },
    getSSOToken(state) {
      return state.ssoToken;
    }
  },
  mutations: {
    updateSSOToken(state, payload) {
      state.ssoToken = payload;
    },
    updateExporting(state, isExporting) {
      state.isExporting = isExporting;
    },
    updateAppVersion(state, appVersion) {
      state.appVersion = appVersion;
    },
    updateNearlyExpire(state, isNearlyExpire) {
      state.isNearlyExpire = isNearlyExpire;
    },
    updateAutoRefreshToken(state, autoRefreshToken) {
      state.autoRefreshToken = autoRefreshToken;
    },
  }
});

export default store;