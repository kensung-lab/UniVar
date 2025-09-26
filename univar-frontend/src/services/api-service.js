import axios from './axios-instance'
import keycloak from './keycloak'
import store from '../store/store'
import { Notify } from 'quasar'

const CRAM_URL = import.meta.env.VITE_CRAM_URL;

class ApiService {

  exportAwaitList = [];

  socket = null;

  getTrackNumber(){
    const username = keycloak?.profile?.username ? keycloak.profile.username : 'anyone';
    return username + ':' + Math.floor(new Date().valueOf() * Math.random())
  }

  async getKeycloakToken() {
    let result = 'anyone';

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
      result = keycloak.token;
    }

    return result;
  }

  async getCramUrl(selected_database, sample, type, variantInfo) {
    const params = new URLSearchParams(variantInfo);
    params.append('track_number', this.getTrackNumber())
    return CRAM_URL + '/cram/' + selected_database + '/' + sample + '/' + type + '?' + params.toString();
  }

  async getDatabaseList(){

    console.log('API Service getDatabaseList')

    let result = await axios.post('/database/list', JSON.stringify({ "track_number": this.getTrackNumber() }));

    let dbarr = [];

    if(result.status === 200 && (result.data.data).length > 0) {
      (result.data.data).forEach(el => {
        let dbObj = {}
        dbObj.label = el.display_name
        dbObj.value = el.database_name
        dbObj.is_standalone = el.is_standalone;
        dbObj.is_example = el.is_example;
        dbarr.push(dbObj)
      })
    }
    return dbarr;
  }

  async getSampleList(selected_database){

    console.log('API Service getSampleList')

    const params = JSON.stringify({
      "selected_database": selected_database,
      "track_number": this.getTrackNumber()
    });

    let result = await axios.post('/sample/list', params,{});

    (result.data.data).forEach(el => {
      el.cram = ""
      el.cram_idx = ""
    })

    return result.data.data
  }

  async getVariants(page, variantsPerPage, selected_database,variantsFilter,genePanel = null,sortingColumns, variantsSamples, selectedExomiser){

    console.log('API Service getVariants')

    const startTime = performance.now();

    let params = {
      "selected_database": selected_database,
      "track_number": this.getTrackNumber(),
      "page" : page,
      "per_page": variantsPerPage,
      "sort": sortingColumns,
      "filter": variantsFilter,
      "samples" : variantsSamples,
      "exomiser_run" : selectedExomiser?.run ? selectedExomiser.run : ""
    }

    if(genePanel !== null){
      params.panels = genePanel
    }

    let result
    try {
      result = await axios.post('/variant/find', JSON.stringify(params), { request_method: { name: "getVariants" } })
    } catch (error) {
        console.log("canceled previous request")
        return []
    }

    const endTime = performance.now();
    const responseTime = (endTime - startTime) /1000;

    console.log(`Response time: ${responseTime} seconds`);

    return result.data.data
  }

  async getGenePanelList(){
    let result = await axios.post('/gene-panel/list', JSON.stringify({ "track_number": this.getTrackNumber() }))

    let geneOptions = [];

    if(result.status === 200 && (result.data.data).length > 0) {
      (result.data.data).forEach(el => {
        let geneObj = {}
        geneObj.label = el.display_name
        geneObj.value = el._id
        geneOptions.push(geneObj)
      })
    }

    return geneOptions
  }

  async getBookmarkList(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    let result = await axios.post('/bookmark/list', params)

    let bookmarkResult = { filter : [], bookmark : []}

    if(result.status === 200 && (result.data.data).length > 0) {
      (result.data.data).forEach(el => {
        let bookmarkObj = {label : el.name, value : el.name , data : el}
        if(el.type === 'filter'){
          bookmarkResult['filter'].push(bookmarkObj)
        } else {
          bookmarkResult['bookmark'].push(bookmarkObj)
        }
      })
    }

    return bookmarkResult
  }

  async saveBookmarkFilter(name, variantsFilter, panels){

    //console.log(variantsFilter)

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "name" : name,
      "filters" : variantsFilter,
      "type": "filter",
      "panels" : panels,
      "is_share": false
    });

    let result = await axios.post('/bookmark/save', params)

    return result.status;
  }

  async saveBookmarkColumn(name, columns,variantsFilter, sortingColumns, panels){

    //console.log(columns)
    //console.log(variantsFilter)
    //console.log(sortingColumns)

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "name" : name,
      "filters" : variantsFilter,
      "columns" : columns,
      "sort" : sortingColumns,
      "type": "bookmark",
      "panels" : panels,
      "is_share": false
    });

    let result = await axios.post('/bookmark/save', params)

    return result.status;
  }

  async deleteBookmark(id){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "id" : id
    });

    let result = await axios.post('/bookmark/delete', params)

    return result.status;
  }

  async exportTSV(selected_database, variantsSamples, columns, sortingColumns, variantsFilter, genePanel, exomiserRun){
    const trackNumber = this.getTrackNumber();

    //Assign "Note" field in the beginning of the tsv file
    columns = Object.assign({}, { "note" : 1 }, columns);

    const params = JSON.stringify({
      "track_number": trackNumber,
      "selected_database": selected_database,
      "samples" : variantsSamples,
      "columns" : columns,
      "filter" : variantsFilter,
      "sort" : sortingColumns,
      "panels" : genePanel,
      "exomiser_run" : exomiserRun?.run
    });
    const response = await axios.post('/variant/export-tsv', params);

    const startTime = (new Date()).getTime();
    // this.getExportResult('tsv', trackNumber, null, startTime);
    let isRunning = false;
    const getExportTsvResult = setInterval(async () => {
      if(!isRunning) {
        isRunning = true;
        const getExportResultParam = {
          "track_number": this.getTrackNumber(),
          "orig_track_number": trackNumber,
        }
        try {
          const response = await axios.post('/variant/get-export-tsv', getExportResultParam)
    
          if(response && response.status == 200) {
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob([response.data]));
            downloadLink.download = 'variants.tsv';
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            store.commit('updateExporting', false);
            clearInterval(getExportTsvResult);
          }
          // after 30 mins
          if( (new Date()).getTime() - startTime > 1800000) {
            Notify.create({
              type: 'negative',
              message: 'Export Timeout, Please try again',
              actions: [{ icon: 'close', color: 'white' }],
              timeout: '5000',
              html: true,
            });
            store.commit('updateExporting', false);
            clearInterval(getExportTsvResult);
          }
        } catch(e) {
          store.commit('updateExporting', false);
          clearInterval(getExportTsvResult);
        }
        isRunning = false;
      }
    }, 2000);

    return response.status;
  }

  async exportVCF(selected_database, variantsSamples, sortingColumns, variantsFilter, genePanel,exomiserRun){
    const trackNumber = this.getTrackNumber();

    const params = JSON.stringify({
      "track_number": trackNumber,
      "selected_database": selected_database,
      "samples" : variantsSamples,
      "filter" : variantsFilter,
      "sort" : sortingColumns,
      "panels" : genePanel,
      "exomiser_run" : exomiserRun?.run
    });

    const response = await axios.post('/variant/export-vcf', params)

    const startTime = (new Date()).getTime();
    let isRunning = false;
    const getExportVcfResult = setInterval(async () => {
      if(!isRunning) {
        isRunning = true;
        const getExportResultParam = {
          "track_number": this.getTrackNumber(),
          "orig_track_number": trackNumber,
        }
        try {
          const response = await axios.post('/variant/get-export-vcf', getExportResultParam)
    
          if(response && response.status == 200) {
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob([response.data]));
            downloadLink.download = 'variants.vcf';
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            store.commit('updateExporting', false);
            clearInterval(getExportVcfResult);
          }
          // after 30 mins
          if( (new Date()).getTime() - startTime > 1800000) {
            Notify.create({
              type: 'negative',
              message: 'Export Timeout, Please try again',
              actions: [{ icon: 'close', color: 'white' }],
              timeout: '5000',
              html: true,
            });
            store.commit('updateExporting', false);
            clearInterval(getExportVcfResult);
          }
          isRunning = false;
        } catch(e) {
          store.commit('updateExporting', false);
          clearInterval(getExportVcfResult);
        }

      }
    }, 2000);

    return response.status;
  }

  async markAsRead(selected_database,updatedVariants ){

    const params = JSON.stringify({
      "selected_database": selected_database,
      "track_number": this.getTrackNumber(),
      "is_read": updatedVariants
    });

    let result = await axios.post('/variant/mark-read', params)

    return result.status;
  }

  async saveNote(selected_database,variant_object,tempNote ){

    const params = JSON.stringify({
      "selected_database": selected_database,
      "track_number": this.getTrackNumber(),
      "variant_object_id": variant_object._id,
      "note": tempNote,
      "is_share": false
    });

    let result = await axios.post('/variant/save-note', params)

    return result.status;
  }

  async getS3SignedUrl(selected_database, variantsSamples, variantInfo){

    let igvTracks = []
    //Only active sample will display in IGV
    variantsSamples.forEach(el => {
      if(el.active) {
        igvTracks.push({
          type: "alignment",
          name : el.name,
          url: () => this.getCramUrl(selected_database, el.name, 'cram', variantInfo),
          indexURL: () => this.getCramUrl(selected_database, el.name, 'index', variantInfo),
          format: "cram",
          oauthToken: () => this.getKeycloakToken(),
        })
      }
    });

    return igvTracks
  }

  async getLocalCramFile(variantsSamples){

    let igvTracks = []
    //Only active sample will display in IGV
    variantsSamples.forEach(el => {
      if(el.active && el.cram !== "" && el.cram !== null && el.cram_idx !== "" && el.cram_idx !== null) {
        igvTracks.push({
          type: "alignment",
          name : el.name,
          url: () => el.cram,
          indexURL: () =>  el.cram_idx,
          format: "cram",
          oauthToken: () => this.getKeycloakToken(),
        })
      }
    });

    return igvTracks
  }

  async getHpoTermVersion(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
    });

    return await axios.post('/hpo-term/version', params);
  }

  async getHpoTerm(version){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "version" : version
    });

    return await axios.post('/hpo-term', params);
  }

  async getPipelineInfo(selected_database){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "selected_database": selected_database,
    });

    return await axios.post('/pipeline/info', params);
  }

  async deletePipeline(selected_database){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "selected_database": selected_database,
    });

    return await axios.post('/pipeline/delete', params);
  }

  async getPipelineStandaloneInfo(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    return await axios.post('/pipeline/info/standalone', params);
  }

  async getCallerInfo(selected_database){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "selected_database": selected_database,
    });

    return await axios.post('/database/caller-info', params);
  }

  async getExomiserInfo(selected_database){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "selected_database": selected_database,
    });

    return await axios.post('/variant/get-exomiser-runs', params);
  }

  async deleteExomiserInfo(selected_database, exomiser_run){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "selected_database": selected_database,
      "exomiser_run" : exomiser_run
    });

    return await axios.post('/variant/delete-exomiser-run', params);
  }

  async runExomiser(selected_database, display_name, hpos, hpo, panels){

    const formData = new FormData();
    formData.append('track_number', this.getTrackNumber());
    formData.append('selected_database', selected_database);
    formData.append('display_name', display_name);
    if(hpo){
      formData.append('hpo', hpo);
    } else if (hpos) {
      formData.append('hpos', hpos);
    } else {
      formData.append('panels', panels);
    }

    return await axios.post('/pipeline/run-exomiser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      request_method: { name: "upload" }
    })
  }

  async getHPOExampleFile(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    return await axios.post('/pipeline/sample/hpo', params);
  }

  async getPEDExampleFile(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    return await axios.post('/pipeline/sample/ped', params);
  }

  async getSVExampleFile(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    return await axios.post('/pipeline/sample/sv', params,{
      responseType: 'blob'
    });
  }

  async getSNPExampleFile(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    return await axios.post('/pipeline/sample/snp', params,{
      responseType: 'blob'
    });
  }

  async getFile(type){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    let fileResult;
    if(type === "menu") {
      fileResult = await axios.post('/pipeline/sample/menu', params, {
        responseType: 'blob'
      });
    } else {
      fileResult = await axios.post('/pipeline/sample/tutorial', params, {
        responseType: 'blob'
      });
    }

    let str = fileResult.headers['content-disposition']
    let filename = str.substring(str.indexOf('"') + 1, str.lastIndexOf('"'));

    const blobData = new Blob([fileResult.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blobData);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename
    link.click();
  }

  async uploadPipelineFile(ped,snp,sv,proband_id,ped_group,svCallers,hpo,hpos,panels){

    const formData = new FormData();
    formData.append('track_number', this.getTrackNumber());
    formData.append('ped', ped);
    formData.append('snp', snp);
    formData.append('probandId',proband_id)
    formData.append('peds', JSON.stringify(ped_group))
    formData.append('svCallers', JSON.stringify(svCallers))
    formData.append('hpo',hpo)
    formData.append('hpos',hpos)
    formData.append('panels',panels)
    if(sv) {
      for (let i = 0; i < sv.length; i++) {
        formData.append('sv', sv[i])
      }
    }

    return await axios.post('/pipeline/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      request_method: { name: "upload" }
    })
  }

  async uploadPipelineFileGetPEDInfo(snp,sv){

    const formData = new FormData();
    formData.append('track_number', this.getTrackNumber());
    formData.append('snp', snp);
    if(sv) {
      for (let i = 0; i < sv.length; i++) {
        formData.append('sv', sv[i])
      }
    }

    return await axios.post('/pipeline/upload/vcfs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      request_method: { name: "upload" }
    })
  }


  async getDatabaseListAll(){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber()
    });

    let dbResult = await axios.post('/database/list/all', params)

    if(dbResult.status === 200 && dbResult.data.data && dbResult.data.data.length > 0){
      (dbResult.data.data).forEach(el => {
        const datetime = new Date(el.create_time);
        el.create_time = datetime.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" })
        if(el.finished_time){
          const datetime = new Date(el.finished_time);
          el.finished_time = datetime.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" })
        }
      })
    }

    return dbResult.data.data;
  }

  async getVariantExons(selected_database, variant_id){

    const params = JSON.stringify({
      "track_number": this.getTrackNumber(),
      "selected_database": selected_database,
      "variant_id": variant_id,
    });

    let result = await axios.post('/variant/find-exons', params)

    let exonsResult = null;
    if(result.status === 200 && result.data && result.data.data && result.data.data.exons && result.data.data.exons.length > 0) {
      exonsResult = result.data.data.exons
    }

    return exonsResult
  }

  async login(){
    await axios.get('/auth/login');
  }

  async logout() {
    await axios.get('/auth/logout');
  }


}

export default new ApiService();