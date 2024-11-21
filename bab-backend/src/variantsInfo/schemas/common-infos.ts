import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommonInfosDocument = HydratedDocument<CommonInfos>;
export const COMMON_INFO_MODEL_NAME = 'Commoninfo';

@Schema({ collection: 'commoninfo' })
export class CommonInfos {
  @Prop()
  type: string;

  @Prop()
  vcf_header?: string;

  @Prop()
  version?: string;

  @Prop()
  hpo?: string[];

  @Prop()
  pipeline?: string;

  @Prop()
  brand?: string;
}

export const CommonInfosSchema = SchemaFactory.createForClass(CommonInfos);
