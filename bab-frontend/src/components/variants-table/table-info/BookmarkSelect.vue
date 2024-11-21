<template>
  <div>
    <template v-for="(ele, index) in this.bookmark_options" :key='index'>
      <q-item clickable :class="ele.data.is_default ? 'sticky-bookmark' : '' ">
        <q-item-section>
          <div class="preset-container">
            <div class="preset-list-left"  @click="onSelectBookmark(ele)" v-close-popup :style="ele.data.is_default ? 'width: 100%' : '' ">
              <span class="select-label">{{ele.label}}</span>
              <div class="hover-container hover-bookmark" :class='external ? "hover-bookmark-external" : ""'>
                <BookmarkPreview :preview-columns='ele.data.columns' :preview-panels='convertPanel(ele.data.panels)' :preview-filters='ele.data.filters' :preview-sorting='ele.data.sort'></BookmarkPreview>
              </div>
            </div>
            <div class="preset-list-right" v-if='!ele.data.is_default'>
              <q-icon name="clear" class='preset-delete-btn' @click="onDeletePreset(ele)" v-close-popup/>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </template>
  </div>
</template>


<script>
import BookmarkPreview from '@/components/variants-table/table-info/BookmarkPreview.vue'
import { convertPanelFromValueToName } from '@/utils/variants-table/filter/gene-panel-utils'

export default {
  name: 'BookmarkSelect',
  props: [
    'bookmark_options',
    'panelOptions',
    'external'
  ],
  components: {
    BookmarkPreview
  },
  emits: ["onSelectBookmark","convertPanel","onDeletePreset"],
  data() {
    return{

    }
  },
  async created() {

  },
  methods: {
    async onSelectBookmark(bookmarkObj){
      this.$emit("onSelectBookmark",bookmarkObj)
    },
    async onDeletePreset(bookmarkObj){
      this.$emit("onDeletePreset",bookmarkObj)
    },
    convertPanel(panels){
      return convertPanelFromValueToName(panels, this.panelOptions)
    },
  }
}
</script>