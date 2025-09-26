<template>
  <div class="bookmark-preview-container row">
    <div v-for="(previewObject, category) in previewColumns" :key="category" class="col-md-4 col-sm-12  bookmark-preview-category">
        <div class="bookmark-preview-title">
          <q-icon name="format_list_bulleted" class='category-icon'/> {{category}} Variant
        </div>
        <div v-for="(item, index) in previewObject" :key="index" class='bookmark-preview-unit'>
          <div v-if="index === 'frozen' && item.length > 0" class='bookmark-preview-frozen'>
            <b>Frozen : ({{item.length}})</b>
            <div v-for="(previewFrozen, frozenIndex) in item" :key="frozenIndex">
              <q-icon name="radio_button_checked" class="bookmark-preview-button"></q-icon>
              <span class="col-label"> {{previewFrozen}} </span>
            </div>
          </div>
          <div v-if="index === 'display' && item.length > 0" >
            <b>Display : ({{item.length}})</b>
            <div v-for="(previewDisplay, displayIndex) in item" :key="displayIndex">
              <div v-if='displayIndex < 7'>
                <q-icon name="radio_button_checked" class="bookmark-preview-button"></q-icon>
                <span class="col-label"> {{previewDisplay}} </span>
              </div>
            </div>
            <div class='bookmark-preview-more' v-if='item.length > 7'>
              <span>...</span>
            </div>
          </div>
        </div>
    </div>

    <div v-if='previewSorting' class="bookmark-preview-group bookmark-preview-sort">
      <div class="bookmark-preview-title">
        <q-icon name="sort" class='category-icon'/> Sorting ({{Object.keys(previewSorting).length}})
      </div>
      <div v-for="(item, index) in previewSorting" :key="index" class='sort-group'>
        <q-icon name="radio_button_checked" class="bookmark-preview-button"></q-icon>
        <span class="sort-label">{{index}}</span> :
        <span v-if='item === 1'>↑ <span class="sort-symbol">ASC</span> </span>
        <span v-else>↓ <span class="sort-symbol">DESC</span> </span>
      </div>
    </div>

    <div v-if='previewFilters || previewPanels ' class="bookmark-preview-group bookmark-preview-filters">
      <div class="bookmark-preview-title">
        <q-icon name="tune" class='category-icon'/> Filters ({{filtersCount}})
      </div>
      <FilteredBox :variantsFilter='previewFilters' :panels="previewPanels" :fieldArray='[]' :show-all=true :allowRemove=false :view-only=true />
    </div>
  </div>
</template>

<style>
@import '@/assets/styles/bookmark-preview.css';
</style>

<script>
import FilteredBox from '@/components/variants-table/filters/FilteredBox.vue'

export default {
  name: 'BookmarkPreview',
  props: [
    'previewColumns',
    'previewFilters',
    'previewSorting',
    'previewPanels'
  ],
  components: {
    FilteredBox
  },
  data() {
    return{
      filtersCount : 0
    }
  },
  async created() {
    //console.log(this.previewColumns)
    //console.log(this.previewFilters)
    //console.log(this.previewSorting)
    if(this.previewFilters){
      this.filtersCount = this.filtersCount + Object.keys(this.previewFilters).length
    }

    if(this.previewPanels && this.previewPanels.length > 0){
      this.filtersCount = this.filtersCount + 1
    }
  },
}
</script>

<style scoped>

</style>