import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SamplesDocument = HydratedDocument<Samples>;
export const SAMPLE_MODEL_NAME = 'Samples';

@Schema({ collection: 'samples' })
export class Samples {
  @Prop()
  sample_id: number;

  @Prop()
  family_id: string;

  @Prop()
  display_family_id: string;

  @Prop()
  name: string;

  @Prop()
  display_name: string;

  @Prop()
  paternal_id: string;

  @Prop()
  display_paternal_id: string;

  @Prop()
  maternal_id: string;

  @Prop()
  display_maternal_id: string;

  @Prop()
  sex: number;

  @Prop()
  phenotype: string;
}

export const SamplesSchema = SchemaFactory.createForClass(Samples);
