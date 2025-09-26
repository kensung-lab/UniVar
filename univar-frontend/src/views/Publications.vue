<template>
  <q-page class="page-container q-pa-md q-pb-xl">
    <div class="content-wrapper">
      <!-- Title and Back Button on Same Row -->
      <div class="row items-center justify-between q-mb-lg">
        <h1 class="text-h4 text-weight-bold title-gradient q-ma-none">Publications</h1>
        <q-btn
          unelevated
          color="primary"
          icon="arrow_back"
          label="Back to Home"
          @click="$router.push('/')"
          class="back-btn"
        >
          <q-tooltip transition-show="flip-right">Return to landing page</q-tooltip>
        </q-btn>
      </div>

      <!-- Publication Content -->
      <div class="publication-content animate-fade">
        <!-- Title -->
        <h2 class="text-h5 q-mb-sm text-weight-bold text-dark title-hover">
          {{ paper.title }}
        </h2>

        <!-- Authors -->
        <div class="text-subtitle1 q-mb-sm authors text-grey-8">
          {{ paper.authors.join(', ') }}
        </div>

        <!-- Metadata -->
        <div class="text-caption metadata q-mb-md">
          <span class="journal">{{ paper.journal }} </span>
          <span class="volume">&nbsp;{{ paper.volume }}</span>
          <span class="year"> ({{ paper.year }}): </span>
          <span class="article-no">{{ paper.article_no }}.</span>
        </div>

        <div class="text-caption references q-mb-md">
          <span class="pmid-text">PMID: </span>
          <span class="pmid">{{ paper.pmid }} </span>
          <span class="doi-text"> DOI: </span>
          <a :href="'https://doi.org/' + paper.doi" target="_blank" rel="noopener" class="doi-link">
            {{ paper.doi }}
          </a>
        </div>

        <q-separator class="q-my-lg separator" />

        <!-- Citation Section -->
        <h3 class="text-h6 q-mb-md text-weight-medium text-grey-9">Cite this paper</h3>

        <q-expansion-item
          v-for="(citation, style) in citations"
          :key="style"
          :label="style"
          dense
          expand-separator
          header-class="citation-header"
          class="q-mb-sm citation-item"
        >
          <q-card flat class="citation-card">
            <q-card-section class="q-pa-md">
              <div class="row items-center no-wrap">
                <div class="col citation-text">{{ citation }}</div>
                <q-btn
                  flat
                  icon="content_copy"
                  size="sm"
                  class="copy-btn q-ml-md"
                  @click="copyToClipboard(citation)"
                >
                  <q-tooltip transition-show="scale" transition-hide="scale">
                    Copy to clipboard
                  </q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- Zotero Button -->
        <q-btn
          unelevated
          color="primary"
          icon="download"
          label="Add to Zotero"
          class="q-mt-lg zotero-btn"
          @click="saveToZotero"
        >
          <q-tooltip transition-show="flip-right"> Requires Zotero Connector </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Decorative Side Elements -->
    <div class="side-decoration left"></div>
    <div class="side-decoration right"></div>
  </q-page>
</template>

<style scoped>
@import '@/assets/styles/publications.css';
</style>

<script>
export default {
  name: 'Publications',
  data() {
    return {
      paper: {
        title:
          'UniVar: A variant interpretation platform enhancing rare disease diagnosis through robust filtering and unified analysis of SNV, INDEL, CNV and SV',
        authors: [
          'Cherie C.Y. Au-Yeung',
          'Yuen-Ting Cheung',
          'Joshua Y.T. Cheng',
          'Ken W.H. Ip',
          'Sau-Dan Lee',
          'Victor Y.T. Yang',
          'Amy Y.T. Lau',
          'Chit K.C. Lee',
          'Peter K.H. Chong',
          'King Wai Lau',
          'Jurgen T.J. van Lunenburg',
          'Damon F.D. Zheng',
          'Brian H.M. Ho',
          'Crystal Tik',
          'Kingsley K.K. Ho',
          'Ramesh Rajaby',
          'Chun-Hang Au',
          'Mullin H.C. Yu',
          'Wing-Kin Sung*'
        ],
        journal: 'Computers in Biology and Medicine',
        year: '2025',
        volume: '185',
        article_no: '109560',
        doi: '10.1016/j.compbiomed.2024.109560',
        pmid: '39700857',
        url: 'https://kwnsfk27.r.eu-west-1.awstrack.me/L0/https:%2F%2Fauthors.elsevier.com%2Fsd%2Farticle%2FS0010-4825(24)01645-7/1/01020193d79ee388-d78176e9-1637-47a4-b25e-08a39e2c1bf4-000000/f_Wc4i4AvBtkFzAL72HS4RQZb74=405'
      },
      citations: {}
    }
  },
  created() {
    this.citations = {
      APA: `${this.paper.authors.join(', ')} (${this.paper.year}). ${this.paper.title}. ${this.paper.journal}. https://doi.org/${this.paper.doi}`,
      MLA: `${this.paper.authors[0]} et al. "${this.paper.title}." ${this.paper.journal}, ${this.paper.year}, doi:${this.paper.doi}`,
      Chicago: `${this.paper.authors.join(', ')}. "${this.paper.title}." ${this.paper.journal} ${this.paper.year}. doi:${this.paper.doi}`
    }
  },
  methods: {
    async copyToClipboard(text) {
      await navigator.clipboard.writeText(text)
      this.$q.notify({
        icon: 'content_copy',
        type: 'positive',
        message: 'Citation copied!',
        actions: [{ icon: 'close', color: 'white' }],
        timeout: '3000'
      })
    },
    saveToZotero() {
      window.open(`zotero://select/items/bbt?url=${encodeURIComponent(paper.url)}`)
    }
  }
}
</script>
