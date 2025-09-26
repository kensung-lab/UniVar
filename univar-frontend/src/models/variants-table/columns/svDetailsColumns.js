const SV_COLUMNS =  [
  {
    name: 'ref',
    required: true,
    label: 'Ref',
    align: 'center',
    field: row => row.ref,
    format: val => `${val}`,
    sortable: true,
    type: "insertion",
    isShow: true
  },
  {
    name: 'alt',
    required: true,
    label: 'Alt',
    align: 'center',
    field: row => row.alt,
    format: val => `${val}`,
    sortable: true,
    type: "insertion",
    isShow: true
  },
  {
    name: 'geneTable',
    required: true,
    label: 'Gene Table',
    align: 'center',
    field: row => row.geneTable,
    format: val => `${val}`,
    sortable: true,
    type: "insertion",
    isShow: true
  },
  {
    name: 'ref',
    required: true,
    label: 'Ref',
    align: 'center',
    field: row => row.ref,
    format: val => `${val}`,
    sortable: true,
    type: "deletion",
    isShow: true
  },
  {
    name: 'alt',
    required: true,
    label: 'Alt',
    align: 'center',
    field: row => row.alt,
    format: val => `${val}`,
    sortable: true,
    type: "deletion",
    isShow: true
  },
  {
    name: 'geneTable',
    required: true,
    label: 'Gene Table',
    align: 'center',
    field: row => row.geneTable,
    format: val => `${val}`,
    sortable: true,
    type: "deletion",
    isShow: true
  },
  {
    name: 'ref',
    required: true,
    label: 'Ref',
    align: 'center',
    field: row => row.ref,
    format: val => `${val}`,
    sortable: true,
    type: "duplication",
    isShow: true
  },
  {
    name: 'alt',
    required: true,
    label: 'Alt',
    align: 'center',
    field: row => row.alt,
    format: val => `${val}`,
    sortable: true,
    type: "duplication",
    isShow: true
  },
  {
    name: 'geneTable',
    required: true,
    label: 'Gene Table',
    align: 'center',
    field: row => row.geneTable,
    format: val => `${val}`,
    sortable: true,
    type: "duplication",
    isShow: true
  },
  {
    name: 'ref',
    required: true,
    label: 'Ref',
    align: 'center',
    field: row => row.ref,
    format: val => `${val}`,
    sortable: true,
    type: "BND",
    isShow: true
  },
  {
    name: 'alt',
    required: true,
    label: 'Alt',
    align: 'center',
    field: row => row.alt,
    format: val => `${val}`,
    sortable: true,
    type: "BND",
    isShow: true
  },
  {
    name: 'geneTable',
    required: true,
    label: 'Gene Table',
    align: 'center',
    field: row => row.geneTable,
    format: val => `${val}`,
    sortable: true,
    type: "BND",
    isShow: true
  },

  {
    name: 'relatedVariants',
    required: true,
    label: 'Related Variants',
    align: 'center',
    field: row => row.relatedVariants,
    format: val => `${val}`,
    sortable: true,
    type: "BND",
    isShow: true
  },
]

export default SV_COLUMNS