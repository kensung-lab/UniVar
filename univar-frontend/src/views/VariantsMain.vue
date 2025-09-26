<template>
  <div>
    <q-page class="q-pa-md app-page app-page_external">
      <div class="row full-width">
        <div class="right-content-full-width" style="padding-left: 5vw; padding-right: 5vw">
          <div class="top-panel-search full-width">
            <div class="row">
              <div class="samples-selection" :class="isExample ? 'col-md-8' : 'col-md-10'">
                <DatabaseSelect
                  :database="database"
                  :pipelineInfoData="pipelineInfoData"
                  :database_filter_options="database_filter_options"
                  :variantsSamplesDetails="variantsSamplesDetails"
                  @filterDatabase="filterDatabase"
                  @onChangeDatabase="onChangeDatabase"
                  @onSampleSelectionClick="onSampleSelectionClick"
                />
              </div>
              <div class="col-md-2">
                <q-btn-group class="sample-related-info-gp" push>
                  <q-btn
                    color="primary"
                    class="status-details-btn"
                    icon-right="people"
                    @click="onSampleSelectionClick"
                  >
                    <q-tooltip anchor="top middle" self="center middle">Sample status</q-tooltip>
                  </q-btn>
                  <q-btn color="primary" @click="displayPipelineInfo()">
                    <img src="@/assets/img/database-info-icon.svg" class="database-info-icon" />
                  </q-btn>
                </q-btn-group>
              </div>
              <div class="gene-table-title" :class="isExample ? 'col-md-2' : ''">
                <TableTutorial v-if="isExample" />
              </div>
            </div>
          </div>
          <!-- functional row -->
          <div class="row">
            <div class="col-md-7 text-left variants-table-actions-group">
              <q-btn
                class="gene-table-btn"
                color="primary"
                icon="table_chart"
                @click="selectColumnsDialog = true"
                :disabled="tableLoading"
              >
                &nbsp;Column Manager
              </q-btn>
              <q-btn
                class="gene-table-btn"
                color="primary"
                icon="swap_vert"
                @click="sortColumnsDialog = true"
                :disabled="tableLoading"
              >
                &nbsp;Sort Manager
              </q-btn>
              <q-btn
                icon="visibility"
                class="gene-table-btn gray-btn univar-icon-btn"
                @click="onMarkAsReadClicked('read')"
              >
                <q-tooltip anchor="top middle" self="center middle">Mark variant as read</q-tooltip>
              </q-btn>
              <q-btn
                class="gene-table-btn gray-btn univar-icon-btn"
                icon="visibility_off"
                @click="onMarkAsReadClicked('unread')"
              >
                <q-tooltip anchor="top middle" self="center middle"
                  >Mark variant as un-read</q-tooltip
                >
              </q-btn>
              <ExportButton :isExporting="isExporting" @onExportFile="onExportFile" />

              <q-btn
                icon-right="add_link"
                class="gene-table-btn gray-btn copy-to-clip-btn univar-icon-btn"
                @click="copyURLToClipboard"
              >
                <q-tooltip anchor="top middle" self="center middle"
                  >Copy URL to clipboard</q-tooltip
                >
              </q-btn>
              <q-dialog v-model="selectColumnsDialog">
                <div class="select-column-card">
                  <q-card>
                    <q-card-section>
                      <div class="row">
                        <div class="col-md-6 text-h6"><b>Column Selection</b></div>
                        <div class="col-md-6 button-group">
                          <q-btn
                            color="primary"
                            icon="bookmark_add"
                            id="save-bookmark-btn"
                            class="manage-btn"
                          >
                            <q-tooltip anchor="top middle" self="center middle"
                              >Save bookmark</q-tooltip
                            >
                            <q-popup-proxy>
                              <q-banner>
                                <q-input
                                  v-model="appColumnBookmark"
                                  v-on:keyup.enter="onSaveNewBookmark('enter')"
                                  filled
                                  type="text"
                                  class="note_textarea"
                                  :rules="[
                                    (val) => val.length <= 25 || 'Please use maximum 25 character'
                                  ]"
                                />
                                <q-btn
                                  label="Save"
                                  color="primary"
                                  @click="onSaveNewBookmark"
                                  v-close-popup
                                ></q-btn>
                              </q-banner>
                            </q-popup-proxy>
                          </q-btn>
                          <q-btn-dropdown
                            color="primary"
                            class="bookmark-dropdown manage-btn"
                            icon="bookmark"
                          >
                            <q-list padding class="default-dropdown-list">
                              <BookmarkSelect
                                :bookmark_options="this.bookmark_options"
                                :panelOptions="this.panelOptions"
                                @onSelectBookmark="onSelectBookmark"
                                @onDeletePreset="onDeletePreset"
                              />
                              <footer></footer>
                            </q-list>
                          </q-btn-dropdown>

                          <q-btn
                            color="primary"
                            icon-right="cached"
                            class="manage-btn"
                            @click="resetDefaultColumns"
                            v-close-popup
                          >
                            <q-tooltip anchor="top middle" self="center middle"
                              >Reset columns</q-tooltip
                            >
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>

                    <ColumnSelection
                      @onColumnMove="onColumnMove"
                      :columns="this.columns"
                      :svDetailsColumns="this.svDetailsColumns"
                      :selectVariantType="'all'"
                      :defaultAllColumns="this.defaultAllColumns"
                    />

                    <q-card-actions align="right" class="text-teal">
                      <div class="row">
                        <div class="col-md-12">
                          <q-btn color="primary" label="Close" v-close-popup />
                        </div>
                      </div>
                    </q-card-actions>
                  </q-card>
                </div>
              </q-dialog>
              <q-dialog v-model="sortColumnsDialog">
                <div class="select-column-card">
                  <q-card>
                    <q-card-section>
                      <div class="row">
                        <div class="col-md-6 text-h6"><b>Sort Manager</b></div>
                        <div class="col-md-6 button-group">
                          <q-btn
                            color="primary"
                            icon-right="cached"
                            class="manage-btn"
                            @click="resetDefaultColumns"
                            v-close-popup
                          >
                            <q-tooltip anchor="top middle" self="center middle"
                              >Reset Sorting</q-tooltip
                            >
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>

                    <SortSelection
                      @onSortColumnMove="onSortColumnMove"
                      :columns="columns"
                      :sortingColumns="sortingColumns"
                      :sortingOptions="sortingOptions"
                    />

                    <q-card-actions align="right" class="text-teal">
                      <div class="row">
                        <div class="col-md-12">
                          <q-btn color="primary" label="Close" v-close-popup />
                        </div>
                      </div>
                    </q-card-actions>
                  </q-card>
                </div>
              </q-dialog>

              <q-dialog v-model="variantsSamplesDialog">
                <q-card class="samples-selection-card">
                  <VariantsSamplesPanel
                    :variantsSamples="variantsSamples"
                    :variantsSamplesDetails="variantsSamplesDetails"
                    :IsStandalone="IsStandalone"
                    @updateSamplesDetails="updateSamplesDetails"
                    @onRestoreVariantsSamples="onRestoreVariantsSamples"
                    @onClickSamplesUpdate="onClickSamplesUpdate"
                    @bringSelectedSampleOnTop="bringSelectedSampleOnTop"
                    v-if="renderComponent"
                  />
                  <q-card-actions align="right" class="text-teal">
                    <q-btn color="primary" label="Close" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>
              <q-dialog v-model="confirmSelectDialog" persistent>
                <q-card
                  :style="
                    confirmSelectAction === 'read' ? 'background: #e2ebff' : 'background: gainsboro'
                  "
                >
                  <q-card-section class="row items-center">
                    <q-avatar icon="warning" color="primary" text-color="white"></q-avatar>
                    <span class="change-read-text">
                      Are you sure to <b>mark as {{ confirmSelectAction }}</b> for the selected
                      variants? <br />
                      Selected variants: {{ confirmSelectVariantNum }}
                    </span>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      flat
                      label="Confirm"
                      color="primary"
                      class="mark-as-read confirm-btn"
                      v-close-popup
                      @click="onConfirmMarkAsReadClicked"
                    ></q-btn>
                    <q-btn flat label="Cancel" color="red" v-close-popup></q-btn>
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </div>
            <div class="col-md-5 text-right actions-right">
              <span v-if="IsStandalone">
                <q-btn
                  color="primary"
                  label="Load Cram"
                  icon="cloud_upload"
                  class="action-right-btn load-cram-btn"
                  @click="onSampleSelectionClick()"
                />
              </span>
              <div class="exomiser-select">
                <q-select
                  class="preset-display-btn"
                  rounded
                  outlined
                  clearable
                  v-model="this.selectedExomiser"
                  :options="exomiserInfo"
                  @clear="onSelectExomiser({})"
                >
                  <template v-slot:selected>
                    <q-icon class="exomiser-icon" name="troubleshoot"></q-icon>
                    <span v-if="this.selectedExomiser?.run">{{
                      this.selectedExomiser.display_name
                    }}</span>
                    <span v-else>Select Exomiser</span>
                  </template>
                  <template v-slot:option="scope">
                    <q-item clickable v-bind="scope.itemProps">
                      <q-item-section>
                        <div class="preset-container">
                          <div
                            class="preset-list-left"
                            :class="!scope.opt.is_ready ? 'disable-exomiser' : ''"
                            @click="scope.opt.is_ready ? onSelectExomiser(scope.opt) : ''"
                            v-close-popup="!!scope.opt.is_ready"
                          >
                            <div>
                              <span class="select-label">{{ scope.opt.display_name }}</span>
                              <span v-if="!scope.opt.is_ready">
                                <img src="@/assets/img/loading.svg" class="loading-svg" />
                              </span>
                              <div class="hover-container hover-exomiser">
                                <div class="row hpo-row">
                                  <div>HPO Terms :</div>
                                  <div
                                    class="preset-list-right"
                                    v-if="scope.opt.is_ready && !scope.opt.is_example"
                                  >
                                    <q-tooltip>Delete Exomiser Run</q-tooltip>
                                    <q-icon
                                      name="delete"
                                      class="preset-delete-btn"
                                      @click="onClickDeleteExomiser(scope.opt)"
                                      v-close-popup
                                    />
                                  </div>
                                </div>
                                <div v-for="(hpo, i) in scope.opt.hpoDisplays" :key="i">
                                  <q-icon
                                    name="radio_button_checked"
                                    class="filtered-box-icon"
                                  ></q-icon>
                                  {{ hpo }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <q-btn
                color="primary"
                label="Run Exomiser"
                :icon="laDnaSolid"
                class="action-right-btn"
                @click="exomiserDialog = !exomiserDialog"
              ></q-btn>
              <q-dialog v-model="exomiserDialog">
                <q-card class="exomiser-box">
                  <ExomiserBox
                    :selected_database="database_selected"
                    :panelOptions="panelOptions"
                    @onRunExomiserSuccess="onRunExomiserSuccess"
                  />
                </q-card>
              </q-dialog>
              <q-dialog v-model="exomiserConfirmDeleteDialog" persistent>
                <q-card>
                  <q-card-section class="row items-center">
                    <q-avatar icon="warning" color="primary" text-color="white" />
                    <span class="q-ml-sm">Are you sure to remove this Exomiser run</span>
                  </q-card-section>

                  <q-card-actions align="right">
                    <q-btn
                      flat
                      label="Confirm"
                      color="red"
                      v-close-popup
                      @click="onDeleteExomiser"
                    />
                    <q-btn flat label="Cancel" color="primary" v-close-popup />
                  </q-card-actions>
                </q-card>
              </q-dialog>
            </div>
          </div>
          <div class="top-panel-filter full-width">
            <div class="filter-box-area row">
              <div>
                <q-icon name="filter_list" class="filter-section-icon" />
                <span class="filter-text">&nbsp;Filters</span>
              </div>
              <q-btn class="filter-row-btn univar-icon-btn" icon="refresh" @click="onResetFilter">
                <q-tooltip anchor="top middle" self="center middle">Reset Preset</q-tooltip>
              </q-btn>
              <span>
                <q-tooltip anchor="top middle" self="center middle">Preset List</q-tooltip>
                <q-btn-dropdown
                  class="preset-display-btn filter-row-btn univar-icon-btn"
                  icon="bookmarks"
                  no-icon-animation
                >
                  <q-list padding class="default-dropdown-list">
                    <PresetSelect
                      :preset_options="this.preset_options"
                      :panelOptions="this.panelOptions"
                      :external="true"
                      @onSelectPreset="onSelectPreset"
                      @onDeletePreset="onDeletePreset"
                    />
                  </q-list>
                </q-btn-dropdown>
              </span>
              <q-btn
                icon="bookmark_add"
                id="save-bookmark-btn"
                class="save-bookmark-btn filter-row-btn univar-icon-btn"
              >
                <q-tooltip anchor="top middle" self="center middle">Save Preset</q-tooltip>
                <q-popup-proxy>
                  <q-banner>
                    <input
                      v-model="appPresetNew"
                      :placeholder="appPresetPlaceHolder"
                      class="app-preset-input"
                      v-on:keyup.enter="onSaveNewPreset(appPresetNew)"
                    />
                    <q-btn
                      color="primary"
                      icon="save"
                      square
                      @click="onSaveNewPreset(appPresetNew)"
                      class="preset-save-btn"
                    >
                      <q-tooltip>Save</q-tooltip>
                    </q-btn>
                  </q-banner>
                </q-popup-proxy>
              </q-btn>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    this.filters.geneLocationSearchText !== null &&
                    this.filters.geneLocationSearchText.length > 0
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Genomic Location
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card>
                      <div class="gene-panel-selection">
                        <div class="location-search-container">
                          <q-btn-group class="location-search-btn-group">
                            <input
                              v-if="!locationLongText"
                              v-model="filters.geneLocationSearchText"
                              placeholder="chr1:11000-118043 or OR4F5,OR4F29"
                              class="gene-location-text"
                              v-on:keyup.enter="onSearchGeneLocation"
                            />
                            <q-input
                              v-else
                              outlined
                              v-model="filters.geneLocationSearchText"
                              type="textarea"
                              placeholder="Location: geneA,geneB or chr2:38733-46313"
                              class="gene-location-search-textarea"
                              :rules="[
                                (val) => val.length <= 40 || 'Please use maximum 40 characters'
                              ]"
                              :input-style="{ width: '290px' }"
                            >
                              <template v-slot:prepend>
                                <q-icon name="manage_search" />
                              </template>
                            </q-input>
                            <q-btn color="primary" icon="search" @click="onSearchGeneLocation" />
                            <q-btn
                              color="primary"
                              icon="more_vert"
                              @click="locationLongText = !locationLongText"
                            ></q-btn>
                            <q-btn
                              color="primary"
                              icon="clear"
                              class="reset_location_search"
                              @click="onResetLocationSearch()"
                            />
                          </q-btn-group>
                        </div>
                      </div>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="this.panel !== null && this.panel.length > 0 ? 'active' : ''"
                >
                  <span class="filter_section_name">
                    Gene Panel
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 500px">
                      <div class="gene-panel-selection">
                        <GenePanel
                          :panel="panel"
                          :panelOptionsFilter="panelOptionsFilter"
                          :panelOptions="panelOptions"
                          @filterPanel="filterPanel"
                          @onNewPanelSelect="onNewPanelSelect"
                        />
                      </div>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['scenario'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Scenario
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card>
                      <q-card-section class="left-bar-select-card">
                        <ScenarioFilter
                          v-if="renderComponent"
                          :scenarioOptions="scenarioOptions"
                          :filters="filters"
                          @onClickSamplesUpdate="onClickSamplesUpdate"
                        ></ScenarioFilter>
                      </q-card-section>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['variant_type'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Variant Type
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card>
                      <q-card-section class="left-bar-select-card">
                        <VariantTypeFilter
                          v-if="renderComponent"
                          :render-component="renderComponent"
                          :filters="filters"
                          :filter-tooltip="filterTooltip"
                          :varTypeOptions="varTypeOptions"
                          :impactSmallVTypeOptions="impactSmallVTypeOptions"
                          :impactSVTypeOptions="impactSVTypeOptions"
                          :callerOptions="callerOptions"
                          :sliderSVLength="sliderSVLength"
                          :gte="svg_gte"
                          :lte="svg_lte"
                          @onChangeSelectBox="onChangeSelectBox"
                          @onClickRadioEvent="onClickRadioEvent"
                          @onClickChangeVariantType="onClickChangeVariantType"
                          @onChangeSlider="onChangeSlider"
                          @on-slider-edit="onSliderEdit"
                          @on-slider-edit-click="onSliderEditClick"
                        />
                      </q-card-section>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['frequency'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Frequency
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 500px">
                      <q-card-section class="leftbarFreqCard">
                        <FrequencyFilter
                          v-if="renderComponent"
                          :render-component="renderComponent"
                          :frequency-slider-item="frequencySliderItem"
                          :filters="filters"
                          :select-add-frequency="selectAddFrequency"
                          :dynamic-frequency-options-display="dynamicFrequencyOptionsDisplay"
                          :dynamic-frequency-options="dynamicFrequencyOptions"
                          :searching-dynamic-frequency="searchingDynamicFrequency"
                          :frequency-dynamic-slider-item="frequencyDynamicSliderItem"
                          @on-change-slider="onChangeSlider"
                          @on-slider-edit="onSliderEdit"
                          @on-slider-edit-click="onSliderEditClick"
                          @filter-fq="filterFq"
                          @remove-more-frequency="removeMoreFrequency"
                          @add-more-frequency="addMoreFrequency"
                        >
                        </FrequencyFilter>
                      </q-card-section>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['quality'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Quality
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 400px">
                      <q-card-section class="leftbarFreqCard">
                        <QualityFilter
                          v-if="renderComponent"
                          :render-component="renderComponent"
                          :filters="filters"
                          :filter-tooltip="filterTooltip"
                          :QualityOptions="QualityOptions"
                          :qualityScore="qualityScore"
                          @on-quality-filter-click="onQualityFilterClick"
                          @on-change-slider="onChangeSlider"
                          @on-slider-edit="onSliderEdit"
                          @on-slider-edit-click="onSliderEditClick"
                        />
                      </q-card-section>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['impact'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Impact
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 450px">
                      <q-card-section
                        class="left-bar-select-card"
                        style="padding: 0; max-height: 80vh"
                      >
                        <ImpactFilter
                          v-if="renderComponent"
                          :render-component="renderComponent"
                          :filters="filters"
                          :tab="tab"
                          :filter-tooltip="filterTooltip"
                          :impactSmallVTypeOptions="impactSmallVTypeOptions"
                          :impactSmallVCodeOptions="impactSmallVCodeOptions"
                          :impactSmallVExonicOptions="impactSmallVExonicOptions"
                          :impactHighImpactOptions="impactHighImpactOptions"
                          :impactHighOptions="impactHighOptions"
                          :impactMedOptions="impactMedOptions"
                          :impactLowOptions="impactLowOptions"
                          :impactModifierOptions="impactModifierOptions"
                          :impactSVpLofOptions="impactSVpLofOptions"
                          :gte="svg_gte"
                          :lte="svg_lte"
                          @onClickRadioEvent="onClickRadioEvent"
                          @onChangeSelectBox="onChangeSelectBox"
                          @onCheckBoxAllClick="onCheckBoxAllClick"
                          @onCheckBoxItemsClick="onCheckBoxItemsClick"
                          @change-tab="changeTab"
                          @onChangeSlider="onChangeSlider"
                          @on-slider-edit="onSliderEdit"
                          @on-slider-edit-click="onSliderEditClick"
                        />
                      </q-card-section>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['prediction'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Prediction
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 500px">
                      <div class="q-gutter-y-md">
                        <q-card>
                          <q-card-section
                            class="leftbarPathoCard"
                            style="padding: 0; max-height: 80vh"
                          >
                            <PredictionFilter
                              v-if="renderComponent"
                              :render-component="renderComponent"
                              :filters="filters"
                              :filter-tooltip="filterTooltip"
                              :polyphenPredOptions="polyphenPredOptions"
                              :siftPredOptions="siftPredOptions"
                              :slider-revel="sliderRevel"
                              :sliderCADD="sliderCADD"
                              :sliderObject="sliderObject"
                              :sliderZscore="sliderZscore"
                              :sliderZscorev4="sliderZscorev4"
                              :sliderAlphaMissense="sliderAlphaMissense"
                              :sliderSpliceAI="sliderSpliceAI"
                              :sliderSift="sliderSift"
                              :sliderPolyphen="sliderPolyphen"
                              :sliderMisUpper="sliderMisUpper"
                              :sliderLoFUpper="sliderLoFUpper"
                              :spliceAIItem="spliceAIItem"
                              :alphaMissenseClassificationOptions="
                                alphaMissenseClassificationOptions
                              "
                              :caddClassificationOptions="caddClassificationOptions"
                              :spliceAIInterpretationOptions="spliceAIInterpretationOptions"
                              :revelOptions="revelOptions"
                              :gte="svg_gte"
                              :lte="svg_lte"
                              @on-polyphen-pred-click="onPolyphenPredClick"
                              @on-polyphen-pred-items-click="onPolyphenPredItemsClick"
                              @on-sift-pred-click="onSiftPredClick"
                              @on-sift-pred-items-click="onSiftPredItemsClick"
                              @on-slider-edit-reserve="onSliderEditReserve"
                              @onChangeSelectBox="onChangeSelectBox"
                              @onCheckBoxAllClick="onCheckBoxAllClick"
                              @onCheckBoxItemsClick="onCheckBoxItemsClick"
                              @on-change-slider="onChangeSlider"
                              @on-slider-edit="onSliderEdit"
                              @on-slider-edit-click="onSliderEditClick"
                              @on-checkbox-click="onCheckboxClick"
                              @change-tab="changePathTab"
                            />
                          </q-card-section>
                        </q-card>
                      </div>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['evidence'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Evidence
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 500px">
                      <div class="q-gutter-y-md">
                        <q-card>
                          <q-card-section
                            class="leftbarPathoCard"
                            style="padding: 0; max-height: 80vh"
                          >
                            <EvidenceFilter
                              v-if="renderComponent"
                              :render-component="renderComponent"
                              :filters="filters"
                              :filter-tooltip="filterTooltip"
                              :clinVarClinsigOptions="clinVarClinsigOptions"
                              :impactSVClinGenHIOptions="impactSVClinGenHIOptions"
                              :impactSVClinGenTSOptions="impactSVClinGenTSOptions"
                              :gte="svg_gte"
                              :lte="svg_lte"
                              @onChangeSelectBox="onChangeSelectBox"
                            />
                          </q-card-section>
                        </q-card>
                      </div>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['prioritization'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Prioritization
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 450px">
                      <div class="q-gutter-y-md">
                        <q-card>
                          <q-card-section class="left-bar-select-card">
                            <PrioritizationFilter
                              v-if="renderComponent"
                              :render-component="renderComponent"
                              :filters="filters"
                              :exomSliderItem="exomSliderItem"
                              :userInfo="userInfo"
                              :selectedExomiser="selectedExomiser"
                              :gte="svg_gte"
                              :lte="svg_lte"
                              @onChangeSlider="onChangeSlider"
                              @onSliderEditReserve="onSliderEditReserve"
                              @onSliderEditClick="onSliderEditClick"
                            />
                          </q-card-section>
                        </q-card>
                      </div>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
              <div class="filter_section">
                <div
                  class="filter-inner univar-filter-btn"
                  :class="
                    Object.keys(this.variantsFilter).some((el) =>
                      this.filtersMapping['others'].includes(el)
                    )
                      ? 'active'
                      : ''
                  "
                >
                  <span class="filter_section_name">
                    Status
                    <q-icon name="arrow_drop_down"></q-icon>
                  </span>
                  <q-popup-proxy>
                    <q-card style="width: 400px">
                      <div class="q-gutter-y-md">
                        <q-card>
                          <q-card-section class="left-bar-select-card">
                            <OthersFilter
                              v-if="renderComponent"
                              :render-component="renderComponent"
                              :filters="filters"
                              :userInfo="userInfo"
                              :sliderSUPP="sliderSUPP"
                              :gte="svg_gte"
                              :lte="svg_lte"
                              :readStatusOptions="readStatusOptions"
                              :noteStatusOptions="noteStatusOptions"
                              :varTypeOptions="varTypeOptions"
                              @onClickRadioEvent="onClickRadioEvent"
                              @onClickChangeVariantType="onClickChangeVariantType"
                              @onChangeSelectBox="onChangeSelectBox"
                              @on-change-slider="onChangeSlider"
                              @on-slider-edit="onSliderEdit"
                              @on-slider-edit-click="onSliderEditClick"
                            />
                          </q-card-section>
                        </q-card>
                      </div>
                    </q-card>
                  </q-popup-proxy>
                </div>
              </div>
            </div>
          </div>

          <VariantsTable
            ref="VariantsTable"
            :leftBarExpanded="leftBarExpanded"
            :variantsDataColumns="columns"
            :variantsType="'all'"
            :variantsDataRows="rows"
            :variantsSamples="variantsSamples"
            :tableLoading="tableLoading"
            :updating="updating"
            :sortingColumns="sortingColumns"
            :variants-per-page="variantsPerPage"
            :current-page="currentPage"
            :totalCount="totalCount"
            :filtered-total-count="filteredTotalCount"
            :database_selected="database_selected"
            :IsStandalone="IsStandalone"
            @onColumnSort="onColumnSort"
            @onClickClearSort="onClickClearSort"
            @onRowHover="onRowHover"
            @onNextPage="onNextPage"
            @onVariantTableClick="onVariantTableClick"
            @onNoteSubmit="onNoteSubmit"
          />
        </div>

        <div>
          <div class="hidden clipboard">{{ clipboard }}</div>
          <div class="hidden filtered-panels">{{ panel }}</div>
          <div class="hidden variants-filter">{{ variantsFilter }}</div>
        </div>

        <q-btn
          color="primary"
          icon="tune"
          class="all-filtered-btn"
          v-if="
            Object.keys(this.variantsFilter).length > 0 || (this.panel && this.panel.length !== 0)
          "
        >
          <q-popup-proxy>
            <div>
              <div class="all-filtered-reset" v-close-popup @click="onResetFilter">
                <div>
                  <q-tooltip>Clear all</q-tooltip
                  ><q-icon name="restart_alt" class="all-filtered-reset-btn" />
                </div>
              </div>
              <div class="all-filtered-ele">
                <FilteredBox
                  :variantsFilter="this.variantsFilter"
                  :panels="convertPanel(this.panel)"
                  :fieldArray="[]"
                  :show-all="true"
                  @onClickRemoveFiltered="onClickRemoveFiltered"
                  @removeSelectedPanel="removeSelectedPanel"
                  :allowRemove="true"
                />
              </div>
            </div>
          </q-popup-proxy>
        </q-btn>
      </div>
    </q-page>
  </div>
  <q-dialog v-model="pipelineInfoDialog">
    <div class="pipeline-info-card">
      <q-card>
        <PipelineInfo :pipeline-info-data="pipelineInfoData"></PipelineInfo>
      </q-card>
    </div>
  </q-dialog>
  <q-dialog v-model="isNearlyExpireDialog" persistent>
    <q-card class="expire-dialog">
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white" />
        <div class="row col-10">
          <div v-if="!startCountDownTime" class="col-12 q-pl-sm">Your session is expired</div>
          <div v-if="startCountDownTime" class="col-12 q-pl-sm">
            Your session is about to expire.
          </div>
          <div v-if="startCountDownTime" class="col-12 q-pl-sm">
            You will be logged out in {{ displayCountDown }}.
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-if="!startCountDownTime"
          flat
          label="Login Again"
          color="primary"
          @click="logout"
          v-close-popup
        />
        <q-btn
          v-if="startCountDownTime"
          flat
          label="Logout"
          color="primary"
          @click="logout"
          v-close-popup
        />
        <q-btn
          v-if="startCountDownTime"
          flat
          label="Continue Session"
          color="primary"
          @click="continueSession"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style>
@import '@/assets/styles/main.scss';
</style>
<script>
import { ref } from 'vue'
import router from '@/router'
import { laDnaSolid } from '@quasar/extras/line-awesome'
import filtersDefault from '@/models/variants-table/filter/filters_default'
import scenarioOptions from '@/models/variants-table/filter/scenario/scenarioOptions.json'
import impactHighOptions from '@/models/variants-table/filter/impact/impactHighOptions.json'
import impactMedOptions from '@/models/variants-table/filter/impact/impactMedOptions.json'
import impactLowOptions from '@/models/variants-table/filter/impact/impactLowOptions.json'
import impactModifierOptions from '@/models/variants-table/filter/impact/impactModifierOptions.json'
import impactSVpLofOptions from '@/models/variants-table/filter/impact/impactSVpLofOptions.json'
import impactSVClinGenHIOptions from '@/models/variants-table/filter/pathogenicity/clinGenHIOptions.json'
import impactSVClinGenTSOptions from '@/models/variants-table/filter/pathogenicity/clinGenTSOptions.json'
import impactSmallVTypeOptions from '@/models/variants-table/filter/impact/impactSmallVTypeOptions.json'
import impactSmallVCodeOptions from '@/models/variants-table/filter/impact/impactSmallVCodeOptions.json'
import impactSmallVExonicOptions from '@/models/variants-table/filter/impact/impactSmallVExonicOptions.json'
import impactSVTypeOptions from '@/models/variants-table/filter/impact/impactSVTypeOptions.json'
import clinVarClinsigOptions from '@/models/variants-table/filter/pathogenicity/clinVarClinsigOptions.json'
import pathogenicityOptions from '@/models/variants-table/filter/pathogenicity/pathogenicityOptions.json'
//import callerOptions from '@/models/variants-table/filter/others/callerOptions.json'
import repeatsRepeatsMaskerOptions from '@/models/variants-table/filter/repeats/repeatsRepeatsMaskerOptions.json'
import impactHighImpactOptions from '@/models/variants-table/filter/impact/impactHighImpactOptions.json'
import varTypeOptions from '@/models/variants-table/filter/others/varTypeOptions.json'
import readStatusOptions from '@/models/variants-table/filter/others/readStatusOptions.json'
import noteStatusOptions from '@/models/variants-table/filter/others/noteStatusOptions.json'
import polyphenPredOptions from '@/models/variants-table/filter/prediction/polyphenPredOptions'
import siftPredOptions from '@/models/variants-table/filter/pathogenicity/siftPredOptions.json'
import qualityScore from '@/models/variants-table/filter/quality/qualityScore.json'
import qualityfilterOptions from '@/models/variants-table/filter/quality/qualityfilterOptions.json'
import filtersMapping from '@/models/variants-table/filter/common/filters-fields-mapping.json'
import VariantsTable from '@/components/variants-table/VariantsTable.vue'
import ColumnSelection from '@/components/variants-table/table-info/ColumnSelection.vue'
import SortSelection from '@/components/variants-table/table-info/SortSelection.vue'
import allVariantColumns from '@/models/variants-table/columns/allVariantColumns'
import smallVariantColumns from '@/models/variants-table/columns/smallVariantColumns'
import structuralVariantColumns from '@/models/variants-table/columns/structuralVariantColumns'
import svDetailsColumns from '@/models/variants-table/columns/svDetailsColumns'
import VariantsSamplesPanel from '@/components/variants-table/table-info/VariantsSamplesPanel.vue'
import FilteredBox from '@/components/variants-table/filters/FilteredBox.vue'
import ScenarioFilter from '@/components/variants-table/filters/ScenarioFilter.vue'
import FrequencyFilter from '@/components/variants-table/filters/FrequencyFilter.vue'
import QualityFilter from '@/components/variants-table/filters/QualityFilter.vue'
import ImpactFilter from '@/components/variants-table/filters/ImpactFilter.vue'
import PredictionFilter from '@/components/variants-table/filters/PredictionFilter.vue'
import EvidenceFilter from '@/components/variants-table/filters/EvidenceFilter.vue'
import VariantTypeFilter from '@/components/variants-table/filters/VariantTypeFilter.vue'
import PrioritizationFilter from '@/components/variants-table/filters/PrioritizationFilter.vue'
import OthersFilter from '@/components/variants-table/filters/OthersFilter.vue'
import DatabaseSelect from '@/components/variants-table/table-info/DatabaseSelect.vue'
import TableTutorial from '@/components/variants-table/table-info/TableTutorial.vue'
import GenePanel from '@/components/variants-table/filters/GenePanel.vue'
import PresetSelect from '@/components/variants-table/table-info/PresetSelect.vue'
import ExomiserSelect from '@/components/variants-table/table-info/ExomiserSelect.vue'
import ExomiserBox from '@/components/variants-table/table-info/ExomiserBox.vue'
import BookmarkSelect from '@/components/variants-table/table-info/BookmarkSelect.vue'
import ExportButton from '@/components/variants-table/table-info/ExportButton.vue'
import sliderSVLength from '@/models/variants-table/filter/others/sliderSVLength.json'
import sliderFiveStep from '@/models/variants-table/filter/common/sliderFiveStep.json'
import sliderLoFUpper from '@/models/variants-table/filter/pathogenicity/sliderLoFUpper.json'
import sliderMisUpper from '@/models/variants-table/filter/pathogenicity/sliderMisUpper.json'
import sliderExom from '@/models/variants-table/filter/prioritization/sliderExom.json'
import sliderAlphaMissense from '@/models/variants-table/filter/prediction/sliderAlphaMissense'
import sliderRevel from '@/models/variants-table/filter/prediction/sliderRevel'
import sliderCADD from '@/models/variants-table/filter/prediction/sliderCADD'
import sliderSUPP from '@/models/variants-table/filter/others/sliderSUPP'
import sliderZscore from '@/models/variants-table/filter/prediction/sliderZscore'
import sliderZscorev4 from '@/models/variants-table/filter/prediction/sliderZscorev4'
import sliderSift from '@/models/variants-table/filter/prediction/sliderSift'
import sliderPolyphen from '@/models/variants-table/filter/prediction/sliderPolyphen'
import sliderSpliceAI from '@/models/variants-table/filter/prediction/sliderSpliceAI'
import filterTooltip from '@/models/variants-table/tooltip/filterTooltip.json'
import exomSliderItem from '@/models/variants-table/filter/prioritization/exomSliderItem'
import frequencySliderItem from '@/models/variants-table/filter/frequency/frequencySliderItem'
import frequencyDynamicSliderItem from '@/models/variants-table/filter/frequency/frequencyDynamicSliderItem'
import spliceAIItem from '@/models/variants-table/filter/impact/spliceAIItem'
import alphaMissenseClassificationOptions from '@/models/variants-table/filter/prediction/alphaMissenseClassificationOptions'
import caddClassificationOptions from '@/models/variants-table/filter/prediction/caddClassificationOptions'
import spliceAIInterpretationOptions from '@/models/variants-table/filter/prediction/spliceAIInterpretationOptions'
import revelOptions from '@/models/variants-table/filter/prediction/revelOptions'
import {
  getFilterObjectCustomValue,
  getFilterObjectNormal,
  getFilterObjectNoStep,
  getFilterObjectSVLength
} from '@/utils/variants-table/filter/slider-utils'
import {
  getFilterImpactObjectByCheckBox,
  getFilterObjectByCheckBox
} from '@/utils/variants-table/filter/checkbox-utils'
import {
  getFilterObjectByRadioButton,
  getFilterObjectByScenario
} from '@/utils/variants-table/filter/radio-utils'
import {
  getFilterObjectBySelected,
  getFilterObjectBySelectedClinGen
} from '@/utils/variants-table/filter/drop-select-utils'
import {
  getFilterObjectByVariantsFilter,
  loadNewFiltersFromFilterObject
} from '@/utils/variants-table/filter/filters-converter-utils'
import {
  getFilterObjectByLocationSearching,
  removeLocationTextSearchFilter
} from '@/utils/variants-table/filter/location-search-utils'
import {
  convertCurrentColumnsToSavedFormat,
  convertDefaultColumnsToBookmarkFormat,
  getColumnsDisplayOnSelect,
  getDisplayColumns,
  getSortingOnloadBookmark,
  onColumnMoveFromSelection,
  sortCurrentColumnByFrozenAndShow,
  onColumnSortFromVariantTable
} from '@/utils/variants-table/columns/columns-utils'
import {
  getDisplayColumnsFromURL,
  getDisplayColumnsObjectFromURL,
  getPanelsFromURL,
  getSamplesStatusFromURL,
  getSelectedDBFromURL,
  getSortingFromURL,
  getURLFromAllConditions
} from '@/utils/variants-table/url-control/url-control-utils'
import { convertPanelFromValueToName } from '@/utils/variants-table/filter/gene-panel-utils'
import store from '../store/store'
import PipelineInfo from '@/components/variants-table/table-info/PipelineInfo.vue'
import gte from '@/assets/img/gte.svg'
import lte from '@/assets/img/lte.svg'
import sortingOptions from '@/models/variants-table/sort/sortingOptions.json'

export default {
  name: 'VariantsMain',
  components: {
    VariantsTable,
    ColumnSelection,
    SortSelection,
    VariantsSamplesPanel,
    FilteredBox,
    ScenarioFilter,
    FrequencyFilter,
    QualityFilter,
    ImpactFilter,
    PredictionFilter,
    EvidenceFilter,
    VariantTypeFilter,
    PrioritizationFilter,
    OthersFilter,
    DatabaseSelect,
    GenePanel,
    PresetSelect,
    BookmarkSelect,
    ExportButton,
    PipelineInfo,
    ExomiserSelect,
    ExomiserBox,
    TableTutorial
  },
  data() {
    return {
      laDnaSolid,
      variantsPerPage: 300,
      userInfo: this.userInfo,
      locationLongText: false,
      allowFiltering: false,
      renderComponent: true,
      leftBarExpanded: true,
      expandedIcon: 'arrow_left',
      updating: false,
      tableLoading: false,
      disableEvent: false,
      selectColumnsDialog: false,
      sortColumnsDialog: false,
      pipelineInfoData: {},
      variantsSamplesDialog: false,
      confirmSelectDialog: false,
      confirmSelectAction: 'read',
      confirmSelectVariantNum: 0,
      database: '',
      database_options: [],
      database_filter_options: this.database_options,
      database_selected: '',
      preset_options: [],
      bookmark_options: [],
      bookmark_column_loaded: [],
      hoverRow: 0,
      selected: ref([]),
      currentPage: 0,
      totalCount: '',
      filteredTotalCount: '',
      panel: [],
      panelOptions: [],
      panelOptionsFilter: this.panelOptions,
      geneDetailsObj: {},
      geneNote: '',
      appPresetPlaceHolder: 'Preset Name',
      appPresetNew: '',
      appColumnBookmark: '',
      scenarioOptions: scenarioOptions,
      tab: 'small_v',
      path_tab: 'small_v',
      callerOptions: [],
      exomiserInfo: [],
      selectedExomiser: {},
      impactSVTypeOptions: impactSVTypeOptions,
      impactSVpLofOptions: impactSVpLofOptions,
      pathogenicityOptions: pathogenicityOptions,
      clinVarClinsigOptions: clinVarClinsigOptions,
      impactSVClinGenHIOptions: impactSVClinGenHIOptions,
      impactSVClinGenTSOptions: impactSVClinGenTSOptions,
      impactHighOptions: impactHighOptions,
      impactMedOptions: impactMedOptions,
      impactLowOptions: impactLowOptions,
      impactModifierOptions: impactModifierOptions,
      impactSmallVTypeOptions: impactSmallVTypeOptions,
      impactSmallVCodeOptions: impactSmallVCodeOptions,
      impactSmallVExonicOptions: impactSmallVExonicOptions,
      repeatsRepeatsMaskerOptions: repeatsRepeatsMaskerOptions,
      impactHighImpactOptions: impactHighImpactOptions,
      siftPredOptions: siftPredOptions,
      alphaMissenseClassificationOptions: alphaMissenseClassificationOptions,
      caddClassificationOptions: caddClassificationOptions,
      spliceAIInterpretationOptions: spliceAIInterpretationOptions,
      revelOptions: revelOptions,
      polyphenPredOptions: polyphenPredOptions,
      readStatusOptions: readStatusOptions,
      noteStatusOptions: noteStatusOptions,
      varTypeOptions: varTypeOptions,
      QualityOptions: qualityfilterOptions,
      qualityScore: qualityScore,
      sortingColumns: [],
      svDetailsColumns: svDetailsColumns,
      defaultAllColumns: allVariantColumns,
      columns: {
        all: sortCurrentColumnByFrozenAndShow(allVariantColumns, this.userInfo.roles),
        small: sortCurrentColumnByFrozenAndShow(smallVariantColumns, this.userInfo.roles),
        structural: sortCurrentColumnByFrozenAndShow(structuralVariantColumns, this.userInfo.roles)
      },
      filtersMapping: filtersMapping,
      rows: [],
      variantsSamples: {},
      variantsSamplesDummy: {},
      variantsFilter: {},
      variantsSamplesDetails: {},
      sliderObject: sliderFiveStep,
      sliderRevel: sliderRevel,
      sliderCADD: sliderCADD,
      sliderSUPP: sliderSUPP,
      sliderExom: sliderExom,
      sliderZscore: sliderZscore,
      sliderZscorev4: sliderZscorev4,
      sliderAlphaMissense: sliderAlphaMissense,
      sliderSpliceAI: sliderSpliceAI,
      sliderSift: sliderSift,
      sliderPolyphen: sliderPolyphen,
      sliderLoFUpper: sliderLoFUpper,
      sliderMisUpper: sliderMisUpper,
      sliderSVLength: sliderSVLength,
      exomSliderItem: exomSliderItem,
      frequencySliderItem: frequencySliderItem,
      frequencyDynamicSliderItem: frequencyDynamicSliderItem,
      dynamicFrequencyOptions: [],
      dynamicFrequencyOptionsDisplay: [],
      dynamicFrequencyOptionsArr: [
        // currently there are no both snp & sv filter
        // {
        //   "label": "Both SNP & SV",
        //   "children": []
        // },
        {
          label: 'Small Variant',
          children: []
        },
        {
          label: 'Structural Variant',
          children: []
        }
      ],
      selectAddFrequency: '',
      searchingDynamicFrequency: false,
      spliceAIItem: spliceAIItem,
      filters: filtersDefault,
      tempDefaultFilters: {},
      tempDefaultColumns: {},
      filterTooltip: filterTooltip,
      variantsType: 'all',
      isExporting: false,
      clipboard: '',
      appVersion: store.getters.getAppVersion,
      pipelineInfoDialog: false,
      isNearlyExpireDialog: false,
      startCountDownTime: null,
      displayCountDown: '',
      autoLogout: null,
      IsStandalone: false,
      isExample: false,
      exomiserDialog: false,
      exomiserRunning: false,
      exomiserConfirmDeleteDialog: false,
      tempExomiserConfirmDeleteDialogValue: undefined,
      svg_gte: gte,
      svg_lte: lte,
      sortingOptions: sortingOptions
    }
  },
  async beforeCreate() {
    // const roles = this.userInfo.roles;
    // const allowed_roles = ['ROLE_UNIVAR_USER'];
    // const hasMatchingRole = roles.some(role => allowed_roles.some(allowedRole => role.toLowerCase() === allowedRole.toLowerCase()));
    // if( !hasMatchingRole ) {
    //   router.push({ name: 'AccessDenied' })
    // }
  },
  async mounted() {
    this.refreshInterval = setInterval(async () => {
      await this.getExomiserInfo()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.refreshInterval)
  },
  async created() {
    this.tempDefaultFilters = JSON.parse(JSON.stringify(filtersDefault))
    this.tempDefaultColumns = JSON.parse(JSON.stringify(this.columns))
    await this.initVariantTable()
  },
  computed: {
    storeExporting: () => {
      return store.getters.isExporting
    },
    storeNearlyExpire: () => {
      return store.getters.isNearlyExpire
    }
  },
  watch: {
    'filters.variant_type': function (newVal, oldVal) {
      // if (newVal === null) {
        this.variantsType = 'all'
      // } else {
      //   this.variantsType = newVal
      // }
      this.loadColumnsFromStorage()
    },
    storeExporting(newVal) {
      this.isExporting = newVal
    },
    storeNearlyExpire(updatedValue) {
      if (updatedValue) {
        const TIMEOUT = import.meta.env.VITE_SHOW_EXPIRE_TIME
        this.startCountDownTime = new Date().getTime() + TIMEOUT
        this.getDisplayTimeout()
        const timeoutFunction = setInterval(() => {
          this.getDisplayTimeout()
        }, 1000)

        // autologout when timeup
        this.autoLogout = setInterval(async () => {
          clearInterval(timeoutFunction)
          this.startCountDownTime = null
          localStorage.setItem('force-logout', 'true')
          // await this.$keycloak.clearToken();
        }, TIMEOUT)
        this.isNearlyExpireDialog = true
      }
    },
    isNearlyExpireDialog(updatedValue) {
      if (!updatedValue) {
        store.commit('updateNearlyExpire', false)
      }
    },
    frequencyDynamicSliderItem: {
      async handler(newVal, oldVal) {
        await this.updateDynamicFrequency()
      },
      immediate: true,
      deep: true
    },
    '$store.state.appVersion': function () {
      this.appVersion = this.$store.state.appVersion
    }
  },
  methods: {
    async resetVariantTable(pageInit = false) {
      this.variantsTableScrollToTop()
      this.totalCount = ''
      this.filteredTotalCount = ''
      this.currentPage = 0
      this.$refs.VariantsTable.onResetSelectedVariants()

      let hasUrlQuery = Object.keys(this.$route.query).length > 0

      if (hasUrlQuery) {
        this.renderComponent = false
        /** Handle params passed from URL **/

        //Frozen/display columns
        let temp_variant_type = 'all'
        // if (this.$route.query['variant_type'] && this.$route.query['variant_type'] !== '') {
        //   temp_variant_type = this.$route.query['variant_type']
        // }
        this.columns[temp_variant_type] = getDisplayColumnsFromURL(
          this.$route.query,
          this.columns[temp_variant_type]
        )

        let savedColumns = getDisplayColumnsObjectFromURL(this.$route.query)
        localStorage.setItem(temp_variant_type + '_columns', JSON.stringify(savedColumns))

        //Sorting order
        getSortingFromURL(this.$route.query, this.sortingColumns, this.columns[temp_variant_type])
        localStorage.setItem('sort', JSON.stringify(this.sortingColumns))

        //Selected DB Value init
        let dbFromURL = getSelectedDBFromURL(this.$route.query, this.database_options)
        if (dbFromURL !== null) {
          this.database = dbFromURL
          localStorage.setItem('db', this.database)
        }
      } else {
        /** Fully reset Variant Table when change database**/
        this.sortingColumns = []
        if (pageInit) {
          if (localStorage.getItem('db')) {
            if (
              this.database_options.length > 0 &&
              this.database_options.some((item) => item.value === localStorage.getItem('db'))
            ) {
              this.database = this.database_options.find(
                (item) => item.value === localStorage.getItem('db')
              )
            }
          }
        }
      }

      this.variantsSamples = await this.getSampleList()

      //Samples default status from URL
      if (hasUrlQuery) {
        if (this.$route.query['affected'] || this.$route.query['not_affected']) {
          getSamplesStatusFromURL(this.$route.query, this.variantsSamples)
          await this.saveVariantSamplesInLocalStorage()
        }

        //Filters params
        let newFilters = getFilterObjectByVariantsFilter(this.$route.query)
        loadNewFiltersFromFilterObject(
          newFilters,
          this.filters,
          this.variantsFilter,
          this.variantsSamples
        )
        await this.checkSelectExomiser()
        await this.updateDynamicFrequency()

        //Gene panel params
        this.panel = getPanelsFromURL(this.$route.query)

        this.$router.replace({ query: null })
        await this.$nextTick()
        this.renderComponent = true
      }

      if (pageInit && !hasUrlQuery) {
        const savedVariantsFilter = localStorage.getItem('variantsFilter')
        const savedPanel = localStorage.getItem('panel')
        const savedSort = localStorage.getItem('sort')

        //Load Samples form local storage
        let tempSamples = []
        if (
          localStorage.getItem('samples') &&
          this.database_options.length > 0 &&
          this.database_options.some((item) => item.value === localStorage.getItem('db'))
        ) {
          let savedSamples = localStorage.getItem('samples')
          savedSamples = JSON.parse(savedSamples)
          tempSamples['affected'] = savedSamples.affected
          tempSamples['not_affected'] = savedSamples.not_affected
          tempSamples['active'] = savedSamples.active
          tempSamples['not_active'] = savedSamples.not_active
        }
        getSamplesStatusFromURL(tempSamples, this.variantsSamples)

        //Load panels value form local storage
        if (savedPanel && savedPanel.length > 0) {
          this.panel = JSON.parse(savedPanel)
        }

        //Load sorting value form local storage
        if (savedSort && Object.keys(savedSort).length > 1) {
          this.sortingColumns = JSON.parse(savedSort)
        }

        //Load filters value form local storage
        if (savedVariantsFilter && Object.keys(savedVariantsFilter).length > 1) {
          this.variantsFilter = JSON.parse(savedVariantsFilter)
          await this.loadNewFilters(JSON.parse(savedVariantsFilter), false)
        }

        //Get columns based on current variant type in local storage
        this.loadColumnsFromStorage()
      } else {
        if (!pageInit && !hasUrlQuery) {
          //change database
          localStorage.setItem('db', this.database)
          await this.onResetFilter(false)
          this.variantsFilter = {}
        }
      }

      this.variantsSamplesDetails = this.getVariantsSamplesDetails(this.variantsSamples)

      localStorage.setItem('db', this.database_selected)
      await this.saveVariantSamplesInLocalStorage()
      await this.showPipelineInfo()
      await this.getCallerInfo()
      await this.getExomiserInfo()
      await this.getIsStandalone()
      await this.getIsExample()
      await this.loadData()
    },
    async initVariantTable() {
      this.tableLoading = true
      this.database_options = await this.getDatabaseList()
      this.panelOptions = await this.getGenePanelList()
      this.panelOptionsFilter = this.panelOptions
      await this.getFrequencyOptions()
      await this.getBookmarkList()

      if (this.database_options.length > 0) {
        this.database = this.database_options[0]
        await this.resetVariantTable(true)
        this.allowFiltering = true
      }
    },
    async loadData() {
      this.currentPage = 0
      this.tableLoading = true
      this.$refs.VariantsTable.onResetSelectedVariants()
      let variantsData = await this.getVariants(this.currentPage)
      if (variantsData && variantsData.result) {
        this.rows = variantsData.result
      }
      this.getTotalCountValue(variantsData)
      if (variantsData.length !== 0) {
        this.tableLoading = false
      } else {
        this.tableLoading = true
      }
      this.variantsTableScrollToTop()
    },
    async onChangeDatabase(database) {
      if (database !== null) {
        this.database = database
        this.tableLoading = true
        this.allowFiltering = false
        await this.resetVariantTable(false)
        this.allowFiltering = true
        localStorage.setItem('db', database)
        await this.saveVariantSamplesInLocalStorage()
        this.selectedExomiser = {}
      }
    },
    loadColumnsFromStorage() {
      const savedColumns = localStorage.getItem(this.variantsType + '_columns')
      if (savedColumns) {
        let tempColumns = {}
        tempColumns["all"] = JSON.parse(savedColumns)
        getColumnsDisplayOnSelect(tempColumns, this.columns)
      }
    },
    getTotalCountValue(variantsData) {
      if (variantsData.page_info) {
        this.totalCount = variantsData.page_info.total_count
        this.filteredTotalCount = variantsData.page_info.filtered_total_count
      }
    },
    variantsTableScrollToTop() {
      const table =
        this.$refs.VariantsTable.$refs.variantsTableRef.$el.querySelector('.q-table__middle')
      table.scrollTop = 0
    },
    async getDatabaseList() {
      this.allowFiltering = false
      return await store.getters.getApiService.getDatabaseList()
    },
    async getBookmarkList() {
      const bookmarkResult = await store.getters.getApiService.getBookmarkList()
      this.preset_options = bookmarkResult.filter
      await this.stickyDefaultBookmark(this.preset_options)

      this.bookmark_options = bookmarkResult.bookmark
      await this.stickyDefaultBookmark(this.bookmark_options)
    },
    async stickyDefaultBookmark(options) {
      options.sort((a, b) => {
        if (a.data.is_default && !b.data.is_default) {
          return -1
        } else if (!a.data.is_default && b.data.is_default) {
          return 1
        } else {
          return 0
        }
      })
    },
    async getSampleList() {
      let selected_database = await this.getSelectedDatabase()
      return await store.getters.getApiService.getSampleList(selected_database)
    },
    async getGenePanelList() {
      return await store.getters.getApiService.getGenePanelList()
    },
    async getVariants(page) {
      let selected_database = await this.getSelectedDatabase()
      if (this.variantsFilter?.sv_id && Object.keys(this.variantsFilter).length > 1) {
        delete this.variantsFilter.sv_id
      }

      if (Object.keys(this.variantsFilter).length > 0) {
        localStorage.setItem('variantsFilter', JSON.stringify(this.variantsFilter))
      } else {
        localStorage.setItem('variantsFilter', JSON.stringify({}))
      }

      if (this.panel && this.panel.length > 0) {
        localStorage.setItem('panel', JSON.stringify(this.panel))
      } else {
        localStorage.setItem('panel', JSON.stringify([]))
      }

      return await store.getters.getApiService.getVariants(
        page,
        this.variantsPerPage,
        selected_database,
        this.variantsFilter,
        this.panel,
        this.sortingColumns,
        this.variantsSamples,
        this.selectedExomiser
      )
    },
    reStructureSortingColumns(sortingColumns) {
      /* example
          {
            "chrom": 1,  (asc)
            "start": -1  (desc)
          }
      */

      let sortObj = {}
      if (sortingColumns.length > 0) {
        sortingColumns.forEach((el) => {
          sortObj[el.column] = el.sort === 'asc' ? 1 : -1
        })
      }
      return sortObj
    },
    async getSelectedDatabase() {
      let selected_database = this.database
      if (typeof this.database === 'object') {
        selected_database = selected_database.value
      }

      this.database_selected = selected_database
      return selected_database
    },
    getVariantsSamplesDetails(variantsSamples) {
      let variantsSamplesDetails = {
        affected: 0,
        not_affected: 0,
        total: 0,
        family_id: variantsSamples[0]['family_id']
      }

      for (const el of variantsSamples) {
        if (el.active) {
          if (el.group === 'affected') {
            variantsSamplesDetails.affected++
          } else if (el.group === 'not_affected') {
            variantsSamplesDetails.not_affected++
          }
        }
      }

      variantsSamplesDetails.total =
        variantsSamplesDetails.affected + variantsSamplesDetails.not_affected

      return variantsSamplesDetails
    },
    async loadNewFilters(newFilterObject, loadData = true) {
      this.renderComponent = false
      this.allowFiltering = false

      //Reset filters to default value
      this.filters = JSON.parse(JSON.stringify(this.tempDefaultFilters))
      this.variantsFilter = {}

      let newFilters = getFilterObjectByVariantsFilter(newFilterObject)
      await this.updateDynamicFrequency()
      loadNewFiltersFromFilterObject(
        newFilters,
        this.filters,
        this.variantsFilter,
        this.variantsSamples
      )
      await this.checkSelectExomiser()

      await this.$nextTick()
      this.renderComponent = true
      this.allowFiltering = true

      if (loadData) {
        await this.loadData()
      }
    },
    async checkSelectExomiser() {
      if (!this.selectedExomiser || !this.selectedExomiser.run) {
        delete this.variantsFilter.highest_exomiser_gene_combined_score
        delete this.variantsFilter.highest_exomiser_gene_pheno_score
        this.filters.highest_exomiser_gene_combined_score =
          this.tempDefaultFilters.highest_exomiser_gene_combined_score
        this.filters.highest_exomiser_gene_pheno_score =
          this.tempDefaultFilters.highest_exomiser_gene_pheno_score
      }
    },
    async updateDynamicFrequency() {
      let optionsArr = JSON.parse(JSON.stringify(this.dynamicFrequencyOptionsArr))
      this.frequencyDynamicSliderItem.forEach((el) => {
        let index
        // if(el.group === 'both'){
        //   index = 0
        // } else if (el.group === 'snp'){
        //   index = 1
        // } else {
        //   index = 2
        // }

        if (el.group === 'snp') {
          index = 0
        } else {
          index = 1
        }
        optionsArr[index].children.push({
          label: el.label,
          value: el.field,
          isShow: el.isShow ? false : true
        })
      })

      this.dynamicFrequencyOptionsDisplay = optionsArr
      this.dynamicFrequencyOptions = optionsArr
    },
    copyURLToClipboard() {
      let url = getURLFromAllConditions(
        this.variantsFilter,
        this.database_selected,
        this.variantsSamples,
        this.columns["all"],
        this.sortingColumns,
        this.panel
      )

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
    async getProxyData(proxyObject) {
      return JSON.parse(JSON.stringify(proxyObject))
    },
    async onNextPage() {
      //Wait until loading is finished
      if (this.tableLoading === false) {
        await this.addNewRows()
      }
    },
    onSampleSelectionClick() {
      if (this.variantsSamples && this.variantsSamples.length > 0) {
        this.variantsSamplesDialog = true
      } else {
        return false
      }
    },
    async onRowHover(key) {
      this.hoverRow = key
    },
    async onSelectPreset(presetObj) {
      this.appPresetPlaceHolder = presetObj.label
      this.appPresetNew = ''

      let newFilterObject = presetObj.data.filters

      await this.updatePanel(presetObj.data.panels)
      await this.loadNewFilters(newFilterObject)
      this.$q.notify({
        group: true,
        icon: 'done',
        type: 'positive',
        spinner: false,
        message: 'Filter loaded.',
        timeout: 1000
      })
    },
    async onSelectBookmark(bookmarkObj) {
      this.bookmark_column_loaded = bookmarkObj
      getColumnsDisplayOnSelect(this.bookmark_column_loaded.data.columns, this.columns)

      Object.keys(this.bookmark_column_loaded.data.columns).forEach((key) => {
        if (this.bookmark_column_loaded.data.filters) {
          localStorage.setItem(
              'all_columns',
              JSON.stringify(this.bookmark_column_loaded.data.columns['all'])
            )
          // if (!bookmarkObj.data.filters.variant_type) {
          //   localStorage.setItem(
          //     'all_columns',
          //     JSON.stringify(this.bookmark_column_loaded.data.columns['all'])
          //   )
          // } else {
          //   if (bookmarkObj.data.filters.variant_type === 'small') {
          //     localStorage.setItem(
          //       'small_columns',
          //       JSON.stringify(this.bookmark_column_loaded.data.columns['small'])
          //     )
          //   } else {
          //     localStorage.setItem(
          //       'structural_columns',
          //       JSON.stringify(this.bookmark_column_loaded.data.columns['structural'])
          //     )
          //   }
          // }
        } else {
          localStorage.setItem(
            'all_columns',
            JSON.stringify(this.bookmark_column_loaded.data.columns['all'])
          )
        }
      })

      if (this.bookmark_column_loaded.data.panels) {
        await this.updatePanel(bookmarkObj.data.panels)
      } else {
        await this.updatePanel([])
      }

      this.sortingColumns = []
      if (this.bookmark_column_loaded.data.sort) {
        this.sortingColumns = getSortingOnloadBookmark(
          this.bookmark_column_loaded.data.sort,
          this.sortingColumns
        )
        const savedSort = Object.keys(bookmarkObj.data.sort).map((key) => ({
          column: key,
          sort: bookmarkObj.data.sort[key] < 0 ? 'desc' : 'asc'
        }))
        localStorage.setItem('sort', JSON.stringify(savedSort))
      } else {
        localStorage.removeItem('sort')
      }

      if (this.bookmark_column_loaded.data.filters) {
        await this.loadNewFilters(this.bookmark_column_loaded.data.filters)
      } else {
        await this.loadData()
      }

      this.$q.notify({
        group: true,
        icon: 'done',
        type: 'positive',
        spinner: false,
        message: 'Bookmark loaded.',
        timeout: 1000
      })
    },
    async updatePanel(newPanel) {
      this.panel = newPanel
      this.panelOptionsFilter = this.panelOptions
    },
    async resetDefaultColumns() {
      const defaultColumns = convertDefaultColumnsToBookmarkFormat(this.tempDefaultColumns)
      getColumnsDisplayOnSelect(defaultColumns, this.columns)

      if (this.sortingColumns.length > 0) {
        //If sorting fields != null, remove sorting and fetch table
        this.sortingColumns = []
        await this.loadData()
      }

      localStorage.removeItem(this.variantsType + '_columns')
      localStorage.removeItem('sort')

      this.$q.notify({
        group: true,
        icon: 'done',
        type: 'positive',
        spinner: false,
        message: 'Columns reset to default.',
        timeout: 1000
      })
    },
    async onDeletePreset(presetObj) {
      let result = await store.getters.getApiService.deleteBookmark(presetObj.data._id)
      if (result === 200) {
        this.$q.notify({
          group: true,
          icon: 'done',
          type: 'positive',
          spinner: false,
          message: 'Successfully deleted.',
          timeout: 1000
        })
        await this.getBookmarkList()
      }
    },
    async onSliderEditClick(object, type) {
      if (this.variantsFilter[type]) {
        object.custom_value = Object.values(this.variantsFilter[type])[0]
      } else {
        object.custom_value = ''
      }

      object.open = !object.open
    },
    async onSliderEditReserve(type, newValue, sliderObject = null) {
      if (!(newValue.trim().length === 0)) {
        let searchValue = newValue.replace(/\s+/g, '')
        if (isNaN(searchValue)) {
          this.$q.notify({
            group: true,
            timeout: 1000,
            icon: 'warning',
            message: 'Only number value is allowed.',
            type: 'negative'
          })
          return
        }

        if (sliderObject?.markerList?.length > 0) {
          if (
            searchValue <= sliderObject.markerList[0]['label'] ||
            (typeof searchValue === 'string' && searchValue.trim().length === 0)
          ) {
            searchValue = 0
          }

          //If entered value = slider value, re-render component to show update
          sliderObject.markerList.forEach((el) => {
            if (Number(searchValue) === el.db_value) {
              this.filters[type] = el.value
            }
          })
          if (Number(searchValue) === 0) {
            this.filters[type] = 1
            delete this.variantsFilter[type]
          }
        } else {
          this.filters[type] = searchValue
          if (searchValue === this.tempDefaultFilters[type]) {
            this.filters[type] = 1
            delete this.variantsFilter[type]
          }
        }

        this.variantsFilter = getFilterObjectCustomValue(
          this.variantsFilter,
          type,
          searchValue,
          sliderObject
        )
      } else {
        this.filters[type] = 1
        delete this.variantsFilter[type]
      }

      //Re-render slider component
      this.renderComponent = false
      await this.$nextTick()
      this.renderComponent = true

      await this.loadData()
    },
    async onSliderEdit(type, newValue, sliderObject = null) {
      if (!(newValue.trim().length === 0)) {
        if (isNaN(newValue)) {
          this.$q.notify({
            group: true,
            timeout: 1000,
            icon: 'warning',
            message: 'Only number value is allowed.',
            type: 'negative'
          })
          return
        }

        if (sliderObject !== null) {
          let maxValue = sliderObject?.markerList
            ? sliderObject.markerList[sliderObject.markerList.length - 1]['label']
            : sliderObject.max
          if (
            newValue >= Number(maxValue) ||
            (typeof newValue === 'string' && newValue.trim().length === 0)
          ) {
            newValue = null
          }
        }
      } else {
        newValue = null
      }

      switch (type) {
        case 'quality':
          this.filters.quality = Number(newValue)
          this.variantsFilter = getFilterObjectNoStep(
            this.variantsFilter,
            type,
            newValue,
            this.qualityScore.conditions
          )
          break
        default:
          this.variantsFilter = getFilterObjectCustomValue(
            this.variantsFilter,
            type,
            newValue,
            sliderObject
          )

          //If entered value = slider value, re-render component to show update
          if (sliderObject?.markerList?.length > 0) {
            sliderObject.markerList.forEach((el) => {
              if (Number(newValue) === el.db_value) {
                this.filters[type] = el.value
              }
            })
          } else {
            this.filters[type] = newValue
          }

          //If enter value cannot trigger filter(value = max, empty string..)
          if (newValue === null) {
            this.filters[type] = sliderObject?.markerList
              ? sliderObject.markerList[sliderObject.markerList.length - 1]['value']
              : sliderObject.max
          }
      }

      //Re-render slider component
      this.renderComponent = false
      await this.$nextTick()
      this.renderComponent = true

      await this.loadData()
    },
    async onSaveNewPreset(newPreset) {
      if (this.allowFiltering === false) {
        return
      }
      if (newPreset.trim().length !== 0) {
        if (newPreset.length > 25) {
          this.$q.notify({
            group: true,
            timeout: 1000,
            icon: 'warning',
            message: 'Preset name length should less than 25.',
            type: 'negative'
          })
          return false
        } else {
          if (Object.keys(this.variantsFilter).length > 0 || this.panel.length > 0) {
            this.allowFiltering = false
            this.tableLoading = true
            let result = await store.getters.getApiService.saveBookmarkFilter(
              newPreset,
              this.variantsFilter,
              this.panel
            )
            if (result === 201) {
              await this.getBookmarkList()
              this.$q.notify({
                group: true,
                icon: 'done',
                type: 'positive',
                spinner: false,
                message: 'Successfully Saved.',
                timeout: 1000
              })
              this.appPresetPlaceHolder = newPreset
              this.appPresetNew = ''
            } else {
              this.$q.notify({
                group: true,
                timeout: 1000,
                icon: 'warning',
                message: 'Error occurred whiling saving!',
                type: 'negative'
              })
            }
            this.allowFiltering = true
            this.tableLoading = false
          } else {
            this.$q.notify({
              group: true,
              timeout: 1000,
              icon: 'warning',
              message: 'No any filters selected.',
              type: 'negative'
            })
          }
        }
      } else {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Empty value is not allowed',
          type: 'negative'
        })
      }
    },
    async onSaveNewBookmark(key = null) {
      let newBookmarkName = this.appColumnBookmark
      let savedColumns = convertCurrentColumnsToSavedFormat(this.columns)

      if (newBookmarkName.trim().length !== 0) {
        if (newBookmarkName.length > 25) {
          this.$q.notify({
            group: true,
            timeout: 1000,
            icon: 'warning',
            message: 'Bookmark name length should less than 25.',
            type: 'negative'
          })
          return false
        } else {
          let result = await store.getters.getApiService.saveBookmarkColumn(
            newBookmarkName,
            savedColumns,
            this.variantsFilter,
            this.reStructureSortingColumns(this.sortingColumns),
            this.panel
          )
          if (result === 201) {
            await this.getBookmarkList()
            this.$q.notify({
              group: true,
              icon: 'done',
              type: 'positive',
              spinner: false,
              message: 'Successfully Saved.',
              timeout: 1000
            })
            this.appColumnBookmark = ''
          } else {
            this.$q.notify({
              group: true,
              timeout: 1000,
              icon: 'warning',
              message: 'Error occurred whiling saving!',
              type: 'negative'
            })
          }
        }
      } else {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Empty value is not allowed',
          type: 'negative'
        })
      }

      if (key === 'enter') {
        document.getElementById('save-bookmark-btn').click()
      }
    },
    async onSearchGeneLocation() {
      const geneLocationSearchText = this.filters.geneLocationSearchText.trim()

      if (geneLocationSearchText.length > 40) {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'search characters should less than 40.',
          type: 'negative'
        })
        return
      }

      this.variantsFilter = getFilterObjectByLocationSearching(
        geneLocationSearchText,
        this.variantsFilter
      )

      await this.loadData()
    },
    async onResetLocationSearch() {
      const geneLocationSearchText = this.filters.geneLocationSearchText.trim()
      if (geneLocationSearchText.length !== 0) {
        this.filters.geneLocationSearchText = ''
      }
      this.variantsFilter = removeLocationTextSearchFilter(this.variantsFilter)
      await this.loadData()
    },
    async onNewPanelSelect(Main_panel) {
      this.panel = Main_panel
      await this.loadData()
    },
    async onColumnSort(columnName) {
      onColumnSortFromVariantTable(columnName, this.sortingColumns)
      localStorage.setItem('sort', JSON.stringify(this.sortingColumns))
      await this.loadData()
    },
    async onClickClearSort(columnName) {
      this.sortingColumns.forEach((el, key) => {
        if (el.column === columnName) {
          this.sortingColumns.splice(key, 1)
        }
      })

      if (Array.isArray(this.sortingColumns)) {
        if (this.sortingColumns.length > 0) {
          localStorage.setItem('sort', JSON.stringify(this.sortingColumns))
        } else {
          localStorage.removeItem('sort')
        }
      }

      await this.loadData()
    },
    async onChangeSlider(type, newValue, sliderObject) {
      switch (type) {
        case 'len':
          this.filters.len = newValue
          this.variantsFilter = getFilterObjectSVLength(this.variantsFilter, newValue)
          break
        case 'quality':
          this.filters.quality = newValue
          this.filters['slider']['quality'].custom_value = newValue
          this.variantsFilter = getFilterObjectNoStep(
            this.variantsFilter,
            type,
            newValue,
            this.qualityScore.conditions
          )
          break
        default:
          //Assign slider value into slider custom input box
          if (sliderObject?.markerList?.length > 0) {
            sliderObject.markerList.forEach((el) => {
              if (Number(newValue) === el.value) {
                this.filters['slider'][type].custom_value = el.db_value
              }
            })
          } else {
            this.filters['slider'][type].custom_value = newValue
            if (newValue === null || newValue == this.tempDefaultFilters[type]) {
              this.filters[type] = 1
              delete this.variantsFilter[type]
              break
            }
          }

          this.filters[type] = newValue
          this.variantsFilter = getFilterObjectNormal(
            this.variantsFilter,
            type,
            newValue,
            sliderObject
          )
          break
      }
      await this.loadData()
    },
    async onChangeCheckBox(type, checkboxValue) {
      getFilterObjectByCheckBox(this.variantsFilter, type, checkboxValue)
      await this.loadData()
    },
    async onChangeSelectBox(type, selectedValue) {
      if (type === 'clingen_hi' || type === 'clingen_ts') {
        getFilterObjectBySelectedClinGen(
          this.variantsFilter,
          this.filters.clingen_hi,
          this.filters.clingen_ts
        )
      } else {
        getFilterObjectBySelected(this.variantsFilter, type, selectedValue)
      }
      await this.loadData()
    },
    async onClickRemoveFiltered(field) {
      this.renderComponent = false

      delete this.variantsFilter[field]
      let tempFilter = JSON.parse(JSON.stringify(this.tempDefaultFilters))

      switch (field) {
        case 'impact':
          this.filters[field] = []
          this.filters.impactHighSelected = []
          this.filters.impactMedSelected = []
          this.filters.impactLowSelected = []
          this.filters.impactModifierSelected = []
          this.filters.impactHighClick = false
          this.filters.impactMedClick = false
          this.filters.impactLowClick = false
          this.filters.impactModifierClick = false
          break
        case 'polyphen_pred':
          this.filters[field] = tempFilter[field]
          this.filters.PolyphenPredClick = false
          break
        case 'sift_pred':
          this.filters[field] = tempFilter[field]
          this.filters.siftPredClick = false
          break
        case 'gene_objs.gene_filter':
        case 'chrom':
        case 'start':
        case 'end':
          this.variantsFilter = removeLocationTextSearchFilter(this.variantsFilter)
          this.filters.geneLocationSearchText = ''
          break
        case 'scenario':
          this.filters['scenarioSelected'] = 'none'
          this.filters['scenario'] = 'none'
          break
        case 'panels':
          this.panel = []
          break
        default:
          this.filters[field] = tempFilter[field]
          if (this.filters['slider'][field]) {
            this.filters['slider'][field]['open'] = false
          }
      }

      await this.$nextTick()
      this.renderComponent = true

      await this.loadData()
    },
    async onResetFilter(refreshTable = true) {
      this.renderComponent = false

      this.appPresetPlaceHolder = ''
      this.appPresetNew = ''
      this.filters.geneLocationSearchText = ''
      this.panel = []
      this.selectedExomiser = {}
      await this.resetDefaultColumns()
      //Reset filters to default value
      this.filters = JSON.parse(JSON.stringify(this.tempDefaultFilters))

      await this.$nextTick()
      this.renderComponent = true //Need to re-render the slider component to make the UI changed by the updated value

      //Empty whole filter object, then refresh whole table
      this.variantsFilter = {}
      this.clearAdditionalFreq()
      if (refreshTable) {
        await this.loadData()
      }
    },
    async onPolyphenPredClick() {
      this.filters.polyphen_pred = []
      if (this.filters.PolyphenPredClick === true) {
        setTimeout(() => {
          this.filters.PolyphenPredClick = false
        }, 500)
      } else {
        await this.onChangeCheckBox('polyphen_pred', this.filters.polyphen_pred)
      }
    },
    async onPolyphenPredItemsClick() {
      if (this.filters.polyphen_pred.length > 0) {
        if (this.filters.polyphen_pred.length === this.polyphenPredOptions.length) {
          this.filters.PolyphenPredClick = false
          this.filters.polyphen_pred = []
        } else {
          this.filters.PolyphenPredClick = true
        }
      } else {
        this.filters.PolyphenPredClick = false
      }
      await this.onChangeCheckBox('polyphen_pred', this.filters.polyphen_pred)
    },
    async onSiftPredClick() {
      this.filters.sift_pred = []
      if (this.filters.siftPredClick === true) {
        setTimeout(() => {
          this.filters.siftPredClick = false
        }, 500)
      } else {
        await this.onChangeCheckBox('sift_pred', this.filters.sift_pred)
      }
    },
    async onSiftPredItemsClick() {
      if (this.filters.sift_pred.length > 0) {
        if (this.filters.sift_pred.length === this.siftPredOptions.length) {
          this.filters.siftPredClick = false
          this.filters.sift_pred = []
        } else {
          this.filters.siftPredClick = true
        }
      } else {
        this.filters.siftPredClick = false
      }
      await this.onChangeCheckBox('sift_pred', this.filters.sift_pred)
    },
    async onCheckboxClick(type) {
      getFilterObjectByCheckBox(this.variantsFilter, type, this.filters[type])
      await this.loadData()
    },
    async onCheckBoxAllClick(type) {
      if (this['filters'][type + 'Click'] === true) {
        this[type + 'Options'].forEach((el) => {
          this['filters'][type + 'Selected'].push(el.value)
        })
      } else {
        this['filters'][type + 'Selected'] = []
      }
      getFilterImpactObjectByCheckBox(
        this.variantsFilter,
        this['filters'][type + 'Selected'],
        this['filters'][type + 'Click'],
        type,
        this[type + 'Options']
      )
      await this.loadData()
    },
    async onCheckBoxItemsClick(type) {
      if (this['filters'][type + 'Selected'].length > 0) {
        this['filters'][type + 'Click'] = true
      } else {
        this['filters'][type + 'Click'] = false
      }
      getFilterImpactObjectByCheckBox(
        this.variantsFilter,
        this['filters'][type + 'Selected'],
        this['filters'][type + 'Click'],
        type,
        this[type + 'Options']
      )
      await this.loadData()
    },
    async onQualityFilterClick() {
      getFilterObjectByCheckBox(this.variantsFilter, 'pass_filter', this.filters.pass_filter)
      await this.loadData()
    },
    async onClickSamplesUpdate(scenarioValue) {
      if (!scenarioValue) {
        //If click from samples panel, get original scenario value
        scenarioValue = this.filters.scenarioSelected
      } else {
        //If click from filter > get scenario value
        this.filters.scenarioSelected = scenarioValue
      }
      getFilterObjectByScenario(
        this.variantsFilter,
        'scenario',
        scenarioValue,
        this.variantsSamples
      )

      await this.saveVariantSamplesInLocalStorage()
      localStorage.setItem('db', this.database_selected)

      await this.loadData()
    },
    async saveVariantSamplesInLocalStorage() {
      let affected_samples = []
      let not_affected_samples = []
      let active = []
      let not_active = []
      let samples = {}
      this.variantsSamples.forEach((el) => {
        if (el.active) {
          active.push(el.name)
        } else {
          not_active.push(el.name)
        }
        if (el.group === 'affected') {
          affected_samples.push(el.name)
        } else {
          not_affected_samples.push(el.name)
        }
      })
      samples['affected'] = affected_samples.join(',')
      samples['not_affected'] = not_affected_samples.join(',')
      samples['active'] = active.join(',')
      samples['not_active'] = not_active.join(',')
      localStorage.setItem('samples', JSON.stringify(samples))
    },
    async onClickRadioEvent(type, clickValue) {
      getFilterObjectByRadioButton(this.variantsFilter, type, clickValue)
      await this.loadData()
    },
    async onClickChangeVariantType() {
      this.sortingColumns = []
      localStorage.removeItem('sort')
    },
    onClickExpandLeftBar() {
      this.leftBarExpanded = !this.leftBarExpanded
      if (this.leftBarExpanded) {
        this.expandedIcon = 'arrow_left'
      } else {
        this.expandedIcon = 'arrow_right'
      }
    },
    async updateSamplesDetails(variantsSamplesDetailsNew) {
      this.variantsSamplesDetails = variantsSamplesDetailsNew
    },
    async onRestoreVariantsSamples() {
      this.tableLoading = true
      this.variantsSamples = await this.getSampleList()
      this.variantsSamplesDetails = this.getVariantsSamplesDetails(this.variantsSamples)
      await this.onClickSamplesUpdate()
      this.tableLoading = false
    },
    async bringSelectedSampleOnTop(selected) {
      this.tempSamples = JSON.parse(JSON.stringify(this.variantsSamples))
      selected.forEach((el) => {
        const index = this.variantsSamples.findIndex((obj) => obj.i === el.i)
        let elementToMove = this.tempSamples.splice(index, 1)[0]

        this.tempSamples = [elementToMove, ...this.tempSamples]
      })

      this.variantsSamples = this.tempSamples

      //Re-render slider component
      this.renderComponent = false
      await this.$nextTick()
      this.renderComponent = true
    },
    filterDatabase(val, update) {
      if (val === '') {
        update(() => {
          this.database_filter_options = this.database_options
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.database_filter_options = this.database_options.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    filterPanel(val, update) {
      if (val === '') {
        update(() => {
          this.panelOptionsFilter = this.panelOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.panelOptionsFilter = this.panelOptions.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    async onVariantTableClick(selectedVariant) {
      this.renderComponent = false

      this.appPresetPlaceHolder = ''
      this.appPresetNew = ''
      this.filters.geneLocationSearchText = ''
      this.panel = []

      //Reset filters to default value
      this.filters = JSON.parse(JSON.stringify(this.tempDefaultFilters))

      await this.$nextTick()
      this.renderComponent = true //Need to re-render the slider component to make the UI changed by the updated value

      //Empty whole filter object, then refresh whole table
      this.variantsFilter = {}
      this.variantsFilter.sv_id = selectedVariant.sv_id
      await this.loadData()
    },
    async addNewRows() {
      if (!((this.currentPage + 1) * this.variantsPerPage > this.filteredTotalCount)) {
        //Check if it is not last page
        if (this.filteredTotalCount > this.variantsPerPage) {
          //Check if more than 1 page.
          this.tableLoading = true
          this.currentPage++

          let newRows = await this.getVariants(this.currentPage)
          this.rows = this.rows.concat(newRows.result)

          this.tableLoading = false
        }
      } else {
        this.$q.notify({
          group: true,
          icon: 'notifications',
          type: 'info',
          spinner: false,
          message: 'No more variants to load.',
          timeout: 500
        })
      }
    },
    async onColumnMove(event, group, frozen_list, display_list, hidden_list, selectionVariantType) {
      onColumnMoveFromSelection(
        event,
        group,
        frozen_list,
        display_list,
        hidden_list,
        selectionVariantType,
        this.columns
      )
    },
    async onSortColumnMove(event, group, sortedList) {
      let isSort = false
      let eventType = null
      if (group === 'sorted') {
        if (event['added']) {
          eventType = 'added'
          isSort = true
        } else if (event['removed']) {
          eventType = 'removed'
          isSort = false
        }
      }

      if (eventType) {
        if (isSort) {
          const sort = event[eventType].element.sortDisplay
            ? event[eventType].element.sortDisplay.value
            : 'asc'
          const columnName = event[eventType].element.name

          const sortingColumn = this.sortingColumns.find((column) => column.column === columnName)
          if (sortingColumn) {
            sortingColumn.sort = sort
          } else {
            this.sortingColumns.push({
              column: columnName,
              sort: sort
            })
          }
          if (sortedList) {
            const map = new Map(this.sortingColumns.map((object) => [object.column, object]))
            this.sortingColumns = sortedList.map((item) => map.get(item.column))
          }
          localStorage.setItem('sort', JSON.stringify(this.sortingColumns))
          await this.loadData()
        } else {
          await this.onClickClearSort(event[eventType].element.name)
        }
      } else if (sortedList) {
        const map = new Map(this.sortingColumns.map((object) => [object.column, object]))
        this.sortingColumns = sortedList.map((item) => map.get(item.column))
        localStorage.setItem('sort', JSON.stringify(this.sortingColumns))
        await this.loadData()
      }
    },
    async onExportFile(type) {
      if (this.rows.length === 0) {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'No variants in the table.',
          type: 'negative'
        })
      } else {
        store.commit('updateExporting', true)
        await this.$nextTick()
        let selected_database = this.database_selected
        let result

        try {
          if (type === 'tsv') {
            result = await store.getters.getApiService.exportTSV(
              selected_database,
              this.variantsSamples,
              getDisplayColumns(this.columns["all"]),
              this.sortingColumns,
              this.variantsFilter,
              this.panel,
              this.selectedExomiser
            )
          } else {
            result = await store.getters.getApiService.exportVCF(
              selected_database,
              this.variantsSamples,
              this.sortingColumns,
              this.variantsFilter,
              this.panel,
              this.selectedExomiser
            )
          }

          if (result === 200) {
            store.commit('updateExporting', false)
            this.$q.notify({
              group: true,
              icon: 'done',
              type: 'positive',
              spinner: false,
              message: 'Successfully export.',
              timeout: 1000
            })
          } else if (result === 204) {
            // waiting for websocket
          } else {
            store.commit('updateExporting', false)
            this.$q.notify({
              group: true,
              timeout: 1000,
              icon: 'warning',
              message: 'Error occurred whiling exporting!',
              type: 'negative'
            })
          }
        } catch (e) {
          store.commit('updateExporting', false)
          await this.$nextTick()
        }
      }
    },

    async onMarkAsReadClicked(type) {
      this.confirmSelectAction = type
      let selected = this.$refs.VariantsTable.onMarkAsReadClicked()
      this.confirmSelectVariantNum = selected.length
      if (this.confirmSelectVariantNum === 0) {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'No selected variants.',
          type: 'negative'
        })
      } else {
        this.confirmSelectDialog = true
      }
    },

    async onConfirmMarkAsReadClicked() {
      this.$q.loading.show()
      let type = this.confirmSelectAction
      let selected = this.$refs.VariantsTable.onMarkAsReadClicked()

      let updatedVariants = []
      if (selected.length > 0) {
        selected.forEach((el) => {
          let variantsObj = {}
          variantsObj['obj_id'] = el._id
          variantsObj['is_share'] = false
          variantsObj['is_read'] = type === 'read'
          updatedVariants.push(variantsObj)
        })

        let selected_database = this.database_selected
        let result = await store.getters.getApiService.markAsRead(
          selected_database,
          updatedVariants
        )
        if (result === 202) {
          this.$q.loading.hide()
          this.$q.notify({
            group: true,
            icon: 'done',
            type: 'positive',
            spinner: false,
            message: 'Successfully updated.',
            timeout: 1000
          })

          selected.forEach((el) => {
            el.is_read = type === 'read'
          })
          this.$refs.VariantsTable.onResetSelectedVariants()
        }
      }
    },

    async onNoteSubmit(obj, tempNote) {
      this.$q.loading.show()
      let selected_database = this.database_selected
      let result = await store.getters.getApiService.saveNote(selected_database, obj.row, tempNote)
      if (result === 202) {
        this.$q.notify({
          group: true,
          icon: 'done',
          type: 'positive',
          spinner: false,
          message: 'Successfully updated.',
          timeout: 1000
        })
        this.$q.loading.hide()
        obj.row.note = tempNote
      } else {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Error occurred whiling saving!',
          type: 'negative'
        })
      }
    },

    async showPipelineInfo() {
      let pipelineInfo = await store.getters.getApiService.getPipelineInfo(this.database_selected)
      if (pipelineInfo.status === 200) {
        this.pipelineInfoData = pipelineInfo.data.data
      }
    },

    async getCallerInfo() {
      let callerInfoResult = await store.getters.getApiService.getCallerInfo(this.database_selected)
      if (callerInfoResult.status === 200) {
        this.callerOptions = callerInfoResult.data.data
      }
    },

    async getExomiserInfo() {
      if (this.database_selected) {
        let exomiserInfoResult = await store.getters.getApiService.getExomiserInfo(
          this.database_selected
        )
        if (exomiserInfoResult.status === 200) {
          this.exomiserInfo = exomiserInfoResult.data.data
          let isRunning = false
          if (this.exomiserInfo?.length > 0) {
            this.exomiserInfo.forEach((el) => {
              if (!el.is_ready) {
                isRunning = true
              }
            })
          }
          if (isRunning) {
            this.exomiserRunning = true
          } else {
            this.exomiserRunning = false
          }
        }
      }
    },

    async onSelectExomiser(exomiser) {
      this.selectedExomiser = exomiser
      await this.loadData()
    },

    async onClickDeleteExomiser(exomiser) {
      this.tempExomiserConfirmDeleteDialogValue = exomiser
      this.exomiserConfirmDeleteDialog = true
    },

    async onDeleteExomiser() {
      let exomiser = this.tempExomiserConfirmDeleteDialogValue
      let exomiserDelResult = await store.getters.getApiService.deleteExomiserInfo(
        this.database_selected,
        exomiser.run
      )
      if (exomiserDelResult.status === 200) {
        this.selectedExomiser = ''
        this.$q.notify({
          group: true,
          icon: 'done',
          type: 'positive',
          spinner: false,
          message: 'Successfully deleted.',
          timeout: 1000
        })
      }
    },

    async onRunExomiserSuccess() {
      this.exomiserDialog = false
      await this.loadData()
      await this.getExomiserInfo()
    },

    async getIsStandalone() {
      this.database_options.forEach((el) => {
        if (el.value === this.database_selected) {
          if (el.is_standalone) {
            this.IsStandalone = true
          } else {
            this.IsStandalone = false
          }
        }
      })
    },

    async getIsExample() {
      this.database_options.forEach((el) => {
        if (el.value === this.database_selected) {
          if (el.is_example) {
            this.isExample = true
          } else {
            this.isExample = false
          }
        }
      })
    },

    convertPanel(panels) {
      return convertPanelFromValueToName(panels, this.panelOptions)
    },

    async getFrequencyOptions() {
      let optionsArr = JSON.parse(JSON.stringify(this.dynamicFrequencyOptionsArr))
      this.frequencyDynamicSliderItem.forEach((el) => {
        let index
        // if(el.group === 'both'){
        //   index = 0
        // } else if (el.group === 'snp'){
        //   index = 1
        // } else {
        //   index = 2
        // }

        if (el.group === 'snp') {
          index = 0
        } else {
          index = 1
        }
        optionsArr[index].children.push({
          label: el.label,
          value: el.field,
          isShow: true
        })
      })

      this.dynamicFrequencyOptions = optionsArr
      this.dynamicFrequencyOptionsDisplay = ref(this.dynamicFrequencyOptions)
    },
    filterFq(val, update) {
      if (val === '') {
        update(() => {
          this.searchingDynamicFrequency = false
          this.dynamicFrequencyOptionsDisplay = ref(this.dynamicFrequencyOptions)
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.searchingDynamicFrequency = true

        let searchArr = []
        this.dynamicFrequencyOptions.forEach((el) => {
          el.children.forEach((child) => {
            if (child.label.toLowerCase().indexOf(needle) !== -1) {
              if (child.isShow) {
                searchArr.push(child)
              }
            }
          })
        })
        this.dynamicFrequencyOptionsDisplay = searchArr
      })
    },
    addMoreFrequency() {
      this.frequencyDynamicSliderItem.forEach((el, key) => {
        if (el.field === this.selectAddFrequency.value) {
          el.isShow = true
        }
      })

      this.dynamicFrequencyOptions.forEach((el) => {
        el.children.forEach((child) => {
          if (child.value === this.selectAddFrequency.value) {
            child.isShow = false
          }
        })
      })

      this.selectAddFrequency = ''
    },
    removeMoreFrequency(field) {
      this.frequencyDynamicSliderItem.forEach((el) => {
        if (el.field === field) {
          el.isShow = false
        }
      })

      this.dynamicFrequencyOptions.forEach((el) => {
        el.children.forEach((child) => {
          if (child.value === field) {
            child.isShow = true
          }
        })
      })

      if (this.variantsFilter[field]) {
        //Only refresh If filtered
        this.onClickRemoveFiltered(field)
      }
    },
    clearAdditionalFreq() {
      this.frequencyDynamicSliderItem.forEach((el) => {
        el.isShow = false
      })
      this.dynamicFrequencyOptions.forEach((el) => {
        el.children.forEach((child) => {
          child.isShow = true
        })
      })
    },
    async removeSelectedPanel(panel_value) {
      for (let i = 0; i < this.panel.length; i++) {
        if (this.panel[i] === panel_value) {
          this.panel.splice(i, 1)
          break
        }
      }

      await this.loadData()
    },

    async changeTab(tab) {
      this.tab = tab
    },
    async changePathTab(path_tab) {
      this.path_tab = path_tab
    },
    displayPipelineInfo() {
      this.pipelineInfoDialog = true
    },
    getDisplayTimeout() {
      const timeDifference = this.startCountDownTime - new Date().getTime()
      const millisecondsInOneSecond = 1000
      const millisecondsInOneMinute = millisecondsInOneSecond * 60
      const millisecondsInOneHour = millisecondsInOneMinute * 60
      const remainderDifferenceInMinutes =
        (timeDifference % millisecondsInOneHour) / millisecondsInOneMinute
      const remainderDifferenceInSeconds =
        (timeDifference % millisecondsInOneMinute) / millisecondsInOneSecond
      const remainingMinutes = Math.floor(remainderDifferenceInMinutes)
      const remainingSeconds = Math.floor(remainderDifferenceInSeconds)
      this.displayCountDown =
        remainingMinutes > 0
          ? remainingMinutes + ' minutes ' + ': ' + remainingSeconds + ' seconds'
          : remainingSeconds + ' seconds'
    },
    async logout() {
      localStorage.removeItem('force-logout')
      await store.getters.getApiService.logout()
      await this.$keycloak.logout()
    },
    continueSession() {
      store.commit('updateNearlyExpire', false)
      clearInterval(this.autoLogout)
    }
  }
}
</script>
