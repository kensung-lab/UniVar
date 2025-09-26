import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ExomiserInfoDocument = HydratedDocument<ExomiserInfo>;
export const EXOMISER_INFO_MODEL_NAME = 'ExomiserInfo';

@Schema({ collection: 'exomiser_info' })
export class ExomiserInfo {
  @Prop()
  complete_num: number;

  @Prop()
  run: string;

  @Prop()
  display_name: string;

  @Prop()
  is_ready: boolean;

  @Prop()
  create_time: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  complete_infos: any[];

  @Prop()
  hpos: string[];

  @Prop()
  hpoDisplays?: string[];

  @Prop()
  is_example: boolean;
}

export const ExomiserInfoSchema = SchemaFactory.createForClass(ExomiserInfo);
