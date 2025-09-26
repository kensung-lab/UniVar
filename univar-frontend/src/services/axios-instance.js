import axios from 'axios';
import keycloak from './keycloak';
import store from '../store/store';
import { Notify } from 'quasar'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

let cancel;

const instance = axios.create({
  baseURL: BACKEND_URL
});

// Request interceptor, Do something before request is sent
instance.interceptors.request.use(async function(config) {

  //console.log('axios interceptors')
  //console.log(config)
  //console.log(cancelTokenSource.queue)
  // if(cancelTokenSource.queue === "getVariants"){
  //   cancelTokenSource.cancel();
  // }

  let token = store.getters.getSSOToken ? store.getters.getSSOToken : 'anyone';
  if(keycloak?.profile) {
    let refreshed
    try {
       refreshed = await keycloak.updateToken(5);
    } catch (error) {
      console.error('Error:', error);
    }
  
    if (refreshed) {
      //console.log('Token refreshed. New token : ' + keycloak.token);
      store.commit('updateSSOToken', keycloak.token);
      localStorage.setItem("sso-token", keycloak.token);
    }
    token = keycloak.token;
  }


  config.headers['Authorization'] =  "Bearer "+ token
  if(config.request_method && config.request_method.name === "upload"){
    config.headers['Content-Type'] =  "multipart/form-data"
  } else {
    config.headers['Content-Type'] =  "application/json"
  }

  if(config.request_method && config.request_method.name === "getVariants") {
    if (cancel) {
      cancel('Request canceled by user.');
      cancel = undefined;
    }

    config.cancelToken = new axios.CancelToken(c => {
      cancel = c;
    });
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});



// Response interceptor, Do something with response data
instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {

  if(error.code === "ERR_CANCELED"){
    return Promise.reject(error);
  }
  console.log('error: ', error)
  if(error.response && error.response.status === 401){
    keycloak.logout()
    keycloak.login();
  }

  let msg;

  if (error.code === 'ERR_NETWORK' || error.response.status === 503 ) {
      msg = '<div class="error-msg-box">Network error. Please contact admin.' +'</div>';
  } else {
    if (error.response?.data) {
      let TrackNumber  =  error.response.data.track_number
      msg = '<div class="error-msg-box">' + error.response.data.error_message +
        '</div> <span class="error-track-number">[' + error.response.data.error_code + '] TrackNumber : ' + TrackNumber + '</span>'
    } else {
      msg = '<div class="error-msg-box">Error occurred. Please contact admin.' +
        '</div> <span class="error-track-number">[' + error.response.status + '] TrackNumber : ' + JSON.parse(error.config.data).track_number + '</span>'
    }
  }

  Notify.create({
    type: 'negative',
    message: msg,
    actions: [{ icon: 'close', color: 'white' }],
    timeout: '10000',
    html: true,
  })

  return Promise.reject(error);
});



export default instance;