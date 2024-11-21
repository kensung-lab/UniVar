<template>
  <div>
    <div class="q-pa-md">
      <router-link to="/upload">
        <q-btn label="Upload new sample" type="submit" color="primary" icon='upload' class='upload-btn-dashboard'></q-btn>
      </router-link>
      <q-table
        flat bordered
        :rows="rows"
        :columns="columns"
        row-key="name"
        class='dashboard-table'
        :pagination="initialPagination"
      >
        <template v-slot:body="props">
          <q-tr :props="props" :style="(props.row.is_example) ? 'background: #e2ebff' : ''" @click='openSample($event,props.row.database_name, props.row.status)'>
            <q-td key="display_name" :props="props">
              <div class='sample-name-btn'>
                <div v-if="(props.row.status === 1)">
                  {{ props.row.display_name }} <span v-if="props.row.is_example"> (Example)</span>
                </div>
                <div v-else @click='stillProcessing()'>
                  {{ props.row.display_name }}
                </div>
              </div>
            </q-td>
            <q-td key="create_time" :props="props">
              <q-badge color="blue">
                {{ props.row.create_time }}
              </q-badge>
            </q-td>
            <q-td key="finished_time" :props="props">
              <q-badge color="green" v-if='(props.row.finished_time && props.row.finished_time !== "")'>
                {{ props.row.finished_time }}
              </q-badge>
            </q-td>
            <q-td key="status" :props="props">
              <div v-if='(props.row.status === 0)'>
                <q-badge color="blue">
                  <svg class="q-spinner q-processing" width="1em" height="1em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" stroke="currentColor" stroke-width="5" stroke-miterlimit="10" d="M58.4,51.7c-0.9-0.9-1.4-2-1.4-2.3s0.5-0.4,1.4-1.4 C70.8,43.8,79.8,30.5,80,15.5H70H30H20c0.2,15,9.2,28.1,21.6,32.3c0.9,0.9,1.4,1.2,1.4,1.5s-0.5,1.6-1.4,2.5 C29.2,56.1,20.2,69.5,20,85.5h10h40h10C79.8,69.5,70.8,55.9,58.4,51.7z"></path><clipPath id="uil-hourglass-clip1"><rect x="15" y="20" width="70" height="25"><animate attributeName="height" from="25" to="0" dur="1s" repeatCount="indefinite" values="25;0;0" keyTimes="0;0.5;1"></animate><animate attributeName="y" from="20" to="45" dur="1s" repeatCount="indefinite" values="20;45;45" keyTimes="0;0.5;1"></animate></rect></clipPath><clipPath id="uil-hourglass-clip2"><rect x="15" y="55" width="70" height="25"><animate attributeName="height" from="0" to="25" dur="1s" repeatCount="indefinite" values="0;25;25" keyTimes="0;0.5;1"></animate><animate attributeName="y" from="80" to="55" dur="1s" repeatCount="indefinite" values="80;55;55" keyTimes="0;0.5;1"></animate></rect></clipPath><path d="M29,23c3.1,11.4,11.3,19.5,21,19.5S67.9,34.4,71,23H29z" clip-path="url(#uil-hourglass-clip1)" fill="currentColor"></path><path d="M71.6,78c-3-11.6-11.5-20-21.5-20s-18.5,8.4-21.5,20H71.6z" clip-path="url(#uil-hourglass-clip2)" fill="currentColor"></path><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="180 50 50" repeatCount="indefinite" dur="1s" values="0 50 50;0 50 50;180 50 50" keyTimes="0;0.7;1"></animateTransform></g></svg>
                  Processing....
                </q-badge>
              </div>
              <div v-else>
                <q-badge
                  color="green"
                  class='variant-table-btn'
                >
                  <div>
                    <q-icon name="check_circle_outline" class="process_success"></q-icon>
                    Success
                  </div>
                </q-badge>
              </div>
            </q-td>
            <q-td key="delete" :props="props">
              <div @click.stop="onClickDeleteSample(props.row.database_name)" >
                <div v-if='(props.row.status !== 0 && props.row.is_example !== true)'>
                  <q-badge
                    color="red"
                    class='variant-table-btn delete-sample'
                  >
                    <div>
                      <q-icon name="cancel" class="process_delete"></q-icon>
                      Delete
                    </div>
                  </q-badge>
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <div v-if="this.$route?.query?.job_id">
        <div class="job-description">
          <span c lass>* Please bookmark or save this <a :href="currentUrl">URL</a> to retrieve the job status later</span>
          <q-btn color="primary-hkgi" label="Bookmark" icon="star" class="geneTableBtn url-btn" @click="createBookmark"/>
          <q-btn color="primary-hkgi" label="Copy URL" icon="content_copy" class="geneTableBtn url-btn" @click="copyURLToClipboard"/>
        </div>
        <div>* Your uploaded files will be ready within a day, the Job ID: {{ this.$route?.query?.job_id }}</div>
      </div>
    </div>
  </div>
  <q-dialog v-model="confirmDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white"></q-avatar>
        <span class='change-read-text'>
          Are you sure to delete this sample? <br>
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Confirm" color="primary" class="mark-as-read confirm-btn" v-close-popup @click="onConfirmDeleteSample"></q-btn>
        <q-btn flat label="Cancel" color="red" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- <vue-cookie-accept-decline
    :debug="false"
    :disableDecline="false"
    :showPostponeButton="false"
    elementId="myPanel1"
    position="bottom-right"
    ref="myPanel1"
    transitionName="slideFromBottom"
    type="floating"
  >
    <template #postponeContent>&times;</template>

    <template #message>
      We use cookies to ensure you get the best experience on our website.
      <a href="https://cookiesandyou.com/" target="_blank">Learn More...</a>
    </template>

    <template #acceptContent>Accept all cookies</template>

    <template #declineContent>Necessary cookies only</template>
  </vue-cookie-accept-decline> -->
