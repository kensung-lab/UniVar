<template>
  <div>
    <div class="q-pa-md">
      <router-link to="/upload">
        <q-btn
          label="Upload new sample"
          type="submit"
          color="primary"
          icon="upload"
          class="upload-btn-dashboard"
          v-if="!checkLogin()"
        ></q-btn>
      </router-link>
      <q-table
        flat
        bordered
        :rows="rows"
        :columns="columns"
        row-key="name"
        class="dashboard-table"
        :pagination="initialPagination"
      >
        <template v-slot:body="props">
          <q-tr
            :props="props"
            :style="props.row.is_example ? 'background: #e2ebff' : ''"
            @click="openSample($event, props.row.database_name, props.row.status, props.row.is_error)"
          >
            <q-td key="display_name" :props="props">
              <div class="sample-name-btn">
                <div v-if="props.row.status === 1">
                  {{ props.row.display_name }} <span v-if="props.row.is_example"> (Example)</span>
                </div>
                <div v-else @click="stillProcessing()">
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
              <q-badge
                color="green"
                v-if="props.row.finished_time && props.row.finished_time !== ''"
              >
                {{ props.row.finished_time }}
              </q-badge>
            </q-td>
            <q-td key="status" :props="props">
              <div v-if="props.row.is_error">
                <q-badge color="red" class="variant-table-btn">
                  <div>
                    <q-icon name="cancel" class="process_delete"></q-icon>
                    Failed
                  </div>
                </q-badge>
              </div>
              <div v-else-if="props.row.status === 0">
                <q-badge color="blue">
                  <img src="@/assets/img/waiting.svg" class="q-spinner q-processing" />
                  Processing....
                </q-badge>
              </div>
              <div v-else>
                <q-badge color="green" class="variant-table-btn">
                  <div>
                    <q-icon name="check_circle_outline" class="process_success"></q-icon>
                    Success
                  </div>
                </q-badge>
              </div>
            </q-td>
            <q-td key="delete" :props="props">
              <div @click.stop="onClickDeleteSample(props.row.database_name)">
                <div v-if="props.row.status !== 0 && props.row.is_example !== true">
                  <q-badge color="red" class="variant-table-btn delete-sample">
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
          <span c lass
            >* Please bookmark or save this <a :href="currentUrl">URL</a> to retrieve the job status
            later</span
          >
          <q-btn
            color="primary"
            label="Bookmark"
            icon="star"
            class="gene-table-btn url-btn"
            @click="createBookmark"
          />
          <q-btn
            color="primary"
            label="Copy URL"
            icon="content_copy"
            class="gene-table-btn url-btn"
            @click="copyURLToClipboard"
          />
        </div>
        <div>
          * Your uploaded files will be ready within a day, the Job ID:
          {{ this.$route?.query?.job_id }}
        </div>
      </div>
    </div>
  </div>
  <q-dialog v-model="confirmDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white"></q-avatar>
        <span class="change-read-text"> Are you sure to delete this sample? <br /> </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Confirm"
          color="primary"
          class="mark-as-read confirm-btn"
          v-close-popup
          @click="onConfirmDeleteSample"
        ></q-btn>
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
      columns: [
        {
          name: 'display_name',
          label: 'Samples Name',
          field: 'display_name',
          align: 'left',
          sortable: true
        },
        {
          name: 'create_time',
          label: 'Upload Datetime',
          field: 'create_time',
          align: 'left',
          sortable: true
        },
        {
          name: 'finished_time',
          label: 'Finish Datetime',
          field: 'finished_time',
          align: 'left',
          sortable: true
        },
        { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
        { name: 'delete', label: 'Delete', field: 'status', align: 'left', sortable: true }
      ],
      rows: [],
      initialPagination: {
        descending: false,
        page: 0,
        rowsPerPage: 10
      },
      confirmDialog: false,
      onSelectSample: '',
      currentUrl: window.location.href,
      refreshInterval: null,
      userInfo: this.userInfo,
    }
  },

  async created() {
    if (this.$route?.query?.job_id) {
      const token = this.$route.query.job_id
      localStorage.setItem('sso-token', token)
      this.ssoToken = token
      this.userProfile.username = this.$route.query.job_id
      this.userInfo.username = this.$route.query.job_id
      store.commit('updateSSOToken', token)
    }

    await this.getDatabaseList()
  },
  mounted() {
    const that = this
    this.refreshInterval = setInterval(async () => {
      that.rows = await store.getters.getApiService.getDatabaseListAll()
    }, 10000)

    if (
      this.userInfo &&
      this.userInfo.groups &&
      this.userInfo.groups.includes(import.meta.env.VITE_NO_DEL_GROUP)
    ) {
      this.columns = this.columns.filter((column) => column.name !== 'delete')
    }
  },
  unmounted() {
    clearInterval(this.refreshInterval)
  },
  methods: {
    async getDatabaseList() {
      this.rows = await store.getters.getApiService.getDatabaseListAll()
    },
    openSample(event, sample, status, is_error) {
      if (is_error) {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'This sample failed in pipeline, please contact admin.',
          type: 'negative'
        })
      } else if (status === 0) {
        this.stillProcessing()
      } else {
        localStorage.setItem('db', sample)
        router.push({ name: 'VariantTable' })
      }
    },
    stillProcessing() {
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
    async onConfirmDeleteSample() {
      let result = await store.getters.getApiService.deletePipeline(this.onSelectSample)
      if (result.status === 200) {
        await this.getDatabaseList()
      }
    },
    createBookmark() {
      if (window.sidebar?.addPanel) {
        // Firefox <23
        window.sidebar.addPanel(document.title, window.location.href, '')
      } else if (window.external && 'AddFavorite' in window.external) {
        // Internet Explorer
        window.external.AddFavorite(location.href, document.title)
      } else if (
        (window.opera && window.print) ||
        (window.sidebar && !(window.sidebar instanceof Node))
      ) {
        // Opera <15 and Firefox >23
        /**
         * For Firefox <23 and Opera <15, no need for JS to add to bookmarks
         * The only thing needed is a `title` and a `rel="sidebar"`
         * To ensure that the bookmarked URL doesn't have a complementary `#` from our trigger's href
         * we force the current URL
         */
        triggerBookmark
          .attr('rel', 'sidebar')
          .attr('title', document.title)
          .attr('href', window.location.href)
        return true
      } else {
        // For the other browsers (mainly WebKit) we use a simple alert to inform users that they can add to bookmarks with ctrl+D/cmd+D

        alert(
          'You can add this page to your bookmarks by pressing ' +
            (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') +
            ' + D on your keyboard.'
        )
      }
      // If you have something in the `href` of your trigger
      return false
    },
    copyURLToClipboard() {
      let url = window.location.href

      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.clipboard = url
      setTimeout(() => {
        this.clipboard = ''
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
    checkLogin() {
      return this.userInfo &&
        this.userInfo.username != 'anyone' &&
        !(
          this.userInfo.username.split('-').length == 2 &&
          this.userInfo.username.split('-')[0].length == 13 &&
          this.userInfo.username.split('-')[1].length == 12
        )
    }
  }
}
</script>
