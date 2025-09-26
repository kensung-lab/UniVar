import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PipelineDocument = HydratedDocument<PipelineVersion>;
export const PIPELINE_MODEL_NAME = 'PipelineVersion';

@Schema({ collection: 'pipelineversion' })
export class PipelineVersion {
  @Prop()
  version: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  small_variant: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  structural_variant: any;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  univar_gene_version: any;

  @Prop()
  brand?: string;
}

export const PipelineVersionSchema =
  SchemaFactory.createForClass(PipelineVersion);
