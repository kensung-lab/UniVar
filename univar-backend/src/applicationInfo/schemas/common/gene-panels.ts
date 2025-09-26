import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';

export type GenePanelsDocument = HydratedDocument<GenePanels>;
export const GENE_PANEL_MODEL_NAME = 'GenePanels';

@Schema({ collection: 'genepanels' })
export class GenePanels {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

  @Prop()
  gp_id: string;

  @Prop()
  display_name: string;

  @Prop()
  version: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  genes: any[];

  @Prop()
  source: string;

  @Prop()
  hpos?: string[];
}

export const GenePanelsSchema = SchemaFactory.createForClass(GenePanels);
