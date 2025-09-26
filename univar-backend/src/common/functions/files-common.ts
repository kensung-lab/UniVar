import { Readable } from 'stream';
import {
  BRAND_UNIVAR_UPLOAD_FILE_SIZE_LIMIT,
  EXCEPTION_CODE,
} from '../constants';
import zlib from 'zlib';
import * as readline from 'node:readline/promises';
import { CustomException, SVFileInfo } from '../payloads';

export function checkGzip(buffer: Buffer) {
  let result = false;

  if (buffer.length >= 3) {
    result = buffer[0] === 0x1f && buffer[1] === 0x8b && buffer[2] === 0x08;
  }
  return result;
}

export function validateSNPFileName(snpFileName: string) {
  // Regex: ^([a-zA-Z0-9-]*)_(trio|duopat|solo|n(\d*))(_[a-zA-Z0-9-]*){0,2}(\.vcf\.gz)$
  // Format: <prodband_id>_<family_type>[_<other_sample_id>]{0,2}.vcf.gz
  // Sample: B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1.vcf.gz
  return /^([a-zA-Z0-9-]*)_(trio|duopat|solo|n(\d*))(_[a-zA-Z0-9-]*){0,2}(\.vcf\.gz)$/g.test(
    snpFileName,
  );
}

export function validateSVFileName(svFileName: string) {
  // Regex: ^([a-zA-Z0-9-]*)_(trio|duopat|solo|n(\d*))(_[a-zA-Z0-9-]*){0,2}.(\w*)(\.vcf\.gz)$
  // Format: <prodband_id>_<family_type>[_<other_sample_id>]{0,2}.<caller>.vcf.gz
  // Sample: B0000851B01-001-LIB1_trio_B0000852B01-001-LIB1_B0000853B01-001-LIB1.manta.vcf.gz
  return /^([a-zA-Z0-9-]*)_(trio|duopat|solo|n(\d*))(_[a-zA-Z0-9-]*){0,2}.(\w*)(\.vcf\.gz)$/g.test(
    svFileName,
  );
}

export function validateHPOTerm(hpoTerm: string) {
  // Regex: ^HP:(\d{7})$
  // Sample: HP:0000598
  return /^HP:(\d{7})$/g.test(hpoTerm);
}

export function validateFileSize(filesize: number) {
  return filesize <= BRAND_UNIVAR_UPLOAD_FILE_SIZE_LIMIT;
}

export function getDatabaseName(variantFileName: string, uuid: string) {
  const fileName = variantFileName.split('.')[0];

  return fileName.split('_')[0] + '_' + fileName.split('_')[1] + '_' + uuid;
}

export function getVariantFileName(variantFileName: string, uuid: string) {
  const variantFileNames = variantFileName.split('.');
  let result = variantFileName.split('.')[0] + '_' + uuid;
  variantFileNames.forEach((fileParts: string, index: number) => {
    if (index > 0) {
      result += '.' + fileParts;
    }
  });

  return result;
}

export async function getFileName(
  probandId: string,
  originalFileName: string,
  buffer: Buffer,
  vcfType: string = 'snp',
  svCallers: SVFileInfo[] = undefined,
): Promise<string> {
  let resultPart = '';
  if (vcfType === 'snp') {
    resultPart = await getFileNameParts(probandId, buffer);
  } else {
    resultPart = await getSVFileNameWithCaller(probandId, originalFileName, buffer, svCallers);
  }
  return `${resultPart}.vcf.gz`;
}

export async function getSVFileNameWithCaller(
  probandId: string,
  originalFileName: string,
  buffer: Buffer,
  svCallers: SVFileInfo[],
): Promise<string> {
  const svCaller = svCallers.filter(
    (svCaller: SVFileInfo) => svCaller.filename === originalFileName,
  );
  if (!svCaller || svCaller.length == 0 || svCaller.length > 1) {
    throw new CustomException(EXCEPTION_CODE.NOT_VALID_SV_VCF_FILE);
  }
  const basicFileName = await getFileNameParts(probandId, buffer, 'sv');

  return `${basicFileName}.${svCaller[0].caller}`;
}


