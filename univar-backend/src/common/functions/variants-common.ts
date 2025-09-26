import { DatabaseService, GenePanelService } from 'src/applicationInfo';
import {
  SNV_ONLY_FILTERS,
  SNV_TYPE_FILTER_NAME,
  SV_ONLY_FILTERS,
  SV_TYPE_FILTER_NAME,
  SPECIAL_HANDLE_FILTERS,
  IS_READ_COLUMN_NAME,
  SCENARIO_COLUMN_NAME,
  CLINGEN_HI_COLUMN_NAME,
  CLINGEN_TS_COLUMN_NAME,
  EXCEPTION_CODE,
  SPECIAL_HANDLE_SORT,
  CLN_SIG_PATHOGENIC,
  IMPACT_SEVERITY_HIGH,
  SV_AF_FILTERS,
  IMPACT_SEVERITY_MODERATE,
  SCENARIO_LIST,
  NOTE_COLUMN_NAME,
  ARRAY_SORT_LIST,
  EXOMISER_COLUMN_LIST,
  CONSTRAINT_FILTERS,
} from '../constants';
import {
  CustomException,
  DatabaseData,
  Filters,
  Samples,
  UserInfo,
} from '../payloads';

export async function filterModifier(
  genePanelService: GenePanelService,
  filter: Filters,
  panels: string[],
  samples: Samples[],
  userInfo: UserInfo,
  track_number: string,
  exomiser_run: string = undefined,
) {
  const newFilter = {};
  const smallVariantFilter = {};
  const svFilter = {};
  filter = filter || {};
  for (const [key, value] of Object.entries(filter)) {
    if ((value || value == 0) && key) {
      if (SNV_ONLY_FILTERS.includes(key)) {
        if (key === SNV_TYPE_FILTER_NAME) {
          smallVariantFilter['type'] = value;
        } else {
          smallVariantFilter[key] = value;
        }
      } else if (SV_ONLY_FILTERS.includes(key)) {
        if (key === SV_TYPE_FILTER_NAME) {
          svFilter['type'] = value;
        } else if (key == 'caller') {
          svFilter[key] = value;
        } else if (SV_AF_FILTERS.includes(key)) {
          const tempAfs = {};
          tempAfs['$elemMatch'] = {};
          tempAfs['$elemMatch']['source_filter'] = key;
          tempAfs['$elemMatch']['AF'] = value;
          if (!svFilter['afs'] && !svFilter['$and']) {
            svFilter['afs'] = tempAfs
          } else if(!svFilter['$and'] || !svFilter['$and'].length) {
            svFilter['$and'] = [];
            const tempExistingAfs = {};
            tempExistingAfs['afs'] = svFilter['afs'];
            svFilter['$and'].push(tempExistingAfs);
            const tempAfCondition = {};
            tempAfCondition['afs'] = tempAfs;
            svFilter['$and'].push(tempAfCondition);
            delete svFilter['afs'];
          } else {
            const tempAfCondition = {};
            tempAfCondition['afs'] = tempAfs;
            svFilter['$and'].push(tempAfCondition);
          }
        } else {
          svFilter[key] = value;
        }
      } else if (SPECIAL_HANDLE_FILTERS.includes(key)) {
        if (key == IS_READ_COLUMN_NAME) {
          if (value) {
            newFilter[key] = userInfo.preferred_username;
          } else {
            newFilter[key] = {};
            newFilter[key]['$ne'] = userInfo.preferred_username;
          }
        } else if (key == NOTE_COLUMN_NAME) {
          if (value) {
            newFilter['note'] = {};
            newFilter['note']['$elemMatch'] = {};
            newFilter['note']['$elemMatch']['user'] =
              userInfo.preferred_username;
            newFilter['note']['$elemMatch']['note'] = {};
            newFilter['note']['$elemMatch']['note']['$ne'] = '';
            newFilter['note']['$elemMatch']['note']['$exists'] = true;
          } else {
            newFilter['$or'] = [];
            const notUserNote = {};
            notUserNote['note.user'] = {};
            notUserNote['note.user']['$ne'] = userInfo.preferred_username;
            newFilter['$or'].push(notUserNote);
            const userEmptyNote = {};
            userEmptyNote['note'] = {};
            userEmptyNote['note']['$elemMatch'] = {};
            userEmptyNote['note']['$elemMatch']['user'] =
              userInfo.preferred_username;
            userEmptyNote['note']['$elemMatch']['note'] = {};
            userEmptyNote['note']['$elemMatch']['note']['$eq'] = '';
            userEmptyNote['note']['$elemMatch']['note']['$exists'] = true;
            newFilter['$or'].push(userEmptyNote);
          }
        } else if (key == SCENARIO_COLUMN_NAME) {
          if (value.includes('2')) {
            const scenarioArray = [value.charAt(0)];
            const listOfScenario = value.substring(1).split('');
            listOfScenario.forEach((scenarioStr) => {
              if (scenarioStr != 2) {
                scenarioArray.forEach((scenario, index) => {
                  scenarioArray[index] = scenario + scenarioStr;
                });
              } else {
                const tempNewArray = [];
                scenarioArray.forEach((scenario) => {
                  tempNewArray.push(scenario + '0');
                });
                scenarioArray.forEach((scenario, index) => {
                  scenarioArray[index] = scenario + '1';
                });
                scenarioArray.push(...tempNewArray);
              }
            });
            newFilter[key] = { $in: scenarioArray };
          } else if (value == 'any') {
            newFilter[key] = {};
            // any scenario
            let scenarioList = SCENARIO_LIST;
            samples.forEach((sample) => {
              scenarioList = scenarioList.map((scenario) => {
                return scenario + (sample.group == 'affected' ? '1' : '0');
              });
            });

            newFilter[key]['$in'] = scenarioList;
          } else {
            newFilter[key] = value;
          }
        } else if (
          key === CLINGEN_HI_COLUMN_NAME ||
          key === CLINGEN_TS_COLUMN_NAME
        ) {
          if (!newFilter['gene_objs']) {
            newFilter['gene_objs'] = {};
            newFilter['gene_objs']['$elemMatch'] = {};
          }
          if (Array.isArray(value)) {
            newFilter['gene_objs']['$elemMatch'][key] = {};
            newFilter['gene_objs']['$elemMatch'][key]['$in'] = value;
          } else {
            newFilter['gene_objs']['$elemMatch'][key] = value;
          }

          delete newFilter[key];
        } else if (key == 'gene_objs.gene_filter') {
          newFilter[key] = {};
          newFilter[key]['$in'] = value['$in'].map((gene: string) =>
            gene.toUpperCase(),
          );
        } else if (key == 'univar_high_impact' && value == 1) {
          // if other special logic require or...then please modify below logic to fit new logic
          smallVariantFilter['$or'] = [];
          // impact high
          smallVariantFilter['$or'].push({
            impact_severity: IMPACT_SEVERITY_HIGH,
          });
          smallVariantFilter['$or'].push({
            clnsig: { $in: CLN_SIG_PATHOGENIC },
          });
          const highImpactCondition = {};
          highImpactCondition['impact_severity'] = IMPACT_SEVERITY_MODERATE;
          highImpactCondition['$or'] = [];
          highImpactCondition['$or'].push({ polyphen_score: { $gt: 0.85 } });
          highImpactCondition['$or'].push({ sift_score: { $lt: 0.05 } });
          highImpactCondition['$or'].push({ cadd_phred: { $gt: 20 } });
          highImpactCondition['$or'].push({ revel: { $gt: 0.5 } });

          smallVariantFilter['$or'].push(highImpactCondition);
        } else if (
          (key == 'highest_exomiser_gene_combined_score' ||
            key == 'highest_exomiser_gene_pheno_score') &&
          exomiser_run
        ) {
          newFilter[`${exomiser_run}.${key}`] = value;
        } else if (CONSTRAINT_FILTERS.includes(key)) {
          if (!newFilter['gene_objs']) {
            newFilter['gene_objs'] = {};
            newFilter['gene_objs']['$elemMatch'] = {};
          }
          if (Array.isArray(value)) {
            newFilter['gene_objs']['$elemMatch'][key] = {};
            newFilter['gene_objs']['$elemMatch'][key]['$in'] = value;
          } else {
            newFilter['gene_objs']['$elemMatch'][key] = value;
          }

          delete newFilter[key];
        }
      } else {
        newFilter[key] = value;
      }
    }
  }
  if (panels?.length) {
    const geneArrays = [];
    const genePanels = await genePanelService.getGenePanelList(
      track_number,
      userInfo,
      {
        _id: { $in: panels },
      },
    );
    if (genePanels) {
      genePanels.forEach((genePanel) => {
        geneArrays.push(
          ...genePanel.genes.map((gene) => gene.gene_symbol.toUpperCase()),
        );
      });
    }
    if (newFilter['gene_objs.gene_filter']) {
      geneArrays.push(
        ...newFilter['gene_objs.gene_filter']['$in'].map((gene) =>
          gene.toUpperCase(),
        ),
      );
    } else {
      newFilter['gene_objs.gene_filter'] = {};
    }
    newFilter['gene_objs.gene_filter']['$in'] = geneArrays;
  }

  if (samples?.length) {
    filter = newFilter;
    const sampleList = samples
      .filter((sample) => sample.active)
      .map((sample) => sample.i);

    // only add this filter when the sample count is not the same
    if (sampleList.length != samples.length) {
      filter['sample'] = {};
      filter['sample']['$in'] = sampleList;
    }
  }

  if (
    Object.keys(smallVariantFilter).length > 0 ||
    Object.keys(svFilter).length > 0
  ) {
    let conditions = newFilter;
    if (newFilter['$or']) {
      newFilter['$and'] = [];
      const filtersOr = {};
      filtersOr['$or'] = [...newFilter['$or']];
      newFilter['$and'].push(filtersOr);
      delete newFilter['$or'];
      conditions = {};
      newFilter['$and'].push(conditions);
    }
    conditions['$or'] = [];
    smallVariantFilter['variant_type'] = 'small';
    conditions['$or'].push(smallVariantFilter);
    svFilter['variant_type'] = 'structural';
    conditions['$or'].push(svFilter);
  }

  return newFilter;
}

