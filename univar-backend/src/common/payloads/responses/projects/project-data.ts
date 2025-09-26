import { Projects, ProjectSamples } from 'src/applicationInfo';

export class ProjectData {
  _id?: string;

  name?: string;

  todos?: ProjectSamples[];

  wips: ProjectSamples[];

  verifying: ProjectSamples[];

  done: ProjectSamples[];

  __v?: number;

  constructor(projects: Projects) {
    this._id = (<any>projects)._id.toString();

    this.name = projects.name;

    this.todos = projects.todos;

    this.wips = projects.wips;

    this.verifying = projects.verifying;

    this.done = projects.done;

    this.__v = (<any>projects).__v;
  }
}

export class ProjectListData {
  _id?: string;

  name?: string;

  todos?: number;

  wips: number;

  verifying: number;

  done: number;

  __v?: number;

  constructor(projects: Projects) {
    this._id = (<any>projects)._id.toString();

    this.name = projects.name;

    this.todos = projects.todos.length;

    this.wips = projects.wips.length;

    this.verifying = projects.verifying.length;

    this.done = projects.done.length;

    this.__v = (<any>projects).__v;
  }
}
