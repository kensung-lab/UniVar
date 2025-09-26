<template>
  <div class="q-pa-md full-width">
    <q-card-section class="q-pt-none">
      <div class="selectColumnInBox">
        <div class="row dragging-box">
          <div class="col-md-2 frozen-group">
            <span class="dragging-group-title"
              >Frozen Display Columns
              <span :class="disableDrag ? 'disableDrag' : ''">(Max:5) </span>
            </span>
            <draggable
              class="dragArea list-group w-full frozen_list"
              :list="frozen_list"
              @change="onColumnDrag($event, 'frozen')"
              group="draggable_group"
              ghostClass="ghost"
              :move="onMove"
            >
              <transition-group>
                <template v-for="element in frozen_list" :key="element.name">
                  <div class="column_element">
                    <q-tooltip>{{ element.remark ? element.remark : element.label }}</q-tooltip>
                    {{ element.label }}
                    <!--                        <div class="hover-icon clear-icon" @click='onClickRemoveDisplay($event,"frozen",element)'></div>-->
                  </div>
                </template>
              </transition-group>
            </draggable>
          </div>
          <div class="col-md-4 display-group">
            <span class="dragging-group-title">Display Columns ({{ display_list.length }})</span>
            <q-input
              clearable
              outlined
              v-model="search_display"
              placeholder="Search Display Column"
              @update:model-value="onSearchColumn('display', search_display)"
            >
              <template v-slot:prepend>
                <q-icon name="manage_search" />
              </template>
            </q-input>
            <draggable
              class="dragArea list-group w-full display_list"
              :list="display_list"
              @change="onColumnDrag($event, 'display')"
              group="draggable_group"
              ghostClass="ghost"
              :move="onMove"
            >
              <template v-for="element in display_list" :key="element.name">
                <div class="column_element" :class="'ele_' + element.name">
                  <q-tooltip>{{ element.remark ? element.remark : element.label }}</q-tooltip>
                  {{ element.label }}
                  <div
                    class="hover-icon clear-icon"
                    @click="onClickRemoveDisplay($event, 'display', element)"
                  ></div>
                </div>
              </template>
            </draggable>
          </div>
          <div class="col-md-6 hidden-group">
            <div style="width: 100%">
              <span class="dragging-group-title">Hidden Columns ({{ hidden_list.length }})</span>
              <div class="select_category">
                <select v-model="selectedCategory" @change="onCategorySelect">
                  <option value="">Select a category</option>
                  <option v-for="category in category_list" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
            </div>
            <q-input
              clearable
              outlined
              v-model="search_hidden"
              placeholder="Search Hidden Column"
              @update:model-value="onSearchColumn('hidden', search_hidden)"
            >
              <template v-slot:prepend>
                <q-icon name="manage_search" />
              </template>
            </q-input>
            <draggable
              class="dragArea list-group w-full hidden_list"
              :list="hidden_list"
              @change="onColumnDrag($event, 'hidden')"
              group="draggable_group"
              ghostClass="ghost"
              :move="onMove"
              :sort="false"
            >
              <template v-for="element in hidden_list" :key="element.name">
                <div
                  class="column_element"
                  :class="'ele_' + element.name + ' category_' + element.category"
                >
                  <div
                    class="hover-icon hover-icon-left view-icon"
                    @click="onClickAddToDisplay($event, element)"
                  ></div>
                  <q-tooltip>{{ element.remark ? element.remark : element.label }}</q-tooltip>
                  {{ element.label }}
                  <div class="column_category" :class="'category_label_' + element.category">
                    {{ element.category }}
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </q-card-section>
    <div class="column_selection_notice"><q-icon name="swipe_right" /> Swipe to change order</div>
  </div>
</template>

<style>
@import '@/assets/styles/column-selection.scss';
</style>
<script>
import { VueDraggableNext } from 'vue-draggable-next'

