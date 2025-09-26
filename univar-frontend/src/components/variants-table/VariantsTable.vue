<template>
  <div class="full-width variants-table-container">
    <div class="loading-spinner" v-if="tableLoading || tableLoadingOnClickVariant">
      <svg
        class="q-spinner variants-table-spinner"
        width="3em"
        height="3em"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="5"
            stroke-miterlimit="10"
            d="M58.4,51.7c-0.9-0.9-1.4-2-1.4-2.3s0.5-0.4,1.4-1.4 C70.8,43.8,79.8,30.5,80,15.5H70H30H20c0.2,15,9.2,28.1,21.6,32.3c0.9,0.9,1.4,1.2,1.4,1.5s-0.5,1.6-1.4,2.5 C29.2,56.1,20.2,69.5,20,85.5h10h40h10C79.8,69.5,70.8,55.9,58.4,51.7z"
          ></path>
          <clipPath id="uil-hourglass-clip1">
            <rect x="15" y="20" width=" 70" height="25">
              <animate
                attributeName="height"
                from="25"
                to="0"
                dur="1s"
                repeatCount="indefinite"
                values="25;0;0"
                keyTimes="0;0.5;1"
              ></animate>
              <animate
                attributeName="y"
                from="20"
                to="45"
                dur="1s"
                repeatCount="indefinite"
                values="20;45;45"
                keyTimes="0;0.5;1"
              ></animate>
            </rect>
          </clipPath>
          <clipPath id="uil-hourglass-clip2">
            <rect x="15" y="55" width=" 70" height="25">
              <animate
                attributeName="height"
                from="0"
                to="25"
                dur="1s"
                repeatCount="indefinite"
                values="0;25;25"
                keyTimes="0;0.5;1"
              ></animate>
              <animate
                attributeName="y"
                from="80"
                to="55"
                dur="1s"
                repeatCount="indefinite"
                values="80;55;55"
                keyTimes="0;0.5;1"
              ></animate>
            </rect>
          </clipPath>
          <path
            d="M29,23c3.1,11.4,11.3,19.5,21,19.5S67.9,34.4,71,23H29z"
            clip-path="url(#uil-hourglass-clip1)"
            fill="currentColor"
          ></path>
          <path
            d="M71.6,78c-3-11.6-11.5-20-21.5-20s-18.5,8.4-21.5,20H71.6z"
            clip-path="url(#uil-hourglass-clip2)"
            fill="currentColor"
          ></path>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="180 50 50"
            repeatCount="indefinite"
            dur="1s"
            values="0 50 50;0 50 50;180 50 50"
            keyTimes="0;0.7;1"
          ></animateTransform>
        </g>
      </svg>
    </div>
    <q-table
      class="variants-table box-shadow-none"
      :rows="variantsDataRows"
      :columns="variantsDataColumns[variantsType]"
      row-key="variant_id"
      :pagination="initialPagination"
      selection="multiple"
      v-model:selected="selected"
      virtual-scroll
      :style="
        fullScreen
          ? 'height: 100vh'
          : 'height: calc(100vh - 58px - 50px - 76px - 89px - 46px - 30px)'
      "
      ref="variantsTableRef"
      :wrap-cells="true"
      @virtual-scroll="frozenTableColumns"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:header-selection="scope">
        <q-toggle v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-toggle v-model="scope.selected" />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props" class="variants-table-header">
          <q-th class="variants-expand-header"></q-th>
          <q-th class="variants-select-sticky-header" auto-width>
            <q-checkbox v-model="props.selected" />
            <div class="resize-border"></div>
          </q-th>
          <q-th class="variants-note-header">
            Note
            <div class="resize-border"></div>
          </q-th>
          <template v-for="(item, index) in variantsDataColumns[variantsType]">
            <q-th
              :prop="item.prop"
              :key="index"
              :label="item.label"
              :id="'table-' + item.name"
              :column="item.name"
              v-if="item.isShow"
              class="variants-table-th"
              @mousedown="onTableResizeStart($event, item)"
              @mousemove="onTableResize($event)"
              @mouseup="onTableResizeStop($event, item)"
            >
              <div class="variants-table-column-label">
                <div @click="onColumnSort(item.name)" class="table-header-col" v-if="item.sortable">
                  {{ item.label }}<span v-html="displaySortingIcon(item.name)"></span>
                </div>
                <div v-else>
                  {{ item.label }}
                </div>
                <span
                  v-html="displaySortingNum(item.name)"
                  @click="onClickClearSort(item.name)"
                ></span>
              </div>
              <div class="resize-border"></div>
            </q-th>
          </template>
        </q-tr>
      </template>

      <template v-slot:top="props">
        <q-btn
          flat
          round
          dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="onClickFullScreen(props)"
          ref="fullScreenBtn"
          class="q-ml-md"
        />
      </template>

      <template v-slot:body="props">
        <q-tr
          :props="props"
          @mouseover="onRowHover(props.key)"
          v-on:dblclick="onIGVClick(props)"
          @click="onClickVariant(props.row._id)"
          class="variant-row"
          :class="{
            read: props.row.is_read,
            clicked: props.row._id === clickedRow ? 'clicked' : ''
          }"
        >
          <q-td
            class="variantsDetailsBtn variants-expand-sticky"
            :class="{ read: props.row.is_read }"
          >
            <div v-show="displayClickVariant(props)" @click="onRowClick(props)">
              <q-btn flat size="15px" padding="1px" color="primary" icon="info" />
            </div>
          </q-td>
          <!-- <q-td v-else class="variantsDetailsBtn variants-expand-sticky" :class="{'read': props.row.is_read}"></q-td> -->
          <q-td class="variantsSelectSticky" :class="{ read: props.row.is_read }">
            <q-checkbox v-model="props.selected" color="primary" />
          </q-td>
          <q-td
            class="element-center variants-select-sticky-note"
            :class="{ read: props.row.is_read }"
          >
            <q-btn
              size="15px"
              padding="2px"
              class="note-icon"
              flat
              :class="props.row.note && props.row.note.length > 1 ? 'noted' : ''"
              icon="sticky_note_2"
              @click="onNoteClick(props)"
            >
              <q-popup-proxy>
                <q-banner class="geneNoteBox">
                  <b>Note</b>
                  <q-input v-model="tempNote" filled type="textarea" class="note_textarea" />
                  <q-btn
                    label="Submit"
                    color="primary"
                    @click="onNoteSubmit(props, tempNote)"
                    v-close-popup
                  ></q-btn>
                </q-banner>
              </q-popup-proxy>
            </q-btn>
          </q-td>
          <template v-for="(item, key) in props.cols">
            <q-td
              :prop="item.prop"
              :key="item.variant_id"
              :label="item.label"
              :name="item.name"
              v-if="item.isShow"
              class="variantsDetailsTable variant-column"
              :class="{ read: props.row.is_read }"
            >
              <div class="resize-width">
                <div v-if="item.name === 'gene_symbol' && item.value !== ''">
                  <div
                    v-if="
                      props.row.gene_objs &&
                      [
                        ...new Map(
                          props.row.gene_objs.map((gene) => [
                            gene.gene ? gene.gene : gene.ensembl_gene_id,
                            gene
                          ])
                        ).values()
                      ].length > 1
                    "
                  >
                    Total:
                    {{
                      [
                        ...new Map(
                          props.row.gene_objs.map((gene) => [
                            gene.gene ? gene.gene : gene.ensembl_gene_id,
                            gene
                          ])
                        ).values()
                      ].length
                    }}
                  </div>

                  <div
                    v-for="(gene, index) in [
                      ...new Map(
                        props.row.gene_objs.map((gene) => [
                          gene.gene ? gene.gene : gene.ensembl_gene_id,
                          gene
                        ])
                      ).values()
                    ]"
                    :key="index"
                  >
                    <div v-if="index < 2">
                      <q-btn
                        flat
                        :color="'primary'"
                        :label="gene.gene ? gene.gene : gene.ensembl_gene_id"
                        class="cursor-pointer"
                        @click="onVariantDetailsClick(props.row, index)"
                      >
                        <variantDetailsBox :variantDetailObj="this.variantDetailsObj" type="gene" />
                      </q-btn>
                    </div>
                    <div v-else-if="index == 2">...</div>
                  </div>
                </div>

                <div v-else-if="item.name === 'ensembl_gene_id' && item.value !== ''">
                  <div v-if="props.row.ensembl_gene_id && props.row.ensembl_gene_id.length > 1">
                    Total: {{ props.row.ensembl_gene_id.length }}
                  </div>
                  <div v-for="(ensembl_gene_id, index) in props.row.ensembl_gene_id" :key="index">
                    <div v-if="index < 2">
                      <div class="tablePopup">
                        <a
                          :href="'https://www.ensembl.org/id/' + ensembl_gene_id"
                          target="_blank"
                          >{{ ensembl_gene_id }}</a
                        >
                      </div>
                    </div>
                    <div v-else-if="index == 2">...</div>
                  </div>
                </div>

                <div v-else-if="item.name === 'ensembl_transcript_id' && item.value !== ''">
                  <div
                    v-if="
                      props.row.ensembl_transcript_id && props.row.ensembl_transcript_id.length > 1
                    "
                  >
                    Total: {{ props.row.ensembl_transcript_id.length }}
                  </div>
                  <div
                    v-for="(ensembl_transcript_id, index) in props.row.ensembl_transcript_id"
                    :key="index"
                  >
                    <div v-if="index < 2">
                      <div class="tablePopup">
                        <a
                          :href="'https://www.ensembl.org/id/' + ensembl_transcript_id"
                          target="_blank"
                          >{{ ensembl_transcript_id }}</a
                        >
                      </div>
                    </div>
                    <div v-else-if="index == 2">...</div>
                  </div>
                </div>

                <div v-else-if="item.name === 'entrez_gene_id' && item.value !== ''">
                  <div v-if="props.row.entrez_gene_id && props.row.entrez_gene_id.length > 1">
                    Total: {{ props.row.entrez_gene_id.length }}
                  </div>
                  <div v-for="(entrez_gene_id, index) in props.row.entrez_gene_id" :key="index">
                    <div v-if="index < 2">
                      <div class="tablePopup">
                        <a
                          :href="'https://www.ncbi.nlm.nih.gov/gene/' + entrez_gene_id"
                          target="_blank"
                          >{{ entrez_gene_id }}</a
                        >
                      </div>
                    </div>
                    <div v-else-if="index == 2">...</div>
                  </div>
                </div>

                <div v-else-if="item.name === 'chrom'">
                  <q-btn
                    flat
                    color="primary"
                    v-if="item.value"
                    :label="item.value"
                    class="cursor-pointer"
                    @click="onVariantDetailsClick(props.row, -1, item.name)"
                  >
                    <variantDetailsBox :variantDetailObj="this.variantDetailsObj" type="position" />
                  </q-btn>
                </div>

                <div v-else-if="item.name === 'location'">
                  {{ props.row.chrom }}:{{ props.row.start.toLocaleString() }}-{{
                    props.row.end ? props.row.end.toLocaleString() : ''
                  }}
                </div>

                <div v-else-if="item.name === 'start'">
                  {{ props.row.start.toLocaleString() }}
                </div>

                <div v-else-if="item.name === 'end'">
                  {{ props.row.end ? props.row.end.toLocaleString() : '' }}
                </div>

                <div v-else-if="item.name === 'genotypeQty'">
                  <div v-html="displayGenotypeQty(item.value)"></div>
                </div>

                <div v-else-if="item.name === 'allelic_depths'">
                  <div v-html="displayAllelicDepths(item.value)"></div>
                </div>

                <div
                  v-else-if="
                    item.name === 'copy_num_genotype' || item.name === 'copy_num_genotype_qual'
                  "
                >
                  <div v-html="displayAllelicDepths(item.value, true)"></div>
                </div>

                <div v-else-if="item.name === 'ref'">
                  <q-tooltip>{{ item.value }}</q-tooltip>
                  <div class="longRefStr">{{ item.value }}</div>
                </div>

                <div v-else-if="item.name === 'alt'">
                  <q-tooltip>{{ item.value }}</q-tooltip>
                  <div class="longRefStr">{{ item.value }}</div>
                </div>

                <div v-else-if="item.name === 'samples_genotypes'">
                  <div class="cursor-pointer">
                    <div
                      v-html="displaySampleGenotypes(item.value)"
                      @click="onVariantDetailsClick(props.row, index)"
                      class="variantsDetailsBtn"
                    ></div>
                    <q-popup-proxy transition-show="none" transition-hide="none">
                      <q-banner class="bg-white text-black no-padding">
                        <variantGenotypesBox
                          :variantDetailObj="this.variantDetailsObj"
                          :variantsSamples="variantsSamples"
                          :genotypesIndex="item.value"
                        />
                      </q-banner>
                    </q-popup-proxy>
                  </div>
                </div>

                <div v-else-if="item.name === 'impact' && props.row.variant_type === 'small'">
                  <div v-if="item.value">
                    <q-tooltip>{{ item.value }}</q-tooltip>
                    <div class="longRefStr">{{ item.value }}</div>
                  </div>
                </div>

                <div v-else-if="item.name === 'impact' && props.row.variant_type === 'structural'">
                  <div v-if="Array.isArray(props.row.impact)">
                    <div v-for="(effect, index) in props.row.impact" :key="index">
                      <q-tooltip>{{ effect }}</q-tooltip>
                      <div class="longRefStr">{{ effect }}</div>
                    </div>
                  </div>
                  <div v-else>
                    <div class="longRefStr">{{ item.value }}</div>
                  </div>
                </div>

                <div v-else-if="item.cellRenderer && item.cellRenderer === 'formatScientific'">
                  <span v-html="formatScientific(item.value)"></span>
                </div>

                <div v-else-if="item.cellRenderer && item.cellRenderer === 'formatFrequency'">
                  <span
                    :style="item.style && item.style(props.row)"
                    v-html="formatFrequency(item.value)"
                  ></span>
                </div>

                <div
                  v-else-if="item.cellRenderer && item.cellRenderer === 'formatHighestFrequency'"
                >
                  <q-tooltip v-if="props.row.highest_af_info"
                    >highest AF found in {{ props.row.highest_af_info.source }}
                    <span
                      v-if="
                        props.row.variant_type == 'structural' &&
                        !['INS', 'INV', 'BND'].includes(props.row.type)
                      "
                    >
                      based on annotation Overlap and reciprocal overlap >= 80%</span
                    >
                  </q-tooltip>
                  <span
                    :style="item.style && item.style(props.row)"
                    v-html="formatFrequency(item.value)"
                  ></span>
                </div>

                <div v-else-if="item.cellRenderer && item.cellRenderer === 'formatPvalue'">
                  <span v-html="formatPvalue(item.value)"></span>
                </div>

                <div v-else-if="item.cellRenderer && item.cellRenderer === 'formatShowTooltip'">
                  <q-tooltip>{{ item.value }}</q-tooltip>
                  <div :style="item.style && item.style(props.row)" class="longRefStr">
                    {{ item.value }}
                  </div>
                </div>

                <div v-else-if="item.name === 'clnid'">
                  <span class="tablePopup">
                    <a
                      :href="'http://www.ncbi.nlm.nih.gov/clinvar/variation/' + item.value"
                      target="_blank"
                      >{{ item.value }}</a
                    >
                  </span>
                </div>

                <div v-else-if="item.name === 'hgvsc' || item.name === 'hgvsp'">
                  <q-btn
                    flat
                    color="primary"
                    v-if="item.value"
                    :label="displayFormatHGVS(item.value)"
                    class="cursor-pointer"
                    @click="onVariantDetailsClick(props.row, -1, item.name)"
                  >
                    <variantDetailsBox :variantDetailObj="this.variantDetailsObj" type="hgv" />
                  </q-btn>
                </div>

                <div v-else>
                  <div class="variantsTableColumn">
                    <q-tooltip>{{ item.value }}</q-tooltip>
                    <span :style="item.style && item.style(props.row)">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </q-td>
          </template>
        </q-tr>
        <q-tr
          v-show="props.expand"
          :props="props"
          class="q-virtual-scroll--with-prev variants-expand-header-box"
        >
          <!-- Moved to dialog -->
        </q-tr>
      </template>

      <template v-slot:bottom>
        <div class="bottom-parent">
          <div class="bottom-left">
            <span v-if="selected.length > 0">Selected : {{ selected.length }}</span
            ><br />
            <div v-if="filteredTotalCount">
              <!-- wait until find variant API finish -->
              <span v-if="filteredTotalCount < variantsPerPage">
                <!-- If only 1 page-->
                Showing : {{ filteredTotalCount }} /
                <span class="filtered_total_count">{{ filteredTotalCount }}</span> ( Total :
                {{ totalCount }} )
              </span>
              <span v-else>
                <!-- If current showing variants > all filtered variants -->
                <span v-if="(currentPage + 1) * variantsPerPage > filteredTotalCount">
                  Showing : {{ filteredTotalCount }} /
                  <span class="filtered_total_count">{{ filteredTotalCount }}</span> ( Total :
                  {{ totalCount }} )
                </span>
                <span v-else>
                  <!-- If still have more variants to load... -->
                  Showing : {{ (currentPage + 1) * variantsPerPage }} /
                  <span class="filtered_total_count">{{ filteredTotalCount }}</span> ( Total :
                  {{ totalCount }} )
                </span>
              </span>
            </div>
          </div>
          <div class="bottom-right">
            <q-btn icon="expand_more" round dense flat @click="onNextPage" ref="expandMoreBtn"
              ><q-tooltip>Expand more variants</q-tooltip></q-btn
            >
            <q-btn
              :icon="fullScreen ? 'fullscreen_exit' : 'fullscreen'"
              round
              dense
              flat
              @click="onClickFullScreenTrigger"
              ><q-tooltip>Full screen</q-tooltip></q-btn
            >
          </div>
        </div>
      </template>
    </q-table>

    <q-dialog v-model="igvDialog" full-width>
      <q-card full-width>
        <div id="igv"></div>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="variantDetailsDialog"
      transition-show="none"
      transition-hide="none"
      @hide="onCloseVariantDetailsDialog"
    >
      <div class="variant-details-dialog-container">
        <div class="text-left">
          <div class="top-parent">
            <div class="top-left">
              <span> <b> Detail Information :</b> </span>
            </div>
            <div class="top-right">
              <q-card-actions align="right" class="text-teal">
                <q-btn color="primary" label="Close" v-close-popup />
              </q-card-actions>
            </div>
          </div>
          <div class="row variant-detail-info-box">
            <div class="col-1">Position:</div>
            <div class="col-11">
              {{ variantClickObject.row.chrom }}:{{ variantClickObject.row.start }}-{{
                variantClickObject.row.end
              }}
            </div>
            <div class="col-1">Type:</div>
            <div class="col-11">
              {{ variantClickObject.row.type }}
            </div>
          </div>

          <template v-if="variantClickObject.row.type === 'INS'">
            <div
              style="text-overflow: ellipsis; overflow: hidden; width: 900px; display: inline-block"
            >
              Alt: {{ variantClickObject.row.alt }}
            </div>
            <div style="display: inline-block">
              <q-btn
                color="primary"
                label="blast search"
                class="gene-table-btn"
                :href="
                  'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome&QUERY=' +
                  variantClickObject.row.alt
                "
                target="_blank"
              />
            </div>
          </template>

          <template v-if="variantClickObject.row.type === 'DEL'">
            <div
              style="text-overflow: ellipsis; overflow: hidden; width: 900px; display: inline-block"
            >
              Ref: {{ variantClickObject.row.ref }}
            </div>
            <div style="display: inline-block">
              <q-btn
                color="primary"
                label="blast search"
                class="gene-table-btn"
                :href="
                  'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome&QUERY=' +
                  variantClickObject.row.ref
                "
                target="_blank"
              />
            </div>
          </template>

          <template v-if="variantClickObject.row.variant_type === 'structural'">
            <div
              class="row detail-row"
              v-if="
                geneRows.get(variantClickObject.row.variant_id) &&
                geneRows.get(variantClickObject.row.variant_id).length
              "
            >
              <div class="table-popup-container">
                <q-expansion-item
                  dense
                  dense-toggle
                  expand-separator
                  switch-toggle-side
                  class="shadow-1 overflow-hidden"
                  :label="
                    'Gene: ' +
                    [
                      ...new Map(
                        geneRows
                          .get(variantClickObject.row.variant_id)
                          .map((gene) => [gene.gene, gene])
                      ).values()
                    ]
                      .slice(0, 10)
                      .map((gene) => gene.gene)
                      .join(',') +
                    (geneRows.get(variantClickObject.row.variant_id).length > 10 ? '...' : '')
                  "
                  header-class="bg-primary text-white"
                  expand-icon-class="text-white"
                  default-opened
                >
                  <div class="row">
                    <div class="col-9"></div>
                    <div class="col-3">
                      <q-input
                        clearable
                        outlined
                        v-model="geneFilter"
                        placeholder="Search Gene Table"
                      >
                        <template v-slot:prepend>
                          <q-icon name="manage_search" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                  <q-table
                    class="transcript-table"
                    :rows="geneRows.get(variantClickObject.row.variant_id)"
                    :columns="geneColumns"
                    :pagination="largeTablePagination"
                    :loading="tableLoading"
                    :filter="geneFilter"
                    v-if="showMoreTranscripts.get(variantClickObject.row.variant_id)"
                  >
                    <template v-slot:body-cell-gene="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          :color="'primary'"
                          :label="
                            props.row.gene_symbol
                              ? props.row.gene_symbol
                              : props.row.ensembl_gene_id
                          "
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, index)"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="gene"
                          />
                        </q-btn>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-transcript="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.transcript"
                            target="_blank"
                            >{{ props.row.transcript }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-ensembl_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.ensembl_gene_id"
                            target="_blank"
                            >{{ props.row.ensembl_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-entrez_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ncbi.nlm.nih.gov/gene/' + props.row.entrez_gene_id"
                            target="_blank"
                            >{{ props.row.entrez_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>
                  </q-table>
                  <q-table
                    class="transcript-table"
                    :rows="defaultGeneRows.get(variantClickObject.row.variant_id)"
                    :columns="geneColumns"
                    :pagination="largeTablePagination"
                    :filter="geneFilter"
                    :loading="tableLoading"
                    v-else
                  >
                    <template v-slot:body-cell-gene="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          :color="'primary'"
                          :label="
                            props.row.gene_symbol
                              ? props.row.gene_symbol
                              : props.row.ensembl_gene_id
                          "
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, index)"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="gene"
                          />
                        </q-btn>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-transcript="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.transcript"
                            target="_blank"
                            >{{ props.row.transcript }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-ensembl_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.ensembl_gene_id"
                            target="_blank"
                            >{{ props.row.ensembl_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-entrez_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ncbi.nlm.nih.gov/gene/' + props.row.entrez_gene_id"
                            target="_blank"
                            >{{ props.row.entrez_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>
                  </q-table>
                  <q-btn
                    v-if="
                      defaultGeneRows.get(variantClickObject.row.variant_id).length <
                        geneRows.get(variantClickObject.row.variant_id).length &&
                      !showMoreTranscripts.get(variantClickObject.row.variant_id)
                    "
                    label="Show More Transcripts"
                    class="transcript-btn bg-primary text-white"
                    icon="add"
                    @click="onShowTranscriptClick(variantClickObject.row)"
                  />
                  <q-btn
                    v-if="
                      defaultGeneRows.get(variantClickObject.row.variant_id).length <
                        geneRows.get(variantClickObject.row.variant_id).length &&
                      showMoreTranscripts.get(variantClickObject.row.variant_id)
                    "
                    label="Show Less Transcripts"
                    class="transcript-btn bg-primary text-white"
                    icon="remove"
                    @click="onShowTranscriptClick(variantClickObject.row)"
                  />
                </q-expansion-item>
              </div>
            </div>
          </template>
          <template v-if="variantClickObject.row.variant_type === 'small'">
            <div
              class="row detail-row"
              v-if="
                geneRows.get(variantClickObject.row.variant_id) &&
                geneRows.get(variantClickObject.row.variant_id).length
              "
            >
              <div class="table-popup-container">
                <q-expansion-item
                  dense
                  dense-toggle
                  expand-separator
                  switch-toggle-side
                  class="shadow-1 overflow-hidden"
                  :label="
                    'Gene: ' +
                    [
                      ...new Map(
                        geneRows
                          .get(variantClickObject.row.variant_id)
                          .map((gene) => [gene.gene, gene])
                      ).values()
                    ]
                      .slice(0, 10)
                      .map((gene) => gene.gene)
                      .join(',') +
                    (geneRows.get(variantClickObject.row.variant_id).length > 10 ? '...' : '')
                  "
                  header-class="bg-primary text-white"
                  expand-icon-class="text-white"
                  default-opened
                >
                  <div class="row">
                    <div class="col-9"></div>
                    <div class="col-3">
                      <q-input
                        clearable
                        outlined
                        v-model="geneFilter"
                        placeholder="Search Gene Table"
                      >
                        <template v-slot:prepend>
                          <q-icon name="manage_search" />
                        </template>
                      </q-input>
                    </div>
                  </div>
                  <q-table
                    class="transcript-table"
                    :rows="geneRows.get(variantClickObject.row.variant_id)"
                    :columns="transcriptColumns"
                    :pagination="largeTablePagination"
                    :filter="geneFilter"
                    :loading="tableLoading"
                    v-if="showMoreTranscripts.get(variantClickObject.row.variant_id)"
                  >
                    <template v-slot:body-cell-gene="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          :color="'primary'"
                          :label="
                            props.row.gene_symbol
                              ? props.row.gene_symbol
                              : props.row.ensembl_gene_id
                          "
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, index)"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="gene"
                          />
                        </q-btn>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-transcript="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.transcript"
                            target="_blank"
                            >{{ props.row.transcript }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-ensembl_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.ensembl_gene_id"
                            target="_blank"
                            >{{ props.row.ensembl_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-entrez_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ncbi.nlm.nih.gov/gene/' + props.row.entrez_gene_id"
                            target="_blank"
                            >{{ props.row.entrez_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-hgvsc="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          color="primary"
                          v-if="props.row.hgvsc"
                          :label="displayFormatHGVS(props.row.hgvsc)"
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, -1, 'hgvsc')"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="hgv"
                          />
                        </q-btn>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-hgvsp="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          color="primary"
                          v-if="props.row.hgvsp"
                          :label="displayFormatHGVS(props.row.hgvsp)"
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, -1, 'hgvsp')"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="hgv"
                          />
                        </q-btn>
                      </q-td>
                    </template>
                  </q-table>
                  <q-table
                    class="transcript-table"
                    :rows="defaultGeneRows.get(variantClickObject.row.variant_id)"
                    :columns="transcriptColumns"
                    :pagination="largeTablePagination"
                    :filter="geneFilter"
                    :loading="tableLoading"
                    v-else
                  >
                    <template v-slot:body-cell-gene="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          :color="'primary'"
                          :label="
                            props.row.gene_symbol
                              ? props.row.gene_symbol
                              : props.row.ensembl_gene_id
                          "
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, index)"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="gene"
                          />
                        </q-btn>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-transcript="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.transcript"
                            target="_blank"
                            >{{ props.row.transcript }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-ensembl_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ensembl.org/id/' + props.row.ensembl_gene_id"
                            target="_blank"
                            >{{ props.row.ensembl_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-entrez_gene_id="props">
                      <q-td :props="props">
                        <div class="tablePopup">
                          <a
                            :href="'https://www.ncbi.nlm.nih.gov/gene/' + props.row.entrez_gene_id"
                            target="_blank"
                            >{{ props.row.entrez_gene_id }}</a
                          >
                        </div>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-hgvsc="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          color="primary"
                          v-if="props.row.hgvsc"
                          :label="displayFormatHGVS(props.row.hgvsc)"
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, -1, 'hgvsc')"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="hgv"
                          />
                        </q-btn>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-hgvsp="props">
                      <q-td :props="props">
                        <q-btn
                          flat
                          color="primary"
                          v-if="props.row.hgvsp"
                          :label="displayFormatHGVS(props.row.hgvsp)"
                          class="cursor-pointer"
                          @click="onVariantDetailsClick(props.row, -1, 'hgvsp')"
                        >
                          <variantDetailsBox
                            :variantDetailObj="this.variantDetailsObj"
                            type="hgv"
                          />
                        </q-btn>
                      </q-td>
                    </template>
                  </q-table>
                  <q-btn
                    v-if="
                      defaultGeneRows.get(variantClickObject.row.variant_id).length <
                        geneRows.get(variantClickObject.row.variant_id).length &&
                      !showMoreTranscripts.get(variantClickObject.row.variant_id)
                    "
                    label="Show More Transcripts"
                    class="transcript-btn bg-primary text-white"
                    icon="add"
                    @click="onShowTranscriptClick(variantClickObject.row)"
                  />
                  <q-btn
                    v-if="
                      defaultGeneRows.get(variantClickObject.row.variant_id).length <
                        geneRows.get(variantClickObject.row.variant_id).length &&
                      showMoreTranscripts.get(variantClickObject.row.variant_id)
                    "
                    label="Show Less Transcripts"
                    class="transcript-btn bg-primary text-white"
                    icon="remove"
                    @click="onShowTranscriptClick(variantClickObject.row)"
                  />
                </q-expansion-item>
              </div>
            </div>
          </template>
          <div
            class="row detail-row"
            v-if="
              variantClickObject.row.type === 'BND' &&
              relatedVariantRows.get(variantClickObject.row.variant_id) &&
              relatedVariantRows.get(variantClickObject.row.variant_id).length
            "
          >
            <div class="table-popup-container">
              <q-expansion-item
                dense
                dense-toggle
                expand-separator
                switch-toggle-side
                class="shadow-1 overflow-hidden"
                :label="'Related Variants:'"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
                default-opened
              >
                <q-table
                  class="relatedTableInside"
                  :rows="relatedVariantRows.get(variantClickObject.row.variant_id)"
                  :columns="relatedVariantColumns"
                  @row-click="onVariantTableClick"
                  :pagination="initialPagination"
                  :loading="tableLoading"
                >
                </q-table>
              </q-expansion-item>
            </div>
          </div>
          <div
            class="row detail-row"
            v-if="
              extRows.get(variantClickObject.row.variant_id) &&
              extRows.get(variantClickObject.row.variant_id).length
            "
          >
            <div class="table-popup-container">
              <q-expansion-item
                dense
                dense-toggle
                expand-separator
                switch-toggle-side
                class="shadow-1 overflow-hidden"
                :label="'External Sources:'"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
                default-opened
              >
                <q-table
                  class="extTableInside"
                  :rows="extRows.get(variantClickObject.row.variant_id)"
                  :columns="extColumns"
                  :pagination="initialPagination"
                  :loading="tableLoading"
                >
                </q-table>
              </q-expansion-item>
            </div>
          </div>
          <div
            class="row detail-row"
            v-if="
              exonRows.get(variantClickObject.row.variant_id) &&
              exonRows.get(variantClickObject.row.variant_id).length
            "
          >
            <div class="table-popup-container">
              <q-expansion-item
                dense
                dense-toggle
                expand-separator
                switch-toggle-side
                class="shadow-1 overflow-hidden"
                :label="'Exon Overlap:'"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
              >
                <div class="row">
                  <div class="col-9"></div>
                  <div class="col-3">
                    <q-input
                      clearable
                      outlined
                      v-model="exonFilter"
                      placeholder="Search Exon Table"
                    >
                      <template v-slot:prepend>
                        <q-icon name="manage_search" />
                      </template>
                    </q-input>
                  </div>
                </div>
                <q-table
                  class="exonTableInside"
                  :rows="exonRows.get(variantClickObject.row.variant_id)"
                  :columns="exonColumns"
                  :pagination="largeTablePagination"
                  :loading="tableLoading"
                  :filter="exonFilter"
                >
                </q-table>
              </q-expansion-item>
            </div>
          </div>
          <div
            class="row detail-row"
            v-if="
              intpnsRows.get(variantClickObject.row.variant_id) &&
              intpnsRows.get(variantClickObject.row.variant_id).length
            "
          >
            <div class="table-popup-container">
              <q-expansion-item
                dense
                dense-toggle
                expand-separator
                switch-toggle-side
                class="shadow-1 overflow-hidden"
                :label="'Clinical Interpretation:'"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
                default-opened
              >
                <q-table
                  class="intpnTableInside"
                  :rows="intpnsRows.get(variantClickObject.row.variant_id)"
                  :columns="intpnsColumns"
                  :pagination="initialPagination"
                  :loading="tableLoading"
                >
                  <template v-slot:body-cell-variation_id="props">
                    <q-td :props="props">
                      <div class="tablePopup">
                        <a
                          :href="
                            'https://www.ncbi.nlm.nih.gov/clinvar/variation/' +
                            props.row.variation_id
                          "
                          target="_blank"
                          >{{ props.row.variation_id }}</a
                        >
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-review_status="props">
                    <q-td :props="props">
                      <span v-if="CLINVAR_NO_STAR.includes(props.row.review_status.trim())">
                        <q-icon name="star_outlined" class="clinvar-star"></q-icon>
                      </span>
                      <span v-else>
                        <q-icon name="star" class="clinvar-star"></q-icon>
                      </span>
                      <span
                        v-if="
                          CLINVAR_NO_STAR.includes(props.row.review_status.trim()) ||
                          CLINVAR_SINGLE_STAR.includes(props.row.review_status.trim())
                        "
                      >
                        <q-icon name="star_outlined" class="clinvar-star"></q-icon>
                      </span>
                      <span v-else>
                        <q-icon name="star" class="clinvar-star"></q-icon>
                      </span>
                      <span
                        v-if="
                          CLINVAR_NO_STAR.includes(props.row.review_status.trim()) ||
                          CLINVAR_SINGLE_STAR.includes(props.row.review_status.trim()) ||
                          CLINVAR_TWO_STAR.includes(props.row.review_status.trim())
                        "
                      >
                        <q-icon name="star_outlined" class="clinvar-star"></q-icon>
                      </span>
                      <span v-else>
                        <q-icon name="star" class="clinvar-star"></q-icon>
                      </span>
                      <span v-if="CLINVAR_FOUR_STAR.includes(props.row.review_status.trim())">
                        <q-icon name="star" class="clinvar-star"></q-icon>
                      </span>
                      <span v-else>
                        <q-icon name="star_outlined" class="clinvar-star"></q-icon>
                      </span>
                      <span class="clinvar-star-text">{{ props.row.review_status }}</span>
                    </q-td>
                  </template>
                </q-table>
              </q-expansion-item>
            </div>
          </div>
          <div
            class="row detail-row"
            v-if="
              afRows.get(variantClickObject.row.variant_id) &&
              afRows.get(variantClickObject.row.variant_id).length
            "
          >
            <div class="table-popup-container">
              <q-expansion-item
                dense
                dense-toggle
                expand-separator
                switch-toggle-side
                class="shadow-1 overflow-hidden"
                :label="'Allele Frequency:'"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
                default-opened
              >
                <q-table
                  class="extTableInside"
                  :rows="afRows.get(variantClickObject.row.variant_id)"
                  :columns="afsColumns"
                  :pagination="initialPagination"
                  :loading="tableLoading"
                >
                </q-table>
              </q-expansion-item>
            </div>
          </div>
          <div
            class="row detail-row"
            v-if="
              exomiserRows.get(variantClickObject.row.variant_id) &&
              exomiserRows.get(variantClickObject.row.variant_id).length
            "
          >
            <div class="table-popup-container">
              <q-expansion-item
                dense
                dense-toggle
                expand-separator
                switch-toggle-side
                class="shadow-1 overflow-hidden"
                :label="'Exomiser Information:'"
                header-class="bg-primary text-white"
                expand-icon-class="text-white"
                default-opened
              >
                <div class="row">
                  <div class="col-9"></div>
                  <div class="col-3">
                    <q-input
                      clearable
                      outlined
                      v-model="exomiserFilter"
                      placeholder="Search Exomiser Table"
                    >
                      <template v-slot:prepend>
                        <q-icon name="manage_search" />
                      </template>
                    </q-input>
                  </div>
                </div>
                <q-table
                  class="exomiserTableInside"
                  :rows="exomiserRows.get(variantClickObject.row.variant_id)"
                  :columns="exomisersColumns"
                  :pagination="initialPagination"
                  :loading="tableLoading"
                  :filter="exomiserFilter"
                >
                </q-table>
              </q-expansion-item>
            </div>
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<style>
@import '@/assets/styles/variants-table.scss';
</style>
<script>
import { ref } from 'vue'
import igv from 'igv'
import 'sprintf-js'
import variantDetailsBox from '@/components/variants-table/table-elements/VariantDetailsBox.vue'
import variantGenotypesBox from '@/components/variants-table/table-elements/VariantGenotypesBox.vue'
import store from '@/store/store'
import {
  TRANSCRIPT_GENE_COLUMN,
  TRANSCRIPT_ENSEMBL_GENE_COLUMN,
  TRANSCRIPT_ENTREZ_GENE_COLUMN,
  TRANSCRIPT_ENSEMBL_TRANSCRIPT_COLUMN,
  POLYPHEN_PRED_COLUMN,
  POLYPHEN_SCORE_COLUMN,
  SIFT_PRED_COLUMN,
  SIFT_SCORE_COLUMN,
  IMPACT_SEVERITY_COLUMN,
  IMPACT_COLUMN,
  EXISTING_VARIATION_COLUMN,
  CCDS_COLUMN,
  REFSEQ_MATCH_COLUMN,
  GENE_PHENO_COLUMN,
  PHENO_COLUMN,
  REVEL_COLUMN,
  EXISTING_INFRAME_COLUMN,
  EXISTING_OUTOFFRAME_COLUMN,
  EXISTING_UORFS_COLUMN,
  FLAG_LRG_COLUMN,
  CADD_PHRED_COLUMN,
  CADD_RAW_COLUMN,
  SPLICEAI_PRED_DP_AG_COLUMN,
  SPLICEAI_PRED_DP_AL_COLUMN,
  SPLICEAI_PRED_DP_DG_COLUMN,
  SPLICEAI_PRED_DP_DL_COLUMN,
  SPLICEAI_PRED_DS_AG_COLUMN,
  SPLICEAI_PRED_DS_AL_COLUMN,
  SPLICEAI_PRED_DS_DG_COLUMN,
  SPLICEAI_PRED_DS_DL_COLUMN,
  SPLICEAI_PRED_SYMBOL_COLUMN,
  V2_OE_LOF_COLUMN,
  V2_OE_LOF_LOWER_COLUMN,
  V2_OE_LOF_UPPER_COLUMN,
  V2_OE_MIS_COLUMN,
  V2_OE_MIS_LOWER_COLUMN,
  V2_OE_MIS_UPPER_COLUMN,
  V2_OE_SYN_COLUMN,
  V2_OE_SYN_LOWER_COLUMN,
  V2_OE_SYN_UPPER_COLUMN,
  V2_PLI_COLUMN,
  V2_MIS_Z_COLUMN,
  V2_SYN_Z_COLUMN,
  V4_OE_LOF_COLUMN,
  V4_OE_LOF_LOWER_COLUMN,
  V4_OE_LOF_UPPER_COLUMN,
  V4_OE_MIS_COLUMN,
  V4_OE_MIS_LOWER_COLUMN,
  V4_OE_MIS_UPPER_COLUMN,
  V4_OE_SYN_COLUMN,
  V4_OE_SYN_LOWER_COLUMN,
  V4_OE_SYN_UPPER_COLUMN,
  V4_PLI_COLUMN,
  V4_MIS_Z_COLUMN,
  V4_SYN_Z_COLUMN,
  CGD_AGE_GROUP_COLUMN,
  CGD_INHERITANCE_COLUMN,
  CGD_MANIFEST_CAT_COLUMN,
  CGD_ALLELIC_CONDITION_COLUMN,
  CGD_COMMENTS_COLUMN,
  CGD_CONDITION_COLUMN,
  CGD_ENTREZ_ID_COLUMN,
  CGD_GENE_COLUMN,
  CGD_HGNC_ID_COLUMN,
  CGD_INTERVENTION_CATEGORIES_COLUMN,
  CGD_INTERVENTION_RATIONALE_COLUMN,
  CGD_REFERENCES_COLUMN,
  CLINGEN_HI_COLUMN,
  CLINGEN_TS_COLUMN,
  P_HAPLO_COLUMN,
  P_TRIPLO_COLUMN,
  TRANSCRIPT_V2_P_LI,
  TRANSCRIPT_V2_LOEUF,
  TRANSCRIPT_V4_P_LI,
  TRANSCRIPT_V4_LOEUF,
  STRAND,
  TRANSCRIPT_ANNOTATION_OVERLAP,
  TRANSCRIPT_RECIPROCAL_OVERLAP,
  HGVSC_COLUMN,
  HGVSP_COLUMN,
  TRANSCRIPT_IS_MANE_SELECT_COLUMN,
  TRANSCRIPT_IS_MANE_PLUS_CLINICAL_COLUMN,
  TRANSCRIPT_IS_CANONICAL_COLUMN
} from '@/models/variants-table/columns/eachColumns'

export default {
  name: 'VariantsTable',
  components: {
    variantDetailsBox,
    variantGenotypesBox
  },
  props: [
    'leftBarExpanded',
    'variantsDataColumns',
    'variantsType',
    'variantsDataRows',
    'variantsSamples',
    'tableLoading',
    'sortingColumns',
    'updating',
    'variantsPerPage',
    'currentPage',
    'totalCount',
    'filteredTotalCount',
    'database_selected',
    'IsStandalone'
  ],
  mounted() {
    let variantsTable = this.$refs.variantsTableRef.$el.querySelector('.q-table__middle')
    variantsTable.addEventListener('scroll', this.scrollToBottom)
    let div = this.createDiv()
    variantsTable.appendChild(div)
  },
  data() {
    return {
      tableLoadingOnClickVariant: false,
      fullScreen: false,
      fullScreenBtn: ref(null),
      expandMoreBtn: ref(null),
      variantsTableRef: ref(null),
      initialPagination: {
        descending: false,
        page: 0,
        rowsPerPage: 0
      },
      largeTablePagination: {
        page: 0,
        rowsPerPage: 100
      },
      igvTracks: [],
      selected: ref([]),
      igvDialog: false,
      igvDialogShow: false,
      variantDetailsObj: {},
      variantDetailsDialog: false,
      variantClickObject: {},
      relatedVariantColumns: [
        {
          name: 'chrom',
          required: true,
          label: 'Chr',
          align: 'center',
          field: (row) => (row.chrom ? row.chrom : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'start',
          required: true,
          label: 'Start',
          align: 'center',
          field: (row) => (row.start ? row.start : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'end',
          required: true,
          label: 'End',
          align: 'center',
          field: (row) => (row.end ? row.end : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'ref',
          required: true,
          label: 'Ref',
          align: 'center',
          field: (row) => (row.ref ? row.ref : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'alt',
          required: true,
          label: 'Alt',
          align: 'center',
          field: (row) => (row.alt ? row.alt : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'gene_symbol',
          required: true,
          label: 'Gene',
          align: 'center',
          field: (row) =>
            row.gene_objs?.length > 0
              ? Array.from(new Set(row.gene_objs.map((gene) => gene.gene))).join(',')
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'type',
          required: true,
          label: 'Type',
          align: 'center',
          field: (row) => (row.type ? row.type : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      relatedVariantRows: new Map(),
      geneColumns: [
        Object.assign({ ...TRANSCRIPT_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ENSEMBL_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ENTREZ_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ENSEMBL_TRANSCRIPT_COLUMN }, { isShow: true }),
        Object.assign({ ...STRAND }, { isShow: true }),
        Object.assign({ ...CLINGEN_HI_COLUMN }, { isShow: true }),
        Object.assign({ ...CLINGEN_TS_COLUMN }, { isShow: true }),
        Object.assign({ ...P_HAPLO_COLUMN }, { isShow: true }),
        Object.assign({ ...P_TRIPLO_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V2_P_LI }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V2_LOEUF }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V4_P_LI }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V4_LOEUF }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ANNOTATION_OVERLAP }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_RECIPROCAL_OVERLAP }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_IS_MANE_PLUS_CLINICAL_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_IS_MANE_SELECT_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_IS_CANONICAL_COLUMN }, { isShow: true }),
        {
          name: 'is_related',
          required: true,
          label: 'Hit Breakpoint',
          align: 'center',
          field: (row) => (row.is_related ? row.is_related : 'false'),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'bkpt_start',
          required: true,
          label: 'Transcript Start',
          align: 'center',
          field: (row) => (row.bkpt_start ? row.bkpt_start : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'bkpt_end',
          required: true,
          label: 'Transcript End',
          align: 'center',
          field: (row) => (row.bkpt_end ? row.bkpt_end : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      geneFilter: '',
      exonFilter: '',
      exomiserFilter: '',
      geneRows: new Map(),
      defaultGeneRows: new Map(),
      alleleColumns: [
        {
          name: 'source',
          required: true,
          label: 'Source',
          align: 'center',
          field: (row) => row.source,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'id',
          required: true,
          label: 'ID',
          align: 'center',
          field: (row) => row.id,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_start',
          required: true,
          label: 'Start',
          align: 'center',
          field: (row) => row.source_start,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_end',
          required: true,
          label: 'End',
          align: 'center',
          field: (row) => row.source_end,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'sv_length',
          required: true,
          label: 'Length',
          align: 'center',
          field: (row) => row.sv_length,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_sv_type',
          required: true,
          label: 'Type',
          align: 'center',
          field: (row) => row.source_sv_type,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'af',
          required: true,
          label: 'AF',
          align: 'center',
          field: (row) => (row.af != null && row.af != undefined && row.af != -1 ? row.af : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'af_affected',
          required: true,
          label: 'Affected AF',
          align: 'center',
          field: (row) => row.af_affected,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'af_unaffected',
          required: true,
          label: 'Unaffected AF',
          align: 'center',
          field: (row) => row.af_unaffected,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'anno_overlap',
          required: true,
          label: 'Annotation Overlap',
          align: 'center',
          field: (row) => row.anno_overlap,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'reci_overlap',
          required: true,
          label: 'Reciprocal Overlap',
          align: 'center',
          field: (row) => row.reci_overlap,
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      alleleRows: new Map(),
      stickyKey: ['note', 'chrom', 'start', 'end', 'ref', 'alt'],
      transcriptColumns: [
        Object.assign({ ...TRANSCRIPT_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ENSEMBL_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ENTREZ_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_ENSEMBL_TRANSCRIPT_COLUMN }, { isShow: true }),
        Object.assign({ ...HGVSC_COLUMN }, { isShow: true }),
        Object.assign({ ...HGVSP_COLUMN }, { isShow: true }),
        Object.assign({ ...POLYPHEN_PRED_COLUMN }, { isShow: true }),
        Object.assign({ ...POLYPHEN_SCORE_COLUMN }, { isShow: true }),
        Object.assign({ ...SIFT_PRED_COLUMN }, { isShow: true }),
        Object.assign({ ...SIFT_SCORE_COLUMN }, { isShow: true }),
        Object.assign({ ...IMPACT_SEVERITY_COLUMN }, { isShow: true }),
        Object.assign({ ...IMPACT_COLUMN }, { isShow: true }),
        Object.assign({ ...EXISTING_VARIATION_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_IS_MANE_SELECT_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_IS_MANE_PLUS_CLINICAL_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_IS_CANONICAL_COLUMN }, { isShow: true }),
        Object.assign({ ...CCDS_COLUMN }, { isShow: true }),
        Object.assign({ ...REFSEQ_MATCH_COLUMN }, { isShow: true }),
        Object.assign({ ...GENE_PHENO_COLUMN }, { isShow: true }),
        Object.assign({ ...PHENO_COLUMN }, { isShow: true }),
        Object.assign({ ...REVEL_COLUMN }, { isShow: true }),
        Object.assign({ ...EXISTING_INFRAME_COLUMN }, { isShow: true }),
        Object.assign({ ...EXISTING_OUTOFFRAME_COLUMN }, { isShow: true }),
        Object.assign({ ...EXISTING_UORFS_COLUMN }, { isShow: true }),
        Object.assign({ ...FLAG_LRG_COLUMN }, { isShow: true }),
        Object.assign({ ...CADD_PHRED_COLUMN }, { isShow: true }),
        Object.assign({ ...CADD_RAW_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DP_AG_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DP_AL_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DP_DG_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DP_DL_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DS_AG_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DS_AL_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DS_DG_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_DS_DL_COLUMN }, { isShow: true }),
        Object.assign({ ...SPLICEAI_PRED_SYMBOL_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_LOF_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_LOF_LOWER_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_LOF_UPPER_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_MIS_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_MIS_LOWER_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_MIS_UPPER_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_SYN_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_SYN_LOWER_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_OE_SYN_UPPER_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_PLI_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_MIS_Z_COLUMN }, { isShow: true }),
        Object.assign({ ...V2_SYN_Z_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_LOF_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_LOF_LOWER_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_LOF_UPPER_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_MIS_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_MIS_LOWER_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_MIS_UPPER_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_SYN_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_SYN_LOWER_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_OE_SYN_UPPER_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_PLI_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_MIS_Z_COLUMN }, { isShow: true }),
        Object.assign({ ...V4_SYN_Z_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_AGE_GROUP_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_INHERITANCE_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_MANIFEST_CAT_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_ALLELIC_CONDITION_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_COMMENTS_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_CONDITION_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_ENTREZ_ID_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_GENE_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_HGNC_ID_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_INTERVENTION_CATEGORIES_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_INTERVENTION_RATIONALE_COLUMN }, { isShow: true }),
        Object.assign({ ...CGD_REFERENCES_COLUMN }, { isShow: true }),
        Object.assign({ ...CLINGEN_HI_COLUMN }, { isShow: true }),
        Object.assign({ ...CLINGEN_TS_COLUMN }, { isShow: true }),
        Object.assign({ ...P_HAPLO_COLUMN }, { isShow: true }),
        Object.assign({ ...P_TRIPLO_COLUMN }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V2_P_LI }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V2_LOEUF }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V4_P_LI }, { isShow: true }),
        Object.assign({ ...TRANSCRIPT_V4_LOEUF }, { isShow: true })
      ],
      afsColumns: [
        {
          name: 'source',
          required: true,
          label: 'Source',
          align: 'center',
          field: (row) => (row.source ? row.source : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_start',
          required: true,
          label: 'Start',
          align: 'center',
          field: (row) => (row.source_start ? row.source_start : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_end',
          required: true,
          label: 'Source End',
          align: 'center',
          field: (row) => (row.source_end && row.source_svType != 'BND' ? row.source_end : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'svLength',
          required: true,
          label: 'Length',
          align: 'center',
          field: (row) =>
            row.svLength && row.source_svType != 'BND' ? Math.abs(row.svLength) : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_svType',
          required: true,
          label: 'Type',
          align: 'center',
          field: (row) => (row.source_svType ? row.source_svType : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'AF',
          required: true,
          label: 'AF',
          align: 'center',
          field: (row) => (row.AF != null && row.AF != undefined && row.AF != -1 ? row.AF : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'SAMPLE_COUNT',
          required: true,
          label: 'Sample Count',
          align: 'center',
          field: (row) => (row.SAMPLE_COUNT && row.SAMPLE_COUNT != -1 ? row.SAMPLE_COUNT : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'annoOverlap',
          required: true,
          label: 'Annotation Overlap',
          align: 'center',
          field: (row) => (row.annoOverlap && row.annoOverlap != -1 ? row.annoOverlap : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'reciOverlap',
          required: true,
          label: 'Reciprocal Overlap',
          align: 'center',
          field: (row) => (row.reciOverlap && row.reciOverlap != -1 ? row.reciOverlap : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      afRows: new Map(),
      extColumns: [
        {
          name: 'source',
          required: true,
          label: 'Source',
          align: 'center',
          field: (row) => (row.source ? row.source : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_start',
          required: true,
          label: 'Start',
          align: 'center',
          field: (row) => (row.source_start ? row.source_start : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'source_end',
          required: true,
          label: 'Source End',
          align: 'center',
          field: (row) => (row.source_end ? row.source_end : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'svLength',
          required: true,
          label: 'Length',
          align: 'center',
          field: (row) => (row.svLength != null && row.svLength != undefined ? row.svLength : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'annoOverlap',
          required: true,
          label: 'Annotation Overlap',
          align: 'center',
          field: (row) => (row.annoOverlap ? row.annoOverlap : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'reciOverlap',
          required: true,
          label: 'Reciprocal Overlap',
          align: 'center',
          field: (row) => (row.reciOverlap ? row.reciOverlap : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      extRows: new Map(),
      intpnsColumns: [
        {
          name: 'source',
          required: true,
          label: 'Source',
          align: 'center',
          field: (row) => (row.source ? row.source : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'start',
          required: true,
          label: 'Start',
          align: 'center',
          field: (row) => (row.start ? row.start : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'end',
          required: true,
          label: 'End',
          align: 'center',
          field: (row) => (row.end ? row.end : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'Type',
          required: true,
          label: 'Type',
          align: 'center',
          field: (row) => (row.Type ? row.Type : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'variation_id',
          required: true,
          label: 'Variation ID',
          align: 'center',
          field: (row) => (row.variation_id ? row.variation_id : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'interpretation',
          required: true,
          label: 'Interpretation',
          align: 'center',
          field: (row) => (row.interpretation ? row.interpretation : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'rc_vaccession',
          required: true,
          label: 'RC Vaccession',
          align: 'center',
          field: (row) => (row.rc_vaccession ? row.rc_vaccession : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'review_status',
          required: true,
          label: 'Review Status',
          align: 'left',
          field: (row) => (row.review_status ? row.review_status : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'reciprocal_overlap',
          required: true,
          label: 'Reciprocal Overlap',
          align: 'center',
          field: (row) =>
            row.reciprocal_overlap != null && row.reciprocal_overlap != undefined
              ? row.reciprocal_overlap
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'annotation_overlap',
          required: true,
          label: 'Annotation Overlap',
          align: 'center',
          field: (row) =>
            row.annotation_overlap != null && row.annotation_overlap != undefined
              ? row.annotation_overlap
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      intpnsRows: new Map(),
      exonColumns: [
        {
          name: 'start',
          required: true,
          label: 'Start',
          align: 'center',
          field: (row) => (row.start ? row.start : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'end',
          required: true,
          label: 'End',
          align: 'center',
          field: (row) => (row.end ? row.end : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'EXON_ID',
          required: true,
          label: 'Exon ID',
          align: 'center',
          field: (row) => (row.EXON_ID ? row.EXON_ID : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'GENE_SYMBOL',
          required: true,
          label: 'GENE SYMBOL',
          align: 'center',
          field: (row) =>
            row.GENE_SYMBOL ? row.GENE_SYMBOL : row.gene_stable_id ? row.gene_stable_id : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'ENST_ID',
          required: true,
          label: 'ENST ID',
          align: 'center',
          field: (row) => (row.ENST_ID ? row.ENST_ID : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'annotationOverlap',
          required: true,
          label: 'Annotation Overlap',
          align: 'center',
          field: (row) =>
            row.annotationOverlap != null && row.annotationOverlap != undefined
              ? row.annotationOverlap
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'reciprocalOverlap',
          required: true,
          label: 'Reciprocal Overlap',
          align: 'center',
          field: (row) =>
            row.reciprocalOverlap != null && row.reciprocalOverlap != undefined
              ? row.reciprocalOverlap
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'IS_CODING',
          required: true,
          label: 'Is Coding',
          align: 'center',
          field: (row) => (row.IS_CODING ? 'true' : 'false'),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      exonRows: new Map(),
      exomisersColumns: [
        {
          name: 'gene_symbol',
          required: true,
          label: 'Gene Symbol',
          align: 'center',
          field: (row) => (row.gene_symbol ? row.gene_symbol : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'moi',
          required: true,
          label: 'MOI',
          align: 'center',
          field: (row) => (row.moi ? row.moi : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_gene_combined_score',
          required: true,
          label: 'Exomiser Combined Score',
          align: 'center',
          field: (row) =>
            row.exomiser_gene_combined_score != null &&
            row.exomiser_gene_combined_score != undefined &&
            row.exomiser_gene_combined_score != -1
              ? row.exomiser_gene_combined_score
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_gene_pheno_score',
          required: true,
          label: 'Exomiser Pheno Score',
          align: 'center',
          field: (row) =>
            row.exomiser_gene_pheno_score != null &&
            row.exomiser_gene_pheno_score != undefined &&
            row.exomiser_gene_pheno_score != -1
              ? row.exomiser_gene_pheno_score
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_gene_variant_score',
          required: true,
          label: 'Exomiser Variant Score',
          align: 'center',
          field: (row) =>
            row.exomiser_gene_variant_score != null &&
            row.exomiser_gene_variant_score != undefined &&
            row.exomiser_gene_variant_score != -1
              ? row.exomiser_gene_variant_score
              : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_acmg_classification',
          required: true,
          label: 'ACMG Classification',
          align: 'center',
          field: (row) =>
            row.exomiser_acmg_classification ? row.exomiser_acmg_classification : '',
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_acmg_evidence',
          required: true,
          label: 'ACMG Evidence',
          align: 'center',
          field: (row) => (row.exomiser_acmg_evidence ? row.exomiser_acmg_evidence : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_acmg_disease_id',
          required: true,
          label: 'ACMG Disease ID',
          align: 'center',
          field: (row) => (row.exomiser_acmg_disease_id ? row.exomiser_acmg_disease_id : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        },
        {
          name: 'exomiser_acmg_disease_name',
          required: true,
          label: 'ACMG Disease Name',
          align: 'center',
          field: (row) => (row.exomiser_acmg_disease_name ? row.exomiser_acmg_disease_name : ''),
          format: (val) => `${val}`,
          sortable: true,
          type: 'basic',
          isShow: true
        }
      ],
      exomiserRows: new Map(),
      /*-----------CONSTANT START-------------*/
      CLINVAR_NO_STAR: [
        'no assertion provided',
        'no assertion criteria provided',
        'no assertion for the individual variant'
      ],
      CLINVAR_SINGLE_STAR: [
        'criteria provided, single submitter',
        'criteria provided, conflicting interpretations'
      ],
      CLINVAR_TWO_STAR: ['criteria provided, multiple submitters, no conflicts'],
      CLINVAR_THREE_STAR: ['reviewed by expert panel'],
      CLINVAR_FOUR_STAR: ['practice guideline'],
      /*-----------CONSTANT END-------------*/
      showMoreTranscripts: new Map(),
      columnResizing: false,
      columnResizeName: '',
      columnResizeStart: 0,
      tempNote: '',
      clickedRow: ''
    }
  },
  async created() {
    //console.log(this.leftBarExpanded)
    //console.log(this.igvdata)
  },
  methods: {
    async onClickVariant(row_id) {
      if (this.clickedRow !== row_id) {
        this.clickedRow = row_id
      } else {
        this.clickedRow = ''
      }
    },
    async onClickBtn() {
      console.log(this.leftBarExpanded)
      console.log(this.variantsDataRows)
    },
    async checkCramFileExisted() {
      let showIGV = false
      this.variantsSamples.forEach((el) => {
        if (
          el.active &&
          el.cram !== '' &&
          el.cram !== null &&
          el.cram_idx !== '' &&
          el.cram_idx !== null
        ) {
          showIGV = true
        }
      })

      return showIGV
    },
    async onIGVClick(props) {
      if (!(await this.checkCramFileExisted()) && this.IsStandalone) {
        this.$q.notify({
          group: true,
          timeout: 1000,
          icon: 'warning',
          message: 'Please load cram file properly before open IGV.',
          type: 'negative'
        })
        return false
      }

      this.igvDialog = true
      const variantInfo = {
        variant_object_id: props.row._id,
        chrom: props.row.chrom,
        start: props.row.start,
        alt: props.row.alt,
        variant_type: props.row.variant_type
      }

      if (variantInfo.variant_type && variantInfo.variant_type == 'structural') {
        variantInfo.caller = props.row.caller
        variantInfo.sv_id = props.row.sv_id
      }

      if (this.IsStandalone) {
        this.igvTracks = await store.getters.getApiService.getLocalCramFile(this.variantsSamples)
      } else {
        this.igvTracks = await store.getters.getApiService.getS3SignedUrl(
          this.database_selected,
          this.variantsSamples,
          variantInfo
        )
      }

      setTimeout(() => {
        let igvDiv = document.getElementById('igv')
        // for SNP, insert no need to -1 else -1
        // for SV, if no end then use dp +- 300
        let start = null
        if (props.row.variant_type == 'small') {
          start =
            props?.row?.ref?.length < props?.row?.alt?.length
              ? props.row.start
              : props.row.start - 1
        } else {
          start = props.row.end ? props.row.start : props.row.start - 300
        }
        const end = props.row.end ? props.row.end : props.row.start + 300
        const feature_start = props.row.type == 'BND' ? props.row.start : start
        const feature_end = props.row.type == 'BND' ? props.row.start : end

        let options = {
          genome: 'hg38',
          locus: `${props.row.chrom}:${start}-${end}`,
          tracks: this.igvTracks,
          roi: [
            {
              name: this.database_selected,
              color: 'rgba(236, 236, 236, 0.4)',
              features: [
                {
                  chr: props.row.chrom,
                  start: feature_start,
                  end: feature_end
                }
              ]
            }
          ]
        }

        igv.createBrowser(igvDiv, options).then(function (browser) {
          console.log('Created IGV browser', browser)
        })
      }, 500)
    },
    async onColumnSort(columnName) {
      this.$emit('onColumnSort', columnName)
    },
    async onRowHover(key) {
      this.$emit('onRowHover', key)
    },
    async onRowClick(obj) {
      this.tableLoadingOnClickVariant = true
      this.variantClickObject = obj

      // get different data
      await this.getAFsData(obj.row)
      await this.loadRelatedVariantData(obj.row)
      await this.loadGeneData(obj.row)
      await this.loadExtData(obj.row)
      await this.loadIntpnData(obj.row)
      await this.loadExonData(obj.row)
      await this.loadExomiserData(obj.row)

      this.tableLoadingOnClickVariant = false
      this.variantDetailsDialog = true

      //console.log(await this.getProxyData(clickObj))
    },
    displayClickVariant(variantClickObject) {
      if (variantClickObject.row.type === 'INS' || variantClickObject.row.type === 'DEL') {
        return true
      }
      if (
        variantClickObject.row.variant_type === 'structural' &&
        variantClickObject.row.gene_objs &&
        Object.keys(variantClickObject.row.gene_objs).length
      ) {
        return true
      }
      if (
        variantClickObject.row.variant_type === 'small' &&
        variantClickObject.row.gene_objs &&
        Object.keys(variantClickObject.row.gene_objs).length
      ) {
        return true
      }
      if (
        variantClickObject.row.type === 'BND' &&
        variantClickObject.row.related_variants &&
        variantClickObject.row.related_variants.length > 0
      ) {
        return true
      }
      if (variantClickObject.row.exomiser_info?.exomisers?.length > 0) {
        return true
      }
      return !!(
        (variantClickObject.row.exts && variantClickObject.row.exts.length > 0) ||
        (variantClickObject.row.exons && variantClickObject.row.exons.length > 0) ||
        (variantClickObject.row.intpns && variantClickObject.row.intpns.length > 0) ||
        (variantClickObject.row.afs &&
          variantClickObject.row.afs.length > 0 &&
          variantClickObject.row.afs.filter((af) => af.AF !== -1).length > 0)
      )
    },
    async getProxyData(proxyObject) {
      return JSON.parse(JSON.stringify(proxyObject))
    },
    onVariantDetailsClick(row, index = -1, type = 'gene') {
      let geneObj = {}
      if (index == -1) {
        geneObj.gene_symbol = row.gene_symbol
        geneObj.ensembl_gene_id = row.ensembl_gene_id
        geneObj.entrez_gene_id = row.entrez_gene_id
        geneObj.mane_select = row.mane_select
        geneObj.ncbi_ids = row.ncbi_ids
      } else {
        if (row.gene_objs && row.gene_objs.length > index) {
          geneObj.gene_symbol = row.gene_objs[index].gene
          geneObj.ensembl_gene_id = row.gene_objs[index].ensembl_gene_id
          geneObj.entrez_gene_id = row.gene_objs[index].entrez_gene_id
          geneObj.mane_select = row.gene_objs[index].mane_select
          geneObj.ncbi_ids = row.gene_objs[index].ncbi_ids
        }
      }
      this.variantDetailsObj = {
        chrom: row.chrom,
        start: row.start,
        end: row.end,
        ref: row.ref,
        alt: row.alt,
        type: row.type,
        hgvsc: row.hgvsc,
        variant_type: row.variant_type,
        hg19_chrom: row.hg19_chrom,
        hg19_start: row.hg19_start,
        hg19_end: row.hg19_end,
        gene_symbol: geneObj.gene_symbol,
        ensembl_gene_id: geneObj.ensembl_gene_id,
        entrez_gene_id: geneObj.entrez_gene_id,
        mane_select: geneObj.mane_select,
        ncbi_ids: geneObj.ncbi_ids
      }
      if (type === 'hgvsc' || type === 'hgvsp') {
        let value
        if (type === 'hgvsc') {
          value = row.hgvsc.split(':')
        } else {
          value = row.hgvsp.split(':')
        }
        this.variantDetailsObj.transcript = value[0]
        this.variantDetailsObj.position = decodeURIComponent(value[1])
      }
    },
    displayGenotypeQty(genotypeQty) {
      let qtyHtml = ''
      if (genotypeQty) {
        let qty = genotypeQty.split(',')

        let i = 0
        if (qty && qty.length > 0 && qty[0] != 'undefined') {
          qty.forEach((el) => {
            if (el) {
              let colorClass
              if (this.variantsSamples[i]) {
                if (this.variantsSamples[i].active) {
                  if (this.variantsSamples[i].group === 'affected') {
                    colorClass = 'text-negative'
                  } else {
                    colorClass = 'text-positive'
                  }
                  if (i > 0) {
                    qtyHtml = qtyHtml + " | <span class='" + colorClass + "'>" + el + '</span>'
                  } else {
                    qtyHtml = qtyHtml + "<span class='" + colorClass + "'>" + el + '</span>'
                  }
                }
              }
            }

            i = i + 1
          })
        }
      }

      return qtyHtml
    },
    displayAllelicDepths(allelic_depths, copy_num = null) {
      let depthsHtml = ''
      if (allelic_depths) {
        let depths = allelic_depths.split(',')
        let i = 0
        let samplesIndex = 1
        let totalSamples = 0

        this.variantsSamples.forEach((el) => {
          if (el.active) {
            totalSamples++
          }
        })

        this.variantsSamples.forEach((el) => {
          if (el.active) {
            let colorClass
            if (el.group === 'affected') {
              colorClass = 'text-negative'
            } else {
              colorClass = 'text-positive'
            }

            depthsHtml = depthsHtml + "<span class='" + colorClass + "'>" + depths[i]
            if (copy_num == null) {
              depthsHtml = depthsHtml + '+' + depths[i + 1]
            }
            if (samplesIndex < totalSamples) {
              depthsHtml = depthsHtml + ' | '
            }

            if (copy_num == null) {
              i = i + 2
            } else {
              i = i + 1
            }

            samplesIndex = samplesIndex + 1
          }
        })
      }

      return depthsHtml
    },
    displaySampleGenotypes(genotypes_index) {
      let depthsHtml = ''

      if (genotypes_index) {
        let depths = genotypes_index.split(',')

        let i = 0
        let samplesIndex = 1

        this.variantsSamples.forEach((el) => {
          if (el.active) {
            let first, second
            if (depths[i] === '') {
              first = ''
            } else {
              first = depths[i]
            }
            if (depths[i + 1] === '') {
              second = ''
            } else {
              second = depths[i + 1]
            }

            let colorClass = ''

            let newHtml = '<div class="genotype-block">'
            if (first === '') {
              newHtml = newHtml + '<div class="dot"></div>'
            } else {
              if (first === '1') {
                if (el.group === 'affected') {
                  colorClass = 'genotypeM_affected'
                } else {
                  colorClass = 'genotypeM_not_affected'
                }
              }
              newHtml = newHtml + '<div class="genotypeM ' + colorClass + '"></div>'
            }
            colorClass = ''
            if (second === '') {
              newHtml = newHtml + '<div class="dot"></div>'
            } else {
              if (second === '1') {
                if (el.group === 'affected') {
                  colorClass = 'genotypeM_affected'
                } else {
                  colorClass = 'genotypeM_not_affected'
                }
              }
              newHtml = newHtml + '<div class="genotypeM ' + colorClass + '"></div>'
            }

            newHtml = newHtml + '</div>'
            depthsHtml = depthsHtml + newHtml
          }

          i = i + 2
          samplesIndex = samplesIndex + 1
        })
      }

      return depthsHtml
    },
    onClickSampleGenotypes(row) {
      console.log(row)
    },
    onVariantTableClick(row, selectedVariant) {
      this.variantDetailsDialog = false
      this.$emit('onVariantTableClick', selectedVariant)
    },
    async loadRelatedVariantData(row) {
      if (row.related_variants) {
        this.relatedVariantRows.set(row.variant_id, row.related_variants)
      }
    },
    async loadGeneData(row) {
      if (row.gene_objs) {
        const tempGeneRows = []
        row.gene_objs.forEach((gene) => {
          const tempGene = JSON.parse(JSON.stringify(gene))
          tempGene.gene_symbol = gene.gene
          tempGene.chrom = row.chrom
          tempGene.start = row.start
          tempGene.ref = row.ref
          tempGene.alt = row.alt
          tempGene.type = row.type
          tempGene.variant_type = row.variant_type
          tempGene.hg19_chrom = row.hg19_chrom
          tempGene.hg19_start = row.hg19_start
          tempGene.hg19_end = row.hg19_end
          tempGeneRows.push(tempGene)
        })

        this.geneRows.set(row.variant_id, tempGeneRows)
        this.defaultGeneRows.set(
          row.variant_id,
          tempGeneRows.filter((g) => g.default_show)
        )
        this.showMoreTranscripts.set(row.variant_id, false)
      }
    },
    async loadExtData(row) {
      if (row.exts) {
        this.extRows.set(row.variant_id, row.exts)
      }
    },
    async loadIntpnData(row) {
      if (row.intpns) {
        this.intpnsRows.set(row.variant_id, row.intpns)
      }
    },
    async loadExonData(row) {
      const exons = await store.getters.getApiService.getVariantExons(
        this.database_selected,
        row.variant_id
      )
      if (exons) {
        this.exonRows.set(row.variant_id, exons)
        await this.$nextTick()
      }
    },
    async loadExomiserData(row) {
      if (row.exomiser_info?.exomisers) {
        this.exomiserRows.set(row.variant_id, row.exomiser_info.exomisers)
      }
    },
    async getAFsData(row) {
      if (row.afs) {
        this.afRows.set(
          row.variant_id,
          row.afs.filter((af) => af.AF !== -1)
        )
      }
    },
    displaySortingIcon(columnName) {
      let html = ''
      this.sortingColumns.forEach((el) => {
        if (el.column === columnName) {
          if (el.sort === 'asc') {
            html += ' <span class="sortedSymbol">▲</span>'
          } else {
            html += ' <span class="sortedSymbol">▼</span>'
          }
        }
      })

      return html
    },
    displaySortingNum(columnName) {
      let html = ''
      this.sortingColumns.forEach((el, key) => {
        let displayKey = key + 1
        if (el.column === columnName) {
          html += ' <span class="sortedKey">' + displayKey + '</span>'
        }
      })

      return html
    },
    formatScientific(v) {
      if (v == null || v == undefined || v == '') {
        return ''
      } else if (v == 0) {
        return '0'
      } else if (Math.abs(v) < 1e-3 || Math.abs(v) > 1e3) {
        var sign = v > 0 ? 1 : -1
        var exponent = Math.floor(Math.log(sign * v) / Math.LN10)
        var mult = Math.pow(10, exponent)
        var mantissa = (v / mult).toFixed(1)

        //return '<span>{mantissa}{'·10'}<sup>{exponent}</sup></span>;
        if (mantissa === null || isNaN(mantissa)) {
          return ''
        }
        return mantissa + '·10' + '<sup>' + exponent + '</sup>'
      } else {
        return this.roundSignif(v, 3)
      }
    },
    formatFrequency(v) {
      var f = parseFloat(v)
      return !f || f === -1 ? '' : this.formatScientific(f)
    },
    formatPvalue(v) {
      if (v === null || v === '') {
        return ''
      } else if (v === 0) {
        return '0'
      } else if (v < 1e-5) {
        var exponent = Math.floor(Math.log(v) / Math.LN10) + 1
        //return <span>{'< 10'}<sup>{exponent}</sup></span>;
        return '< 10 <sup>' + exponent + '</sup>'
      } else {
        return this.roundSignif(v, 5)
      }
    },
    roundSignif(N, sig) {
      var n = parseFloat(N)
      if (n > 1) {
        return sprintf('%.2f', n)
      }
      var sign = n > 0 ? 1 : -1
      var mult = Math.pow(10, sig - Math.floor(Math.log(sign * n) / Math.LN10) - 1)
      if (mult === 0 || mult > 1e10) {
        return 0
      }
      return Math.round(n * mult) / mult
    },

    displayFormatHGVS(v) {
      if (v) {
        let value = v.split(':')
        if (value[1].length > 30) {
          return decodeURIComponent(value[1].slice(0, 30) + '...')
        } else {
          return decodeURIComponent(value[1])
        }
      }
    },
    async onClickClearSort(columnName) {
      this.$emit('onClickClearSort', columnName)
    },
    async onNextPage() {
      this.$emit('onNextPage')
    },
    async onNoteClick(obj) {
      let geneObj = await this.getProxyData(obj.row)
      this.geneNote = geneObj.variant_id
      this.tempNote = obj.row.note
      console.log(geneObj.variant_id)
    },
    async onNoteSubmit(obj, tempNote) {
      this.$emit('onNoteSubmit', obj, tempNote)
    },
    onClickFullScreen(props) {
      props.toggleFullscreen()
      this.fullScreen = !this.fullScreen
    },
    onClickFullScreenTrigger() {
      this.$refs.fullScreenBtn.click()
    },
    scrollToBottom() {
      if (this.variantsDataRows.length > 299) {
        const table = this.$refs.variantsTableRef.$el.querySelector('.q-table__middle')
        if (table.scrollTop + table.clientHeight >= table.scrollHeight - 2) {
          this.$refs.expandMoreBtn.click()
        }
      }
    },
    frozenTableColumns() {
      // 45.43px is the Note width and 83 is the left of Note Column
      let previousLeft = 38 + 45 + 46 // info column + select column + note column
      const trColumns = Array.from(
        document.querySelectorAll(
          ".variants-table .q-table__middle table.q-table tbody.q-virtual-scroll__content tr.q-tr:not([style*='display: none']"
        )
      )
      this.variantsDataColumns[this.variantsType].forEach((column, index) => {
        // skip the first 3 columns
        const thColumn = this.getVariantTableColumns()[index + 3]
        if (thColumn) {
          let width = 80
          let style = ''

          if (column.width) {
            width = column.width
            if (width < 30) {
              width = 30
            }
            style = style + 'width: ' + width + 'px'
          } else {
            style = 'max-width: 200px'
          }

          thColumn.querySelector('.table-header-col').style = style
          trColumns.forEach((tr) => {
            const tdColumn = Array.from(tr.children)[index + 3]
            tdColumn.querySelector('.resize-width').style = style
          })

          if (column.isFrozen) {
            thColumn.style =
              'position: sticky; z-index: 5; left: ' + previousLeft.toFixed(3) + 'px;'
            // set the columns
            trColumns.forEach((tr) => {
              const tdColumn = Array.from(tr.children)[index + 3]
              tdColumn.style =
                'position: sticky; z-index: 2; left: ' + previousLeft.toFixed(3) + 'px;'
            })
            // add current width as next element left
            previousLeft += thColumn.getBoundingClientRect().width
          } else {
            thColumn.style = ''
            // set the columns
            trColumns.forEach((tr) => {
              const tdColumn = Array.from(tr.children)[index + 3]
              tdColumn.style = ''
            })
          }
        }
      })
    },
    onTableResizeStart(e, item) {
      this.columnResizing = true
      this.columnResizeStart = e.clientX

      // when select less than 15px on the left, assume the user is clicking left element
      if (e.layerX < 15) {
        const indexOfNextElement =
          this.variantsDataColumns[this.variantsType].findIndex((col) => col.name == item.name) - 1
        if (indexOfNextElement != 0) {
          this.columnResizeName =
            this.variantsDataColumns[this.variantsType][indexOfNextElement].name
        }
      } else {
        this.columnResizeName = item.name
      }
      const startElement = this.getResizeElement()
      if (startElement.getBoundingClientRect().right - e.clientX < 15 || e.layerX < 15) {
        let refDiv = document.getElementById('resize-ref')
        if (refDiv) {
          refDiv.style.display = 'block'
          refDiv.style.left = e.clientX - refDiv.parentElement.getBoundingClientRect().left + 'px'
        }
      } else {
        this.columnResizing = false
      }
    },
    onTableResize(e) {
      if (this.columnResizing) {
        let refDiv = document.getElementById('resize-ref')
        refDiv.style.left = e.clientX - refDiv.parentElement.getBoundingClientRect().left + 'px'
      }
    },
    // rarly hit this function as added resize-ref div
    onTableResizeStop(e, item) {
      if (this.columnResizing) {
        if (this.columnResizeName === item.name) {
          let diff = Number(this.columnResizeStart - e.clientX)
          if (item.width) {
            item.width = item.width - diff
          } else {
            item.width = 80 - diff
          }

          if (item.width <= 30) {
            item.width = 30 //min column width
          }
        } else {
          const startElement = this.getResizeElement()
          let diff = Number(e.clientX - startElement.getBoundingClientRect().right)
          this.variantsDataColumns[this.variantsType].filter(
            (col) => col.name == this.columnResizeName
          )[0].width = startElement.getBoundingClientRect().width + diff
        }
        //console.log( 'item.width : ',item.width )
        this.frozenTableColumns()
        this.columnResizing = false
      }
    },
    onMarkAsReadClicked() {
      return this.selected
    },
    onResetSelectedVariants() {
      this.selected = []
    },
    onShowTranscriptClick(row) {
      this.showMoreTranscripts.set(row.variant_id, !this.showMoreTranscripts.get(row.variant_id))
    },
    onCloseVariantDetailsDialog() {
      this.geneFilter = ''
      this.exonFilter = ''
    },
    getVariantTableColumns() {
      let variantsTable = document.querySelector('.variants-table .q-table__middle')
      let row = variantsTable.querySelector('.q-table').getElementsByTagName('tr')[0]
      return row ? Array.from(row.children) : []
    },
    getResizeElement() {
      const cols = this.getVariantTableColumns()
      return cols.filter((col) => col.id == 'table-' + this.columnResizeName)[0]
    },
    createDiv() {
      let div = document.createElement('div')
      div.id = 'resize-ref'
      div.className = 'resize-ref'
      div.style.left = 0
      div.style.width = '2px'
      div.style.display = 'none'
      const that = this

      div.addEventListener('mouseup', function (e) {
        const startElement = that.getResizeElement()
        const diff = Number(e.clientX - startElement.getBoundingClientRect().right)
        let newWidth = startElement.getBoundingClientRect().width + diff - 12
        const minWidth = Math.min(+startElement.style.minWidth.replace('px', ''), 30)
        if (newWidth <= minWidth) {
          newWidth = minWidth
        }
        const selectedColumn = that.variantsDataColumns[that.variantsType].filter(
          (col) => col.name == that.columnResizeName
        )[0]
        selectedColumn.width = newWidth
        div.style.display = 'none'
        div.style.left = '-1px'
        that.columnResizing = false
        that.frozenTableColumns()
      })

      document.addEventListener('mouseup', function (e) {
        div.style.display = 'none'
      })
      return div
    },
    clearFrozen() {
      const trColumns = Array.from(
        document.querySelectorAll(
          ".variants-table .q-table__middle table.q-table tbody.q-virtual-scroll__content tr.q-tr:not([style*='display: none']"
        )
      )
      this.variantsDataColumns[this.variantsType].forEach((column, index) => {
        // skip the first 3 columns
        const thColumn = this.getVariantTableColumns()[index + 3]
        if (thColumn) {
          thColumn.style = ''
          // set the columns
          trColumns.forEach((tr) => {
            const tdColumn = Array.from(tr.children)[index + 3]
            tdColumn.style = ''
          })
        }
      })
    }
  },
  watch: {
    tableLoading(newValue) {
      if (!newValue) {
        this.clearFrozen()
        setTimeout(this.frozenTableColumns, 500)
      }
    },
    tableLoadingOnClickVariant(newValue) {
      if (newValue) {
        this.clearFrozen()
        setTimeout(this.frozenTableColumns, 500)
      }
    },
    variantsDataColumns: {
      handler(newValue) {
        if (newValue) {
          this.clearFrozen()
          setTimeout(this.frozenTableColumns, 500)
        }
      },
      deep: true
    }
  }
}
</script>
