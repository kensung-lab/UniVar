<template>
  <div>
    <template v-if="this.exomiser_info?.length > 0">
      <template v-for="(ele, index) in this.exomiser_info" :key="index">
        <q-item clickable>
          <q-item-section>
            <div class="preset-container">
              <div
                class="preset-list-left"
                :class="!ele.is_ready ? 'disable-exomiser' : ''"
                @click="ele.is_ready ? onSelectExomiser(ele) : ''"
                v-close-popup="!!ele.is_ready"
              >
                <div>
                  <span class="select-label">{{ ele.display_name }}</span>
                  <span v-if="!ele.is_ready">
                    <img src="@/assets/img/loading.svg" class="loading-svg" />
                  </span>
                  <div class="hover-container hover-exomiser">
                    HPO Terms : <br />
                    <div v-for="(hpo, i) in ele.hpoDisplays" :key="i">
                      <q-icon name="radio_button_checked" class="filtered-box-icon"></q-icon>
                      {{ hpo }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="preset-list-right" v-if="ele.is_ready && !ele.is_example">
                <q-tooltip>Delete Exomiser Run</q-tooltip>
                <q-icon
                  name="clear"
                  class="preset-delete-btn"
                  @click="onDeleteExomiser(ele)"
                  v-close-popup
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </template>
    <template v-else>
      <q-item clickable>
        <q-item-section>
          <div class="preset-container">
            <div class="preset-list-left disable-exomiser">
              <div>
                <span class="select-label">No Exomiser processing</span>
              </div>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </template>
  </div>
</template>

<style>
.loading-svg {
  margin-left: 10px;
}

.select-label {
  vertical-align: super;
}

.disable-exomiser {
  cursor: not-allowed;
  color: #777777;
}
</style>
<script>
export default {
  name: 'ExomiserSelect',
  props: ['exomiser_info'],
  emits: ['onSelectExomiser', 'onDeleteExomiser'],
  data() {
    return {}
  },
  async created() {},
  methods: {
    async onSelectExomiser(exomiser) {
      this.$emit('onSelectExomiser', exomiser)
    },
    async onDeleteExomiser(exomiser) {
      this.$emit('onDeleteExomiser', exomiser)
    }
  }
}
</script>