export async function getFileNameParts(
  probandId: string,
  buffer: Buffer,
  vcfType: string = 'snp',
): Promise<string> {
  let numSample = '';
  try {
    for await (const line of line$(buffer)) {
      if (line.startsWith('#CHROM')) {
        const columns = line.split('\t');
        if (columns.includes('FORMAT')) {
          const removeKeys = [
            '#CHROM',
            'POS',
            'ID',
            'REF',
            'ALT',
            'QUAL',
            'FILTER',
            'INFO',
            'FORMAT',
          ];
          removeKeys.forEach((key) => {
            columns.splice(columns.indexOf(key), 1);
          });
          // should be each sample ID
          switch (columns.length) {
            case 0:
              throw new CustomException(
                vcfType == 'snp'
                  ? EXCEPTION_CODE.NOT_VALID_SNP_VCF_FILE
                  : EXCEPTION_CODE.NOT_VALID_SV_VCF_FILE,
              );
            case 1:
              numSample = 'solo';
              break;
            case 2:
              numSample = 'duo';
              break;
            case 3:
              numSample = 'trio';
              break;
            default:
              numSample = 'n' + columns.length;
          }
        } else {
          numSample = 'solo';
        }
        break;
      }
    }
  } catch (e) {
    throw e;
  }
  return `${probandId}_${numSample}`;
}

export function getFullBucketPath(
  bucketName: string,
  pathPrefix: string,
  fileName: string,
) {
  return 's3://' + bucketName + '/' + pathPrefix + fileName;
}

export const line$ = (buffer: Buffer) =>
  readline.createInterface({
    input: Readable.from(buffer).pipe(zlib.createGunzip()),
    crlfDelay: Infinity,
  });

