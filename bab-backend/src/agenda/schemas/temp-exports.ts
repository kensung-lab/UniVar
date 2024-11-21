import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { WAIT_STATUS } from 'src/common';

export type TempExportsDocument = HydratedDocument<TempExports>;
export const TEMP_EXPORTS_MODEL_NAME = 'TempExports';

@Schema({ collection: process.env.MONGO_EXPORT_COLLECTION_NAME })
export class TempExports {
  @Prop()
  filetype: string;

  @Prop()
  track_number: string;

  @Prop()
  creation_date: Date;

  @Prop()
  status: string;

  constructor(filetype: string, track_number: string) {
    this.filetype = filetype;
    this.track_number = track_number;
    this.creation_date = new Date();
    this.status = WAIT_STATUS;
  }
}

export const TempExportsSchema = SchemaFactory.createForClass(TempExports);
