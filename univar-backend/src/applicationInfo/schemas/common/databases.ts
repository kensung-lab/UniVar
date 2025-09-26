import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type DatabasesDocument = HydratedDocument<Databases>;
export const DATABASE_MODEL_NAME = 'Databases';

export class ToolCompleteInfos {
  tool_name: string;
  tool_version: string;
  completed_time: Date;
  spent_time: number;
  source?: string;
}

@Schema({ collection: 'databases' })
export class Databases {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  samples: any;

  @Prop()
  access_group: string[];

  @Prop()
  database_name: string;

  @Prop()
  display_name: string;

  @Prop()
  is_ready: boolean;

  @Prop()
  create_time: Date;

  @Prop()
  modify_time: Date;

  @Prop()
  proband_id: string;

  @Prop()
  email: string;

  @Prop()
  complete_num: number;

  @Prop()
  brand?: string;

  @Prop()
  vcf_header?: string;

  @Prop()
  pedLocation?: string[];

  @Prop()
  hpoLocation?: string[];

  @Prop()
  svVcfLocation?: string[];

  @Prop()
  snpVcfLocation?: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  cramLocation?: any[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  pedigree: any[];

  @Prop()
  hpos?: string[];

  @Prop()
  hpoDisplays?: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  tool_complete_infos: ToolCompleteInfos[];

  @Prop()
  is_error: boolean;
}

export const DatabasesSchema = SchemaFactory.createForClass(Databases);
