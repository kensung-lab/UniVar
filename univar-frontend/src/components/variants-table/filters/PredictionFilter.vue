<template>
  <q-card class="filter-card">
    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">gnomAD Predicted Constraint Metrics</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <!-- gnomAD v2 Section -->
      <div class="filter-section">
        <div class="filter-subtitle text-subtitle1">gnomAD v2</div>

        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>O/E LoF upper</span>
            <!-- <q-tooltip>Observed/Expected Upper Bound</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-1 filter-symbol-col">
            <img :src="getSrc(sliderLoFUpper.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-7 slider-drag filter-control"
            v-if="!mainFilters.slider.constraint_v2_oe_lof_upper.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.constraint_v2_oe_lof_upper"
              :type="'constraint_v2_oe_lof_upper'"
              :sliderObject="sliderLoFUpper"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-7" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.constraint_v2_oe_lof_upper.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'constraint_v2_oe_lof_upper',
                  mainFilters.slider.constraint_v2_oe_lof_upper.custom_value,
                  sliderLoFUpper
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="
                mainFilters.slider['constraint_v2_oe_lof_upper']['open'] ? 'tune' : 'edit_note'
              "
              class="filter-icon"
              @click="
                onSliderEditClick(
                  mainFilters.slider.constraint_v2_oe_lof_upper,
                  'constraint_v2_oe_lof_upper'
                )
              "
            >
            </q-icon>
          </div>
        </div>

        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Z-Score mis</span>
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <img :src="getSrc(sliderZscore.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-7 slider-drag filter-control"
            v-if="!mainFilters.slider.constraint_v2_mis_z.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.constraint_v2_mis_z"
              :type="'constraint_v2_mis_z'"
              :sliderObject="sliderZscore"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-7" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.constraint_v2_mis_z.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'constraint_v2_mis_z',
                  mainFilters.slider.constraint_v2_mis_z.custom_value,
                  sliderZscore
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['constraint_v2_mis_z']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="
                onSliderEditClick(mainFilters.slider.constraint_v2_mis_z, 'constraint_v2_mis_z')
              "
            >
            </q-icon>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Z-Score syn</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <img :src="getSrc(sliderZscore.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-7 slider-drag filter-control"
            v-if="!mainFilters.slider.constraint_v2_syn_z.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.constraint_v2_syn_z"
              :type="'constraint_v2_syn_z'"
              :sliderObject="sliderZscore"
              @onChangeSlider="onChangeSlider"
            />
          </div>

          <div class="col-sm-12 col-md-7" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.constraint_v2_syn_z.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'constraint_v2_syn_z',
                  mainFilters.slider.constraint_v2_syn_z.custom_value,
                  sliderZscore
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['constraint_v2_syn_z']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="
                onSliderEditClick(mainFilters.slider.constraint_v2_syn_z, 'constraint_v2_syn_z')
              "
            >
            </q-icon>
          </div>
        </div>
      </div>
      <!-- gnomAD v4 Section -->
      <div class="filter-section">
        <div class="filter-subtitle text-subtitle1">gnomAD v4</div>

        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>O/E LoF upper</span>
            <!-- <q-tooltip>Observed/Expected Upper Bound</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <img :src="getSrc(sliderLoFUpper.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-7 slider-drag filter-control"
            v-if="!mainFilters.slider.constraint_v4_oe_lof_upper.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.constraint_v4_oe_lof_upper"
              :type="'constraint_v4_oe_lof_upper'"
              :sliderObject="sliderLoFUpper"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-7" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.constraint_v4_oe_lof_upper.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'constraint_v4_oe_lof_upper',
                  mainFilters.slider.constraint_v4_oe_lof_upper.custom_value,
                  sliderLoFUpper
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="
                mainFilters.slider['constraint_v4_oe_lof_upper']['open'] ? 'tune' : 'edit_note'
              "
              class="filter-icon"
              @click="
                onSliderEditClick(
                  mainFilters.slider.constraint_v4_oe_lof_upper,
                  'constraint_v4_oe_lof_upper'
                )
              "
            >
            </q-icon>
          </div>
        </div>

        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Z-Score mis</span>
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <img :src="getSrc(sliderZscorev4.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-7 slider-drag filter-control"
            v-if="!mainFilters.slider.constraint_v4_mis_z.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.constraint_v4_mis_z"
              :type="'constraint_v4_mis_z'"
              :sliderObject="sliderZscorev4"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-7" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.constraint_v4_mis_z.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'constraint_v4_mis_z',
                  mainFilters.slider.constraint_v4_mis_z.custom_value,
                  sliderZscorev4
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['constraint_v4_mis_z']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="
                onSliderEditClick(mainFilters.slider.constraint_v4_mis_z, 'constraint_v4_mis_z')
              "
            >
            </q-icon>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Z-Score syn</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <img :src="getSrc(sliderZscorev4.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-7 slider-drag filter-control"
            v-if="!mainFilters.slider.constraint_v4_syn_z.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.constraint_v4_syn_z"
              :type="'constraint_v4_syn_z'"
              :sliderObject="sliderZscorev4"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-7" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.constraint_v4_syn_z.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'constraint_v4_syn_z',
                  mainFilters.slider.constraint_v4_syn_z.custom_value,
                  sliderZscorev4
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['constraint_v4_syn_z']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="
                onSliderEditClick(mainFilters.slider.constraint_v4_syn_z, 'constraint_v4_syn_z')
              "
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>
    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">AlphaMissense</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <div class="checkbox-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>AlphaMissense Classification</span>
          </div>
          <div class="col-sm-12 filter-control">
            <div>
              <q-checkbox
                v-for="(item, index) in alphaMissenseClassificationOptions"
                :key="index"
                v-model="mainFilters.am_class"
                :val="item.value"
                :label="item.label"
                @click="onCheckboxClick('am_class')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="filter-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label f-12">
            <span>AlphaMissense Score</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderAlphaMissense.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.am_pathogenicity.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.am_pathogenicity"
              :type="'am_pathogenicity'"
              :sliderObject="sliderAlphaMissense"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.am_pathogenicity.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'am_pathogenicity',
                  mainFilters.slider.am_pathogenicity.custom_value,
                  sliderAlphaMissense
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['am_pathogenicity']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.am_pathogenicity, 'am_pathogenicity')"
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>
    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">REVEL</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <div class="checkbox-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>REVEL Classification</span>
          </div>
          <div class="col-sm-12 filter-control">
            <div>
              <q-checkbox
                v-for="(item, index) in revelOptions"
                :key="index"
                v-model="mainFilters.revel_class"
                :val="item.value"
                :label="item.label"
                @click="onCheckboxClick('revel_class')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="filter-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>REVEL Score</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderRevel.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.revel.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.revel"
              :type="'revel'"
              :sliderObject="sliderRevel"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.revel.custom_value"
              v-on:keyup.enter="
                onSliderEdit('revel', mainFilters.slider.revel.custom_value, sliderRevel)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['revel']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.revel, 'revel')"
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>
    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">Polyphen</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <div class="checkbox-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>Polyphen Prediction</span>
          </div>
          <div class="col-sm-12 filter-control" v-if="mainFilters.polyphen_pred">
            <div>
              <q-checkbox
                v-for="(item, index) in polyphenPredOptions"
                :key="index"
                v-model="mainFilters.polyphen_pred"
                :val="item.value"
                :label="item.label"
                @click="onCheckboxClick('polyphen_pred')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="filter-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Polyphen Score</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderPolyphen.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.polyphen_score.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.polyphen_score"
              :type="'polyphen_score'"
              :sliderObject="sliderPolyphen"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.polyphen_score.custom_value"
              v-on:keyup.enter="
                onSliderEdit(
                  'polyphen_score',
                  mainFilters.slider.polyphen_score.custom_value,
                  sliderPolyphen
                )
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['polyphen_score']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.polyphen_score, 'polyphen_score')"
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">SIFT</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <div class="checkbox-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>SIFT Prediction</span>
          </div>
          <div class="col-sm-12 filter-control">
            <div>
              <q-checkbox
                v-for="(item, index) in siftPredOptions"
                :key="index"
                v-model="mainFilters.sift_pred"
                :val="item.value"
                :label="item.label"
                @click="onCheckboxClick('sift_pred')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="filter-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>SIFT Score</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderSift.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.sift_score.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.sift_score"
              :type="'sift_score'"
              :sliderObject="sliderSift"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.sift_score.custom_value"
              v-on:keyup.enter="
                onSliderEdit('sift_score', mainFilters.slider.sift_score.custom_value, sliderSift)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['sift_score']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.sift_score, 'sift_score')"
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">CADD</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <div class="checkbox-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>CADD Classification</span>
          </div>
          <div class="col-sm-12 filter-control">
            <div>
              <q-checkbox
                v-for="(item, index) in caddClassificationOptions"
                :key="index"
                v-model="mainFilters.cadd_class"
                :val="item.value"
                :label="item.label"
                @click="onCheckboxClick('cadd_class')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="filter-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>CADD Score</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderCADD.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.cadd_phred.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.cadd_phred"
              :type="'cadd_phred'"
              :sliderObject="sliderCADD"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.cadd_phred.custom_value"
              v-on:keyup.enter="
                onSliderEdit('cadd_phred', mainFilters.slider.cadd_phred.custom_value, sliderCADD)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['cadd_phred']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.cadd_phred, 'cadd_phred')"
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Header -->
    <q-card-section class="filter-header">
      <div class="text-h6">SpliceAI</div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="filter-body">
      <div class="checkbox-section">
        <div class="filter-row row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>SpliceAI Interpretation</span>
          </div>
          <div class="col-sm-12 filter-control">
            <div>
              <q-checkbox
                v-for="(item, index) in spliceAIInterpretationOptions"
                :key="index"
                v-model="mainFilters.splice_class"
                :val="item.value"
                :label="item.label"
                @click="onCheckboxClick('splice_class')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="filter-section">
        <div class="row">
          <div class="col-sm-12 col-md-12 filter-label-full">
            <span>SpliceAI Score</span>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Highest Δ score</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderSpliceAI.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.highest_splice_ai.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.highest_splice_ai"
              :type="'highest_splice_ai'"
              :sliderObject="sliderSpliceAI"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.highest_splice_ai.custom_value"
              v-on:keyup.enter="
                onSliderEdit('highest_splice_ai', mainFilters.slider.highest_splice_ai.custom_value, sliderSpliceAI)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['highest_splice_ai']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.highest_splice_ai, 'highest_splice_ai')"
            >
            </q-icon>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Δ score of AG</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderSpliceAI.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.spliceai_pred_ds_ag.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.spliceai_pred_ds_ag"
              :type="'spliceai_pred_ds_ag'"
              :sliderObject="sliderSpliceAI"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.spliceai_pred_ds_ag.custom_value"
              v-on:keyup.enter="
                onSliderEdit('spliceai_pred_ds_ag', mainFilters.slider.spliceai_pred_ds_ag.custom_value, sliderSpliceAI)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['spliceai_pred_ds_ag']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.spliceai_pred_ds_ag, 'spliceai_pred_ds_ag')"
            >
            </q-icon>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Δ score of AL</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderSpliceAI.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.spliceai_pred_ds_al.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.spliceai_pred_ds_al"
              :type="'spliceai_pred_ds_al'"
              :sliderObject="sliderSpliceAI"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.spliceai_pred_ds_al.custom_value"
              v-on:keyup.enter="
                onSliderEdit('spliceai_pred_ds_al', mainFilters.slider.spliceai_pred_ds_al.custom_value, sliderSpliceAI)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['spliceai_pred_ds_al']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.spliceai_pred_ds_al, 'spliceai_pred_ds_al')"
            >
            </q-icon>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Δ score of DG</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderSpliceAI.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.spliceai_pred_ds_dg.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.spliceai_pred_ds_dg"
              :type="'spliceai_pred_ds_dg'"
              :sliderObject="sliderSpliceAI"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.spliceai_pred_ds_dg.custom_value"
              v-on:keyup.enter="
                onSliderEdit('spliceai_pred_ds_dg', mainFilters.slider.spliceai_pred_ds_dg.custom_value, sliderSpliceAI)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['spliceai_pred_ds_dg']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.spliceai_pred_ds_dg, 'spliceai_pred_ds_dg')"
            >
            </q-icon>
          </div>
        </div>
        <div class="filter-row row">
          <div class="col-sm-12 col-md-3 filter-label">
            <span>Δ score of DL</span>
            <!-- <q-tooltip>Z-Score for Synonymous Variants</q-tooltip> -->
          </div>
          <div class="col-sm-12 col-md-2 slider-input">
            <img :src="getSrc(sliderSpliceAI.conditions)" class="filter-symbol" />
          </div>
          <div
            class="col-sm-12 col-md-6 slider-drag filter-control"
            v-if="!mainFilters.slider.spliceai_pred_ds_dl.open"
          >
            <FilterSliderAutoStep
              v-if="renderComponent"
              :filterModel="mainFilters.spliceai_pred_ds_dl"
              :type="'spliceai_pred_ds_dl'"
              :sliderObject="sliderSpliceAI"
              @onChangeSlider="onChangeSlider"
            />
          </div>
          <div class="col-sm-12 col-md-6" v-else>
            <q-input
              square
              filled
              v-model="mainFilters.slider.spliceai_pred_ds_dl.custom_value"
              v-on:keyup.enter="
                onSliderEdit('spliceai_pred_ds_dl', mainFilters.slider.spliceai_pred_ds_dl.custom_value, sliderSpliceAI)
              "
              type="text"
              class="slider-edit-input"
            />
          </div>
          <div class="col-sm-12 col-md-1 slider-input">
            <q-icon
              :name="mainFilters.slider['spliceai_pred_ds_dl']['open'] ? 'tune' : 'edit_note'"
              class="filter-icon"
              @click="onSliderEditClick(mainFilters.slider.spliceai_pred_ds_dl, 'spliceai_pred_ds_dl')"
            >
            </q-icon>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import FilterSliderAutoStep from '@/components/variants-table/filters/FilterSliderAutoStep.vue'
