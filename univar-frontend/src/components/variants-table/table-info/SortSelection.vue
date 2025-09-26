<template>
  <div class="q-pa-md full-width">
    <div class="sort-column-box">
      <div class="row dragging-box">
        <div class="col-md-6 display-group">
          <span class="dragging-group-title">Sorted Columns ({{ sortedList.length }})</span>
          <q-input
            clearable
            outlined
            v-model="searchSorted"
            placeholder="Search Sorting Column"
            @update:model-value="onSearchColumn('sorted', searchSorted)"
          >
            <template v-slot:prepend>
              <q-icon name="manage_search" />
            </template>
          </q-input>
          <draggable
            class="dragArea list-group w-full sorted-list"
            :list="sortedList"
            @change="onColumnDrag($event, 'sorted')"
            group="draggable_group"
            ghostClass="ghost"
            :move="onMove"
            draggable=".draggable-item"
          >
            <template v-for="element in sortedList" :key="element.name">
              <div class="column-element row draggable-item" :class="'ele-' + element.name">
                <div class="col-md-6">
                  <q-tooltip>{{ element.remark ? element.remark : element.label }}</q-tooltip>
                  {{ element.label }}
                </div>
                <div class="col-md-4">
                  <q-select
                    outlined
                    v-model="element.sortDisplay"
                    :options="sortingOptions"
                    @update:model-value="onChangeSort(element)"
                  >
                    <!-- <template v-slot:append>
                      <q-icon
                        v-if="element.sort !== null"
                        class="cursor-pointer"
                        name="clear"
                        @click.stop.prevent="onChangeSort(element)"
                      />
                    </template> -->
                  </q-select>
                </div>
                <div
                  class="hover-icon clear-icon col-md-2"
                  @click="onClickRemoveSorted($event, 'sorted', element)"
                ></div>
              </div>
            </template>
            <div
              v-if="chromColumn && !this.sortedList.some((column) => column.name === 'chrom')"
              class="column-element row not-draggable"
              :class="'ele-' + chromColumn.name"
            >
              <div class="col-md-6">
                <q-tooltip>{{
                  chromColumn.remark ? chromColumn.remark : chromColumn.label
                }}</q-tooltip>
                {{ chromColumn.label }}
              </div>
              <div class="col-md-6">
                <q-select
                  outlined
                  v-model="chromColumn.sortDisplay"
                  :options="sortingOptions"
                  @update:model-value="onChangeSort(chromColumn)"
                >
                  <!-- <template v-slot:append>
                      <q-icon
                        v-if="element.sort !== null"
                        class="cursor-pointer"
                        name="clear"
                        @click.stop.prevent="onChangeSort(element)"
                      />
                    </template> -->
                </q-select>
              </div>
            </div>
            <div
              v-if="startColumn && !this.sortedList.some((column) => column.name === 'start')"
              class="column-element row not-draggable"
              :class="'ele-' + startColumn.name"
            >
              <div class="col-md-6">
                <q-tooltip>{{
                  startColumn.remark ? startColumn.remark : startColumn.label
                }}</q-tooltip>
                {{ startColumn.label }}
              </div>
              <div class="col-md-6">
                <q-select
                  outlined
                  v-model="startColumn.sortDisplay"
                  :options="sortingOptions"
                  @update:model-value="onChangeSort(startColumn)"
                >
                  <!-- <template v-slot:append>
                      <q-icon
                        v-if="element.sort !== null"
                        class="cursor-pointer"
                        name="clear"
                        @click.stop.prevent="onChangeSort(element)"
                      />
                    </template> -->
                </q-select>
              </div>
            </div>
          </draggable>
        </div>
        <div class="col-md-6 unsort-group">
          <div style="width: 100%">
            <span class="dragging-group-title">Unsort Columns ({{ unsortList.length }})</span>
            <div class="select-category">
              <select v-model="selectedCategory" @change="onCategorySelect">
                <option value="">Select a category</option>
                <option v-for="category in categoryList" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
          <q-input
            clearable
            outlined
            v-model="searchUnsort"
            placeholder="Search Unsort Column"
            @update:model-value="onSearchColumn('unsort', searchUnsort)"
          >
            <template v-slot:prepend>
              <q-icon name="manage_search" />
            </template>
          </q-input>
          <draggable
            class="dragArea list-group w-full unsort-list"
            :list="unsortList"
            @change="onColumnDrag($event, 'unsort')"
            group="draggable_group"
            ghostClass="ghost"
            :move="onMove"
            :sort="false"
          >
            <template v-for="element in unsortList" :key="element.name">
              <div
                class="column-element"
                :class="'ele-' + element.name + ' category-' + element.category"
              >
                <div
                  class="hover-icon hover-icon-left view-icon"
                  @click="onClickAddToSort($event, element)"
                ></div>
                <q-tooltip>{{ element.remark ? element.remark : element.label }}</q-tooltip>
                {{ element.label }}
                <div class="column-category" :class="'category-label-' + element.category">
                  {{ element.category }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <div class="column-selection-notice"><q-icon name="swipe_right" /> Swipe to change order</div>
    </div>
  </div>
</template>

<style>
@import '@/assets/styles/sort-selection.scss';
</style>
<script>
import { VueDraggableNext } from 'vue-draggable-next'

export default {
  name: 'SortSelection',
  props: ['columns', 'sortingColumns', 'sortingOptions'],
  components: {
    draggable: VueDraggableNext
  },
  emits: ['onSortColumnMove'],
  data() {
    return {
      list: this.columns,
      chromColumn: null,
      startColumn: null,
      sortedList: [],
      unsortList: [],
      searchSorted: '',
      searchUnsort: '',
      categoryList: [
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
    searchUnsort: function (newVal) {
      if (newVal === null || newVal === '') {
        this.selectedCategory = ''
      }
    },
    sortingColumns: function(newVal) {
      this.loadValue()
    }
  },
  async mounted() {
    this.loadValue()
  },
  methods: {
    loadValue() {
      this.sortedList = []
      this.unsortList = []

      this.sortedList = JSON.parse(JSON.stringify(this.sortingColumns))
      for (const sortedColumn of this.sortedList) {
        const columnElement = this.columns['all'].find(
          (column) => column.name === sortedColumn.column
        )
        sortedColumn.name = sortedColumn.column
        sortedColumn.label = columnElement.label
        sortedColumn.remark = columnElement.remark
        if (sortedColumn.sort) {
          sortedColumn.sortDisplay = this.sortingOptions.filter(
            (option) => option.value === sortedColumn.sort
          )[0]
        }
      }

      this.unsortList = this.columns['all'].filter(
        (allColumn) =>
          !this.sortedList.some((sortedColumn) => sortedColumn.column === allColumn.name)
      )
      this.unsortList = this.unsortList.filter((column) => column.name !== 'chrom')
      this.unsortList = this.unsortList.filter((column) => column.name !== 'start')

      if (!this.sortedList.some((sortedColumn) => sortedColumn.column === 'chrom')) {
        this.chromColumn = this.columns['all'].find((column) => column.name === 'chrom')
        this.chromColumn.sortDisplay = this.sortingOptions.find((option) => option.value == 'asc')
      }
      if (!this.sortedList.some((sortedColumn) => sortedColumn.column === 'start')) {
        this.startColumn = this.columns['all'].find((column) => column.name === 'start')
        this.startColumn.sortDisplay = this.sortingOptions.find((option) => option.value == 'asc')
      }

      this.sortColumnsByCategory(this.unsortList)
    },
    onColumnDrag($event, group) {
      if ($event['added'] && group === 'sorted') {
        if (!$event['added'].element.sort) {
          $event['added'].element.sort = 'asc'
        }

        $event['added'].element.sortDisplay = this.sortingOptions.filter(
          (option) => option.value === $event['added'].element.sort
        )[0]
        $event['added'].element.column = $event['added'].element.name 
      }
      this.$emit('onSortColumnMove', $event, group, this.sortedList)
    },
    onClickRemoveSorted($event, group, element) {
      this.sortedList = this.sortedList.filter((item) => item !== element)
      this.unsortList.unshift(this.columns['all'].find((column) => column.name === element.name))
      this.sortColumnsByCategory(this.unsortList)
      $event['removed'] = { element: element }
      this.$emit('onSortColumnMove', $event, group)
    },
    onChangeSort(element) {
      const $event = {}
      $event['added'] = { element: element }
      this.$emit('onSortColumnMove', $event, 'sorted')
    },
    onClickAddToSort($event, element) {
      $event['added'] = { element: element }
      element.sort = 'asc'
      element.sortDisplay = this.sortingOptions.filter(
        (option) => option.value === $event['added'].element.sort
      )[0]

      element.column = element.name
      this.sortedList.push(element)
      this.unsortList = this.unsortList.filter((el) => el.name !== element.name)

      this.$emit('onSortColumnMove', $event, 'sorted')
    },
    onSearchColumn(type, value) {
      let allElementsClass = '.' + type + '-list .column-element'
      let allElements = document.querySelectorAll(allElementsClass)
      const display = type == 'sorted' ? 'flex' : 'block'
      if (value !== '' && value !== null) {
        let tempList = []
        let list = this[type + 'List']

        allElements.forEach((el) => {
          el.style.setProperty('display', 'none')
        })

        tempList = list.filter((item) => {
          const name = item.label.toLowerCase() // convert name to lowercase
          const category = type == 'sorted' ? '' : item.category.toLowerCase()
          const search = value.toLowerCase() // convert search query to lowercase
          return name.includes(search) || category.includes(search)
        })

        if (tempList.length !== 0) {
          tempList.forEach((el) => {
            let className = '.ele-' + el.name
            const element = document.querySelector(className)
            element.style.display = display
          })
        }
      } else {
        allElements.forEach((el) => {
          el.style.setProperty('display', display)
        })
      }
    },
    onMove(e) {
      let toClassName = e.to.className

      if (toClassName.includes('unsort-list')) {
        setTimeout(() => {
          this.sortColumnsByCategory(this.unsortList)
        }, 700)
      }

      return true
    },
    sortColumnsByCategory(list) {
      let newList = []
      this.columns['all'].forEach((item) => {
        let column = list.find((col) => col.name === item.name)
        if (column) {
          newList.push(column)
        }
      })

      this.unsortList = newList
    },
    onCategorySelect() {
      if (this.selectedCategory !== '') {
        this.searchUnsort = this.selectedCategory
        this.onSearchColumn('unsort', this.searchUnsort)
      } else {
        this.onSearchColumn('unsort', '')
        this.searchUnsort = ''
      }
    }
  }
}
</script>
