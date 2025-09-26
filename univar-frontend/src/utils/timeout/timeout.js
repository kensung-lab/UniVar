import store from "../../store/store";

/**
 * @description
 * pop up the dialog to notify the user that it is going to be session timeout
 */
export async function onIdle() {
  const interval = await store.getters.getAutoRefreshToken;
  if(interval) {
    clearInterval(interval);
  }
  store.commit('updateAutoRefreshToken', null);
  store.commit('updateNearlyExpire', true);
}

export async function onActive() {
  await store.getters.getApiService.getKeycloakToken();
  store.commit('updateAutoRefreshToken',   
    setInterval(async () => {
      await store.getters.getApiService.getKeycloakToken();
    }, 10 * 60 * 1000), // auto renew the session each 10 mins
  );
}
