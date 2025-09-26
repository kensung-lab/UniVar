import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as z from 'zod';

export type ProjectsDocument = HydratedDocument<Projects>;
export const PROJECT_MODEL_NAME = 'Projects';

export interface ProjectSamples {
  note: string;
  database_name: string;
  display_name: string;
}

export const SampleStatus = z.enum(['todos', 'wips', 'verifying', 'done']);

@Schema({ collection: 'projects' })
export class Projects {
  @Prop({ index: true, unique: true })
  name: string;

  @Prop()
  todos: ProjectSamples[];

  @Prop()
  wips: ProjectSamples[];

  @Prop()
  verifying: ProjectSamples[];

  @Prop()
  done: ProjectSamples[];

  @Prop()
  create_user: string;

  @Prop()
  access_group: string[];

  @Prop({ index: true })
  creation_date: Date;

  @Prop()
  __v?: number;

  constructor(project: Projects) {
    this.name = project.name;
    this.create_user = project.create_user;
    this.access_group = project.access_group;
    this.creation_date = project.creation_date;

    this.todos = project.todos;
    this.wips = project.wips;
    this.verifying = project.verifying;
    this.done = project.done;
    this.__v = project.__v;
  }
}

export const ProjectsSchema = SchemaFactory.createForClass(Projects);