export default {
  name: 'ColumnSelection',
  props: ['columns', 'svDetailsColumns', 'selectVariantType', 'defaultAllColumns'],
  components: {
    draggable: VueDraggableNext
  },
  emits: ['onColumnMove'],
  data() {
    return {
      selectionTab: 'all_variants',
      tab_panels: ['all_variants', 'small_variants', 'structural_variants'],
      list: this.columns,
      frozen_list: [],
      display_list: [],
      hidden_list: [],
      search_hidden: '',
      search_display: '',
      search_frozen: '',
      selectionVariantType: 'all',
      disableDrag: false,
      category_list: [
        'basic',
        'genomic',
        'prioritization',
        'quality',
        'frequency',
        'effect',
        'evidence'
      ],
      selectedCategory: ''
    }
  },
  watch: {
    search_hidden: function (newVal) {
      if (newVal === null || newVal === '') {
        this.selectedCategory = ''
      }
    }
  },
  async created() {
    if (this.selectVariantType === null || this.selectVariantType === 'all') {
      this.selectionTab = 'all_variants'
      this.selectionVariantType = 'all'
    } else if (this.selectVariantType === 'small') {
      this.selectionTab = 'small_variants'
      this.selectionVariantType = 'small'
    } else {
      this.selectionTab = 'structural_variants'
      this.selectionVariantType = 'structural'
    }

    this.loadValue()
  },
  methods: {
    loadValue() {
      this.frozen_list = []
      this.display_list = []
      this.hidden_list = []
      this.search_hidden = ''
      this.search_display = ''
      this.search_frozen = ''

      let list_type = this.selectionVariantType;

      this.list[list_type].forEach((el) => {
        if (el.isFrozen) {
          this.frozen_list.push(el)
        } else if (el.isShow) {
          this.display_list.push(el)
        } else {
          this.hidden_list.push(el)
        }
      })

      this.sortColumnsByCategory(this.hidden_list)
    },
    onColumnDrag($event, group) {
      this.$emit(
        'onColumnMove',
        $event,
        group,
        this.frozen_list,
        this.display_list,
        this.hidden_list,
        this.selectionVariantType
      )
    },
    onClickRemoveDisplay($event, group, element) {
      this.disableDrag = false
      element.isShow = false

      if (group === 'display') {
        this.display_list = this.display_list.filter((item) => item !== element)
      } else {
        this.frozen_list = this.frozen_list.filter((item) => item !== element)
      }

      this.hidden_list.unshift(element)
      this.sortColumnsByCategory(this.hidden_list)
      this.$emit(
        'onColumnMove',
        $event,
        group,
        this.frozen_list,
        this.display_list,
        this.hidden_list,
        this.selectionVariantType
      )
    },
    onClickAddToDisplay($event, element) {
      element.isShow = true
      this.hidden_list = this.hidden_list.filter((item) => item !== element)
      this.display_list.unshift(element)
      this.$emit(
        'onColumnMove',
        $event,
        'hidden',
        this.frozen_list,
        this.display_list,
        this.hidden_list,
        this.selectionVariantType
      )
    },
    onSearchColumn(type, value) {
      let allElementsClass = '.' + type + '_list .column_element'
      let allElements = document.querySelectorAll(allElementsClass)

      if (value !== '' && value !== null) {
        let tempList = []
        let list = this[type + '_list']

        allElements.forEach((el) => {
          el.style.setProperty('display', 'none', 'important')
        })

        tempList = list.filter((item) => {
          const name = item.label.toLowerCase() // convert name to lowercase
          const category = item.category.toLowerCase()
          const search = value.toLowerCase() // convert search query to lowercase
          return name.includes(search) || category.includes(search)
        })

        if (tempList.length !== 0) {
          tempList.forEach((el) => {
            let className = '.ele_' + el.name
            const element = document.querySelector(className)
            element.style.display = 'block'
          })
        }
      } else {
        allElements.forEach((el) => {
          el.style.setProperty('display', 'block')
        })
      }
    },
    onMove(e) {
      //console.log(e)
      this.disableDrag = false

      let toClassName = e.to.className
      if (toClassName.includes('frozen_list')) {
        if (this.frozen_list.length >= 5) {
          this.disableDrag = true
          if (e.from !== e.to) {
            return false
          }
        } else {
          this.disableDrag = false
        }
      }

      if (toClassName.includes('hidden_list')) {
        setTimeout(() => {
          this.sortColumnsByCategory(this.hidden_list)
        }, 700)
      }

      return true
    },
    onClickChangeTab(tabName) {
      //console.log('switch to '+ tabName)

      this.selectionVariantType = tabName
      this.loadValue()
    },
    sortColumnsByCategory(list) {
      // console.log('sortColumnsByCategory')
      // console.log('list : ' , list)
      // console.log('defaultAllColumns : ',this.defaultAllColumns)

      // list = list.sort((a, b) => {
      //   return this.category_list.indexOf(a.category) - this.category_list.indexOf(b.category);
      // });

      let newList = []
      this.defaultAllColumns.forEach((item) => {
        let column = list.find((col) => col.name === item.name)
        if (column) {
          newList.push(column)
        }
      })

      this.hidden_list = newList
    },
    onCategorySelect() {
      //console.log('selected : ' + this.selectedCategory)
      if (this.selectedCategory !== '') {
        this.search_hidden = this.selectedCategory
        this.onSearchColumn('hidden', this.search_hidden)
      } else {
        this.onSearchColumn('hidden', '')
        this.search_hidden = ''
      }
    }
  }
}
</script>