</template>


<style>
@import '@/assets/styles/dashboard.css';
</style>

<script>
import router from '@/router'
import store from '@/store/store'

export default {
  name: 'DashBoard',
  data() {
    return {
      columns :[
        { name: 'display_name', label: 'Samples Name', field: 'display_name', align :'left' , sortable: true},
        { name: 'create_time',  label: 'Upload Datetime', field: 'create_time', align :'left' , sortable: true},
        { name: 'finished_time',  label: 'Finish Datetime', field: 'finished_time' , align :'left' , sortable: true},
        { name: 'status',  label: 'Status', field: 'status' , align :'left' , sortable: true},
        { name: 'delete',  label: 'Delete', field: 'status' , align :'left' , sortable: true}
      ],
      rows : [],
      initialPagination: {
        descending: false,
        page: 0,
        rowsPerPage: 10
      },
      confirmDialog :false,
      onSelectSample : "",
      currentUrl: window.location.href,
      refreshInterval: null,
    }
  },

  async created() {
    if (this.$route?.query?.job_id) {
      const token = this.$route.query.job_id;
        localStorage.setItem("sso-token", token);
        this.ssoToken = token
        this.userProfile.username = this.$route.query.job_id;
        this.userInfo.username = this.$route.query.job_id;
        store.commit('updateSSOToken', token);

        console.log('come?');
    }

    await this.getDatabaseList();
  },
  mounted() {
    const that = this;
    this.refreshInterval = setInterval(async () => {
      that.rows = await store.getters.getApiService.getDatabaseListAll();
    }, 10000);
  },
  unmounted() {
    clearInterval(this.refreshInterval);
  },
  methods: {
    async getDatabaseList(){
      this.rows = await store.getters.getApiService.getDatabaseListAll();
    },
    openSample(event,sample,status){
      console.log(event.target.className)
      if(status === 0){
        this.stillProcessing()
      } else {
        localStorage.setItem("db", sample)
        router.push({ name: 'VariantTable' });
      }
    },
    stillProcessing(){
      this.$q.notify({
        group: true,
        timeout: 1000,
        icon: 'warning',
        message: 'This sample is still in processing.',
        type: 'negative'
      })
    },
    onClickDeleteSample(sample) {
      this.confirmDialog = true
      this.onSelectSample = sample
    },
    async onConfirmDeleteSample(){
      let result = await store.getters.getApiService.deletePipeline(this.onSelectSample);
      if (result.status === 200) {
        await this.getDatabaseList();
      }
    },
    createBookmark() {
      if (window.sidebar?.addPanel) { // Firefox <23
        window.sidebar.addPanel(document.title,window.location.href,'');
      } else if(window.external && ('AddFavorite' in window.external)) { // Internet Explorer
        window.external.AddFavorite(location.href,document.title); 
      } else if(window.opera && window.print || window.sidebar && ! (window.sidebar instanceof Node)) { // Opera <15 and Firefox >23
        /**
         * For Firefox <23 and Opera <15, no need for JS to add to bookmarks
         * The only thing needed is a `title` and a `rel="sidebar"`
         * To ensure that the bookmarked URL doesn't have a complementary `#` from our trigger's href
         * we force the current URL
         */
        triggerBookmark.attr('rel', 'sidebar').attr('title', document.title).attr('href', window.location.href);
        return true;
      
      } else { // For the other browsers (mainly WebKit) we use a simple alert to inform users that they can add to bookmarks with ctrl+D/cmd+D
        
        alert('You can add this page to your bookmarks by pressing ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D on your keyboard.');
      
      }
      // If you have something in the `href` of your trigger
      return false;
    },
    copyURLToClipboard(){
      let url = window.location.href;

      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.clipboard = url
      setTimeout(() => {
        this.clipboard = ""
      }, 3000)

      this.$q.notify({
        group: true,
        icon: 'done',
        type: 'positive',
        spinner: false,
        message: 'URL copied to Clipboard',
        timeout: 1000
      })
    },
  }
}
</script>
