import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GenePanelVersionsDocument = HydratedDocument<GenePanelVersions>;
export const GENE_PANEL_VERSION_MODEL_NAME = 'GenePanelVersions';

@Schema({ collection: 'genepanelversions' })
export class GenePanelVersions {
  @Prop()
  version: string;

  @Prop()
  clingen: string;

  @Prop()
  panel_au: string;

  @Prop()
  panel_uk: string;

  @Prop()
  s_team: string;

  @Prop()
  create_date: Date;
}

export const GenePanelVersionsSchema =
  SchemaFactory.createForClass(GenePanelVersions);
