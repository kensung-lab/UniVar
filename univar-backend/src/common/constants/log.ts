export const APPLICATION_NAME = 'univar-backend';

export const AUDIT_LOG_TYPE = {
  REQUEST: 'request',
  RESPONSE: 'response',
  USER_ACTION: 'user-action',
  DATA_UPDATE: 'data-update',
  ERROR: 'error',
  PERFORMANCE: 'performance',
};

export const ACTION_TYPE = {
  ACTION: 'action',
  QUERY: 'query',
  VARIANT_QUERY: 'variant_query',
  MODIFY: 'modify',
  COUNT_DB: 'count_db',
  FIND_DB: 'find_db',
  INSERT_DB: 'insert_db',
  UPDATE_DB: 'update_db',
  EXPORT: 'export',
  JS_TASK: 'js_task',
  GET_FILE: 'get_file',
  UNKNOWN: 'unknown',
  UPLOAD_FILE: 'upload_file',
  UPLOAD_S3: 'upload_s3',
  SAMPLE_FILE: 'sample_file',
  DELETE_DB: 'delete_db',
  TRIGGER_PIPELINE: 'tigger_pipeline',
  EXTRACT_FILE: 'extract_file',
  PIPELINE: 'run_pipeline',
};

export const URL_BASED_ACTION_NAME = new Map([
  ['/auth/login', { action_type: ACTION_TYPE.ACTION, action_name: 'login' }],
  ['/auth/logout', { action_type: ACTION_TYPE.ACTION, action_name: 'logout' }],
  [
    '/database/list',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_databases' },
  ],
  [
    '/database/list/all',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_pipeline_status' },
  ],
  [
    '/database/caller-info',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_caller_info' },
  ],
  [
    '/gene-panel/list',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_gene_panel' },
  ],
  [
    '/bookmark/save',
    { action_type: ACTION_TYPE.MODIFY, action_name: 'save_bookmark' },
  ],
  [
    '/bookmark/list',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_bookmarks' },
  ],
  [
    '/bookmark/delete',
    { action_type: ACTION_TYPE.MODIFY, action_name: 'delete_bookmarks' },
  ],
  [
    '/pipeline/info',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_pipeline_info' },
  ],
  [
    '/pipeline/info/standalone',
    {
      action_type: ACTION_TYPE.QUERY,
      action_name: 'query_pipeline_info_standalone',
    },
  ],
  [
    '/project/list',
    { action_type: ACTION_TYPE.QUERY, action_name: 'list_all_projects' },
  ],
  [
    '/project/get-one-project',
    { action_type: ACTION_TYPE.QUERY, action_name: 'get_one_project' },
  ],
  [
    '/project/edit-database-status',
    { action_type: ACTION_TYPE.MODIFY, action_name: 'edit_database_status' },
  ],
  [
    '/project/edit-database-note',
    {
      action_type: ACTION_TYPE.MODIFY,
      action_name: 'edit_database_note_in_project',
    },
  ],
  [
    '/project/list-database-to-add',
    { action_type: ACTION_TYPE.QUERY, action_name: 'list_database_to_add' },
  ],
  [
    '/project/add-database',
    { action_type: ACTION_TYPE.MODIFY, action_name: 'add_database_to_project' },
  ],
  [
    '/project/remove-database',
    {
      action_type: ACTION_TYPE.MODIFY,
      action_name: 'remove_database_from_project',
    },
  ],
  [
    '/project/get-one-db-status',
    {
      action_type: ACTION_TYPE.QUERY,
      action_name: 'get_one_database_status_from_project',
    },
  ],
  [
    '/project/change-one-db-status',
    {
      action_type: ACTION_TYPE.MODIFY,
      action_name: 'change_one_database_status_from_project',
    },
  ],
  [
    '/hpo-term/version',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_hpo_term_version' },
  ],
  [
    '/hpo-term',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_hpo_terms' },
  ],
  [
    '/variant/find',
    { action_type: ACTION_TYPE.VARIANT_QUERY, action_name: 'query_variants' },
  ],
  [
    '/variant/find-exons',
    {
      action_type: ACTION_TYPE.QUERY,
      action_name: 'query_variants_exons_detail',
    },
  ],
  [
    '/variant/mark-read',
    { action_type: ACTION_TYPE.MODIFY, action_name: 'mark_as_read' },
  ],
  [
    '/variant/save-note',
    { action_type: ACTION_TYPE.MODIFY, action_name: 'save_note' },
  ],
  [
    '/variant/export-tsv',
    { action_type: ACTION_TYPE.EXPORT, action_name: 'export_tsv' },
  ],
  [
    '/variant/get-export-tsv',
    { action_type: ACTION_TYPE.EXPORT, action_name: 'get_export_tsv' },
  ],
  [
    '/variant/export-vcf',
    { action_type: ACTION_TYPE.EXPORT, action_name: 'export_vcf' },
  ],
  [
    '/variant/get-export-vcf',
    { action_type: ACTION_TYPE.EXPORT, action_name: 'get_export_vcf' },
  ],
  [
    '/variant/get-exomiser-runs',
    { action_type: ACTION_TYPE.QUERY, action_name: 'get_exomiser_run' },
  ],
  [
    '/variant/delete-exomiser-run',
    { action_type: ACTION_TYPE.DELETE_DB, action_name: 'delete_exomiser_run' },
  ],
  [
    '/sample/list',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_samples' },
  ],
  [
    '/gene-db/detail',
    { action_type: ACTION_TYPE.QUERY, action_name: 'query_gene_db_detail' },
  ],
  [
    '/pipeline/upload',
    {
      action_type: ACTION_TYPE.UPLOAD_FILE,
      action_name: 'upload_pipeline_file',
    },
  ],
  [
    '/pipeline/run-exomiser',
    {
      action_type: ACTION_TYPE.TRIGGER_PIPELINE,
      action_name: 'trigger_exomiser_run',
    },
  ],
  [
    '/pipeline/upload/vcfs',
    {
      action_type: ACTION_TYPE.TRIGGER_PIPELINE,
      action_name: 'retrieve_ped_info_from_vcfs',
    },
  ],
  [
    '/pipeline/delete',
    {
      action_type: ACTION_TYPE.DELETE_DB,
      action_name: 'delete_pipeline',
    },
  ],
  [
    '/pipeline/sample/hpo',
    {
      action_type: ACTION_TYPE.SAMPLE_FILE,
      action_name: 'download_sample_hpo',
    },
  ],
  [
    '/pipeline/sample/ped',
    {
      action_type: ACTION_TYPE.SAMPLE_FILE,
      action_name: 'download_sample_ped',
    },
  ],
  [
    '/pipeline/sample/snp',
    {
      action_type: ACTION_TYPE.SAMPLE_FILE,
      action_name: 'download_sample_snp',
    },
  ],
  [
    '/pipeline/sample/sv',
    {
      action_type: ACTION_TYPE.SAMPLE_FILE,
      action_name: 'download_sample_sv',
    },
  ],
  [
    '/pipeline/sample/menu',
    {
      action_type: ACTION_TYPE.SAMPLE_FILE,
      action_name: 'download_sample_menu',
    },
  ],
  [
    '/pipeline/sample/tutorial',
    {
      action_type: ACTION_TYPE.SAMPLE_FILE,
      action_name: 'download_sample_tutorial',
    },
  ],
  [
    '/pipeline/pipeline-error',
    {
      action_type: ACTION_TYPE.DELETE_DB,
      action_name: 'pipeline-error',
    },
  ],
  [
    '/pipeline/annotate-server',
    {
      action_type: ACTION_TYPE.PIPELINE,
      action_name: 'run_server_pipeline',
    },
  ]
]);

export const NOT_LOGIN_USER = 'not_login';

export const NO_LOG_URL = [
  '/health',
  '/',
  '/ws/socket.io/?EIO=4&transport=websocket',
];
