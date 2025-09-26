import { Samples } from 'src/variantsInfo';

const GENDER_MAP = new Map([
  ['1', 'M'],
  ['2', 'F'],
  ['M', 'M'],
  ['F', 'F'],
]);

export class Sample {
  i: number;

  name: string;

  sample_id: number;

  active: boolean;

  bam: string;

  family_id: string;

  father_id: string;

  group: string;

  mother_id: string;

  phenotype: string;

  sex: string;

  constructor(sample: Samples, index: number) {
    this.i = index;
    this.name = sample.display_name ? sample.display_name : sample.name;
    this.sample_id = sample.sample_id;
    this.family_id = sample.display_family_id
      ? sample.display_family_id
      : sample.family_id;
    this.mother_id = sample.display_maternal_id
      ? sample.display_maternal_id
      : sample.maternal_id;
    this.father_id = sample.display_paternal_id
      ? sample.display_paternal_id
      : sample.paternal_id;
    if (sample.sex && GENDER_MAP.has(sample.sex + '')) {
      this.sex = GENDER_MAP.get(sample.sex + '');
    } else {
      this.sex = 'U';
    }
    this.phenotype = sample.phenotype;
    this.group = sample.phenotype == '2' ? 'affected' : 'not_affected';
    this.active = true;
  }
}
