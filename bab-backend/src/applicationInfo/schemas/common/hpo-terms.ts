import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';

export type HPOTermsDocument = HydratedDocument<HPOTerms>;
export const HPO_TERMS_MODEL_NAME = 'HPOTerms';

@Schema({ collection: 'hpoterms' })
export class HPOTerms {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

  @Prop()
  version: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  hpos: UniVarDisplayHPOTerm[];
}

export interface UniVarDisplayHPOTerm {
  label: string;
  value: string;
  lazy: boolean;
  children?: UniVarDisplayHPOTerm[];
}

export const HPOTermsSchema = SchemaFactory.createForClass(HPOTerms);
