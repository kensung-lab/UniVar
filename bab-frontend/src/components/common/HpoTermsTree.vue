<template>
  <div class='row'>
    <div v-if='loadingGetHPO' class='col-md-8'>
      <img  src="@/assets/img/loading.svg" class="loading-svg">
    </div>
    <div v-else class='col-md-8'>
      <q-input ref="filterRef" filled v-model="filter" debounce="700" label="Search HPO" :disable=disableSearch @keydown.enter.prevent></q-input>
      <div v-show='!isSearching'>
        <q-tree
          class='hpo_tree'
          ref="tree"
          :nodes="display_hpo_terms"
          v-model:ticked="ticked"
          node-key="value"
          tick-strategy="strict"
          @lazy-load="onLazyLoad"
          @update:ticked='showTickedNodes'
          no-transition
          default-expand-all
        ></q-tree>
      </div>
      <div v-if='isSearching'>
        <div v-if='filtered_hpo_term_list.length === 0'>
          No matched HPO terms.
        </div>
        <div v-else>
          <template v-for="(item, index) in filtered_hpo_term_list" :key="index">
            <div v-if='item' class='filtered_hpo' @click='clickFilteredHPO(item)'>
              <q-icon name="check_box" v-if='this.tickedNode.some((ticked) => ticked.value === item.value)'></q-icon>
              <q-icon name="check_box_outline_blank" v-else></q-icon>
              {{item.label}}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-if='tickedNode?.length >0' class='col-md-4 clicked_hpo'>
      <div class='clicked_title'>Selected HPO Terms</div>
      <template v-for="(item, index) in tickedNode" :key="index">
        <div v-if='item' @click='removeClicked(item.value)' class='clicked_hpo_terms'>
          <q-icon name="radio_button_checked"></q-icon> {{item.label}}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import store from '@/store/store.js'

export default {
  name: 'HpoTerms',
  props: [
    'hpoVersion'
  ],
  data() {
    return{
      display_hpo_terms: [],
      hpo_terms: new Map(),
      ticked: [],
      tickedNode: [],
      all_hpo_terms: new Map(),
      tickStrategy: 'strict',
      filterRef : ref(null),
      filter : ref(''),
      filteredNodes:[],
      disableSearch : true,
      filtered_hpo_term_list : [],
      isSearching : false,
      loadingGetHPO: true
    }
  },
  async created() {
    if(this.hpoVersion){
      await this.getHpoTerm();
      this.loadingGetHPO = false
    }
  },
  watch: {
    'filter': async function(newVal) {
      await this.customFilter(newVal)
    },
    'tickedNode' : async function(newVal) {
      this.$emit("updateTickedNode", newVal)
    },
    'hpoVersion' : async function(newVal) {
     if(newVal){
       await this.getHpoTerm();
       this.loadingGetHPO = false
     }
    },
  },
  emits: ["updateTickedNode"],
  methods : {
    async onLazyLoad ({ node, key, done, fail }) {

      try {
        if (this.hpo_terms.size === 0) {
          setTimeout(() => {
            if (this.hpo_terms.size === 0) {
              this.getChildren(this.hpo_term[0]);
            }
            this.disableSearch = false
            return done(this.hpo_terms.get(node.value));
          }, 500)
        } else {
          const children = this.hpo_terms.get(node.value);
          children.forEach((child) => {
            if(this.tickedNode.some((x) => x.value === child.value)) {
              this.$refs.tree.setTicked(child.value, true);
            }
          });

          console.log('this.ticked: ', this.ticked);

          return done(children);
        }
      } catch (e) {
        await this.$nextTick();
      }
    },
    async showTickedNodes () {
      await this.$nextTick();
      const nodes = this.ticked.filter((ticked)=> this.all_hpo_terms.has(ticked)).map((ticked) => this.all_hpo_terms.get(ticked));
      this.tickedNode = nodes
      this.tickedNode.sort((a, b) => a.value.localeCompare(b.value));
      //console.log (this.tickedNode)
    },
    getChildren(node) {
      if (node.children && node.children.length > 0) {
        const listOfNode = [];
        node.children.forEach((eachChild) => {
          const childNode = JSON.parse(JSON.stringify(eachChild));
          delete childNode.children;
          listOfNode.push(childNode);
          this.all_hpo_terms.set(childNode.value, childNode);
          this.hpo_terms.set(node.value, listOfNode);
          this.getChildren(eachChild);
        });

      }
    },
    async customFilter(filter) {
      await this.$nextTick();
      const filt = filter.toLowerCase()
      // console.log("filt.length" , filt.length)
      // console.log("filt" , filt)

      if(filt.length >= 1){
        let filteredList = Array.from(this.all_hpo_terms.values()).filter(item => item.label.toLowerCase().includes(filt));
        this.filtered_hpo_term_list = filteredList.slice(0, 100);
        //console.log('filtered_hpo_term_list :' , this.filtered_hpo_term_list)
        this.isSearching = true
      } else {
        this.filtered_hpo_term_list = []
        // console.log('reset filtered_hpo_term_list :' , this.filtered_hpo_term_list)
        this.isSearching = false
      }
      //console.log('node : ', node)
      //console.log('filter : ', filter)
      //console.log('hpo_term_list:' , this.hpo_term_list)

      //const filteredList = Array.from(this.hpo_term_list).filter(item => item.label.toLowerCase().includes(filt));
      //console.log('filteredList :' ,filteredList)
      //this.display_hpo_terms = []

      //let result = node.label && node.label.toLowerCase().indexOf(filt) > -1

    },
    clickFilteredHPO(item){
      console.log('selected item: ', item)
      if(this.tickedNode.some((ticked) => ticked.value === item.value)){
        this.removeClicked(item.value)
      } else {
        // this.ticked.push(item)
        this.tickedNode.push(item)
        this.$refs.tree.setTicked(item.value,true)
      }
    },
    removeClicked(value){
      this.$refs.tree.setTicked(value,false);
    },
    async getHpoTerm(){
      if (!this.display_hpo_terms || this.display_hpo_terms.length === 0) {
        let HpoTermRes = await store.getters.getApiService.getHpoTerm(this.hpoVersion);
        // console.log('HpoTermRes:', HpoTermRes.data.data.hpos)
        this.hpo_term = HpoTermRes.data.data.hpos
        this.display_hpo_terms = JSON.parse(JSON.stringify(this.hpo_term));
        delete this.display_hpo_terms[0].children;
        this.all_hpo_terms.set(this.display_hpo_terms[0].value, this.display_hpo_terms[0]);
        setTimeout(() => {document.querySelector('.hpo_tree > div > div').click()});
      }
    }
  }
}
</script>

<style scoped>

</style>