export async function checkSelectedDatabaseExist(
  databaseService: DatabaseService,
  track_number: string,
  selected_database: string,
  userInfo,
): Promise<DatabaseData[]> {
  const databaseData = await databaseService.findDatabaseList(
    track_number,
    userInfo,
    {
      database_name: selected_database,
    },
  );

  if (!databaseData || databaseData.length < 1) {
    throw new CustomException(EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST);
  }

  // since the databaseData should always be DatabaseData[] type
  return databaseData as DatabaseData[];
}

export function massageVariantSort(sort, exomiser_run = undefined) {
  let hasChrom = false;
  let hasStart = false;
  sort = sort || [];
  const tempResult = sort.map((sortItem) => {
    const order = sortItem.sort == 'asc' ? 1 : -1;
    let columnName = sortItem.column;
    if (ARRAY_SORT_LIST.includes(sortItem.column)) {
      columnName = 'first_' + columnName;
    }

    if (SPECIAL_HANDLE_SORT.includes(sortItem.column)) {
      switch (sortItem.column) {
        case 'gene_symbol':
          columnName = 'gene_objs.gene';
          break;
        case 'ensembl_gene_id':
          columnName = 'gene_objs.ensembl_gene_id';
          break;
        case 'entrez_gene_id':
          columnName = 'gene_objs.entrez_gene_id';
          break;
        case 'ensembl_transcript_id':
          columnName = 'gene_objs.ensembl_transcript_id';
          break;
        case 'pathogenic':
          columnName = 'is_pathogenic';
          break;
        case 'source':
          columnName = 'caller';
          break;
        case 'chrom':
          hasChrom = true;
          break;
        case 'start':
          hasStart = true;
          break;
        default:
          if (EXOMISER_COLUMN_LIST.includes(sortItem.column) && exomiser_run) {
            columnName = `${exomiser_run}.${sortItem.column}`;
          }
      }
    }

    return [columnName, order];
  });
  if (!hasChrom) {
    tempResult.push(['chrom', 1]);
  }
  if (!hasStart) {
    tempResult.push(['start', 1]);
  }

  return tempResult;
}
