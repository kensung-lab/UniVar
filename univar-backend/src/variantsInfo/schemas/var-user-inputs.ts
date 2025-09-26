import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Variants } from './variants';

export type VarUserInputsDocument = HydratedDocument<VarUserInputs>;
export const VAR_USER_INPUTS_MODEL_NAME = 'VarUserInputs';

@Schema({ collection: 'varuserinputs' })
export class VarUserInputs {
  @Prop()
  chrom: string;

  @Prop()
  start: number;

  @Prop()
  alt: string;

  @Prop()
  variant_type: string;

  @Prop()
  sv_id: string;

  @Prop()
  source: string;

  @Prop()
  is_read: string[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  note: any[];

  // for reference
  @Prop(mongoose.Schema.Types.ObjectId)
  variant_object_id: string;

  constructor(variant: Variants) {
    this.chrom = variant.chrom;
    this.start = variant.start;
    this.alt = variant.alt;
    this.variant_type = variant.variant_type;
    this.source = variant.caller;
    this.sv_id = variant.sv_id;
    this.variant_object_id = (<any>variant)._id;
    this.note = variant.note;
    this.is_read = variant.is_read;
  }
}

export const VarUserInputsSchema = SchemaFactory.createForClass(VarUserInputs);