export async function getPedFromVCF(buffer: Buffer): Promise<string> {
  let result = '#Family ID	Individual ID	Paternal ID	Maternal ID	Sex	Phenotype\n';
  const pedigreeInfos = [];
  const sampleIds = [];
  const defaultFamilyID = 'DefaultFamilyID';
  let anyPedInfo = false;
  try {
    for await (const line of line$(buffer)) {
      if (line.startsWith('##PEDIGREE')) {
        if (line.includes('=<') && line.endsWith('>')) {
          const pedigreeLine = line.split('=<')[1].replace('>', '');
          const pedigreeMatchs = pedigreeLine.match(/(\w+)=("[^"]+"|[^,]+)/g);
          const eachPedInfo = {};
          pedigreeMatchs.forEach((eachPed) => {
            const pedInfos = eachPed.split('=');
            eachPedInfo[pedInfos[0]] = pedInfos[1];
            sampleIds.push(pedInfos[1]);
          });
          pedigreeInfos.push(eachPedInfo);
        } else {
          throw new CustomException(
            EXCEPTION_CODE.UPLOAD_VCF_PED_FORMAT_INCORRECT,
          );
        }
        anyPedInfo = true;
      } else if (line.startsWith('#CHROM')) {
        const columns = line.split('\t');
        if (columns.includes('FORMAT')) {
          const removeKeys = [
            '#CHROM',
            'POS',
            'ID',
            'REF',
            'ALT',
            'QUAL',
            'FILTER',
            'INFO',
            'FORMAT',
          ];
          removeKeys.forEach((key) => {
            columns.splice(columns.indexOf(key), 1);
          });
          // should be each sample ID
          let is_proband = true;
          columns.forEach((column) => {
            let anyMatch = false;
            pedigreeInfos.forEach((pedigreeInfo) => {
              if (pedigreeInfo['ID'] == column) {
                anyMatch = true;
                const paternalID =
                  'Father' in pedigreeInfo &&
                  sampleIds.includes(pedigreeInfo['Father'])
                    ? pedigreeInfo['Father']
                    : -9;
                const maternalID =
                  'Mother' in pedigreeInfo &&
                  sampleIds.includes(pedigreeInfo['Mother'])
                    ? pedigreeInfo['Mother']
                    : -9;
                result += `${defaultFamilyID}\t${column}\t${paternalID}\t${maternalID}\t3\t-9\n`;
              }
            });

            if (is_proband) {
              is_proband = false;
              if (!anyMatch) {
                throw new CustomException(
                  EXCEPTION_CODE.UPLOAD_VCF_PED_ID_NOT_MATCH,
                );
              }
            }
          });
        } else {
          result = null;
        }

        break;
      }
    }
  } catch (e) {
    throw e;
  }

  return anyPedInfo ? result : undefined;
}

export async function getPedForFrontendFromVCF(buffer: Buffer): Promise<any[]> {
  const result: any[] = [];
  const pedigreeInfos = [];
  const sampleIds = [];
  try {
    for await (const line of line$(buffer)) {
      if (line.startsWith('##PEDIGREE')) {
        if (line.includes('=<') && line.endsWith('>')) {
          const pedigreeLine = line.split('=<')[1].replace('>', '');
          const pedigreeMatchs = pedigreeLine.match(/(\w+)=("[^"]+"|[^,]+)/g);
          const eachPedInfo = {};
          pedigreeMatchs.forEach((eachPed) => {
            const pedInfos = eachPed.split('=');
            eachPedInfo[pedInfos[0]] = pedInfos[1];
            sampleIds.push(pedInfos[1]);
          });
          pedigreeInfos.push(eachPedInfo);
        } else {
          throw new CustomException(
            EXCEPTION_CODE.UPLOAD_VCF_PED_FORMAT_INCORRECT,
          );
        }
      } else if (line.startsWith('#CHROM')) {
        const columns = line.split('\t');
        if (columns.includes('FORMAT')) {
          const removeKeys = [
            '#CHROM',
            'POS',
            'ID',
            'REF',
            'ALT',
            'QUAL',
            'FILTER',
            'INFO',
            'FORMAT',
          ];
          removeKeys.forEach((key) => {
            columns.splice(columns.indexOf(key), 1);
          });
          // should be each sample ID
          let is_proband = true;
          columns.forEach((column) => {
            let anyMatch = false;
            pedigreeInfos.forEach((pedigreeInfo) => {
              if (pedigreeInfo['ID'] == column) {
                anyMatch = true;
                const paternalID =
                  'Father' in pedigreeInfo &&
                  sampleIds.includes(pedigreeInfo['Father'])
                    ? pedigreeInfo['Father']
                    : -9;
                const maternalID =
                  'Mother' in pedigreeInfo &&
                  sampleIds.includes(pedigreeInfo['Mother'])
                    ? pedigreeInfo['Mother']
                    : -9;
                result.push({
                  sample_id: column,
                  sex: '',
                  affected: '',
                  mother_id: maternalID,
                  father_id: paternalID,
                });
              }
            });
            if (is_proband) {
              is_proband = false;
            }
            if (!anyMatch && pedigreeInfos?.length > 0) {
              throw new CustomException(
                EXCEPTION_CODE.UPLOAD_VCF_PED_ID_NOT_MATCH,
              );
            } else if (pedigreeInfos?.length == 0) {
              result.push({
                sample_id: column,
                sex: '',
                affected: '',
                mother_id: '',
                father_id: '',
              });
            }
          });
        }

        break;
      }
    }
  } catch (e) {
    throw e;
  }

  return result;
}

export async function getVCFHeader(buffer: Buffer): Promise<string> {
  let result = '';
  try {
    for await (const line of line$(buffer)) {
      if (line.startsWith('#')) {
        result += line + '\n';
        if (line.startsWith('#CHROM')) {
          break;
        }
      }
    }
  } catch (e) {
    throw e;
  }

  return result;
}

export function getBucketNameFromS3Path(s3path: string): string {
  return s3path.replace('s3://', '').split('/')[0];
}

export function getKeyFromS3Path(s3path: string): string {
  const tempresult = s3path.replace('s3://', '').split('/');
  tempresult.shift();
  return tempresult.join('/');
}

export function getFileNameFromS3Path(s3path: string): string {
  return s3path.replace('s3://', '').split('/').pop();
}

export function getCallerFromS3Path(s3path: string): string {
  const tempFilenames = s3path.replace('s3://', '').split('/').pop().split('.');
  return tempFilenames[tempFilenames.length - 3];
}