import { getImageSrc } from '@/utils/variants-table/filter/slider-utils'

export default {
  name: 'PredictionFilter',
  components: {
    FilterSliderAutoStep
  },
  props: [
    'renderComponent',
    'filters',
    'filterTooltip',
    'polyphenPredOptions',
    'siftPredOptions',
    'sliderObject',
    'sliderRevel',
    'sliderCADD',
    'sliderObject: sliderFiveStep',
    'sliderZscore',
    'sliderZscorev4',
    'sliderAlphaMissense',
    'sliderSift',
    'sliderPolyphen',
    'sliderMisUpper',
    'sliderSpliceAI',
    'sliderLoFUpper',
    'spliceAIItem',
    'gte',
    'lte',
    'alphaMissenseClassificationOptions',
    'caddClassificationOptions',
    'revelOptions',
    'spliceAIInterpretationOptions',
  ],
  emits: [
    'onPolyphenPredClick',
    'onPolyphenPredItemsClick',
    'onSiftPredClick',
    'onSiftPredItemsClick',
    'onSliderEditReserve',
    'onChangeSelectBox',
    'onCheckBoxAllClick',
    'onCheckBoxItemsClick',
    'onChangeSlider',
    'onSliderEdit',
    'onSliderEditClick',
    'onCheckboxClick',
    'changeTab'
  ],
  data() {
    return {
      mainFilters: this.filters
    }
  },
  async created() {
    //start component
  },
  methods: {
    async onPolyphenPredClick() {
      this.$emit('onPolyphenPredClick')
    },
    async onPolyphenPredItemsClick() {
      this.$emit('onPolyphenPredItemsClick')
    },
    async onSiftPredClick() {
      this.$emit('onSiftPredClick')
    },
    async onSiftPredItemsClick() {
      this.$emit('onSiftPredItemsClick')
    },
    async onSliderEditReserve(type, newValue, sliderObject) {
      this.$emit('onSliderEditReserve', type, newValue, sliderObject)
    },
    async onChangeSelectBox(type, selectedValue) {
      this.$emit('onChangeSelectBox', type, selectedValue)
    },
    async onCheckBoxAllClick(type) {
      this.$emit('onCheckBoxAllClick', type)
    },
    async onCheckBoxItemsClick(type) {
      this.$emit('onCheckBoxItemsClick', type)
    },
    async onChangeSlider(type, newValue, sliderObject) {
      this.$emit('onChangeSlider', type, newValue, sliderObject)
    },
    async onSliderEdit(type, newValue, sliderObject) {
      this.$emit('onSliderEdit', type, newValue, sliderObject)
    },
    async onSliderEditClick(object, type) {
      this.$emit('onSliderEditClick', object, type)
    },
    async onCheckboxClick(type) {
      this.$emit('onCheckboxClick', type, this.mainFilters[type])
    },
    getSrc(conditions) {
      return getImageSrc(conditions, this.gte, this.lte)
    }
  }
}
</script>
