import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VersionsDocument = HydratedDocument<Versions>;
export const VERSIONS_MODEL_NAME = 'Versions';

@Schema({ collection: 'versions' })
export class Versions {
  @Prop()
  _id: string;

  @Prop()
  gene_database_version: string;

  @Prop()
  ensembl_version: string;

  @Prop()
  phi_version: string;

  @Prop()
  clingen_version: string;
}

export const VersionsSchema = SchemaFactory.createForClass(Versions);
