import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VariantExonsDocument = HydratedDocument<VariantExons>;
export const VARIANT_EXONS_MODEL_NAME = 'VariantExons';

@Schema({ collection: 'variant_exons' })
export class VariantExons {
  @Prop()
  variant_id: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  exons: any[];
}

export const VariantExonsSchema = SchemaFactory.createForClass(VariantExons);
