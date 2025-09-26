import { Injectable } from '@nestjs/common';
import {
  BaseRequest,
  COMMON_DATABASE,
  ProjectData,
  EditSmapleStatusRequest,
  EditNoteRequest,
  UserInfo,
  CustomException,
  EXCEPTION_CODE,
  GetOneProjectRequest,
  ProjectListData,
  getDatabaseFilter,
  DelDbRequest,
  GetDbStatusRequest,
  ChangeOneDbStatusRequest,
} from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import {
  PROJECT_MODEL_NAME,
  Projects,
  SampleStatus,
  ProjectSamples,
} from 'src/applicationInfo/schemas';
import * as z from 'zod';
import { DatabaseService } from './database.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(PROJECT_MODEL_NAME, COMMON_DATABASE)
    private Project: Model<Projects>,
    private readonly loggingHelperService: LoggingHelperService,
    private readonly databaseService: DatabaseService,
  ) {}

  async listProject(baseRequest: BaseRequest, userInfo: UserInfo) {
    const filters: any = {};
    getDatabaseFilter(userInfo, filters);
    // ^^^^^^^^ the function supposed to apply to databases, not projects
    // so need to delete is_ready
    delete filters.is_ready;

    const result = await this.loggingHelperService.performanceLogAndFindMongo(
      this.Project,
      filters,
      { creation_date: -1 },
      null,
      null,
      {},
      userInfo.preferred_username,
      baseRequest.track_number,
      'list_all_projects',
      COMMON_DATABASE,
    );

    return result.map((project) => new ProjectListData(project));
  }

  async getOneProject(
    getOneProjectRequest: GetOneProjectRequest,
    userInfo: UserInfo,
  ) {
    const { project_id, track_number } = getOneProjectRequest;

    const result = await this.getAccessibleProject({
      track_number,
      project_id,
      userInfo,
    });

    // filter out samples with access group
    await this.filterAccessibleSamples(track_number, userInfo, result);

    return new ProjectData(result);
  }

  async editDbStatus(projectRequest: EditSmapleStatusRequest, userInfo) {
    const { project_id, track_number } = projectRequest;
    let updatedProject = null;
    let updatedRes = null;

    const projectResult = await this.getAccessibleProject({
      track_number,
      project_id,
      userInfo,
    });

    const session = await this.Project.startSession();
    try {
      session.startTransaction();
      const originalProject = new Projects(projectResult);

      // check version
      if (projectRequest.__v !== projectResult.__v) {
        throw new Error('UPDATE_OUTDATED_DOCUMENT');
      }

      // check if db exists also construct the array
      const existingDbInProject = {};
      const updatedDbStatus: Record<
        z.infer<typeof SampleStatus>,
        ProjectSamples[]
      > = {
        todos: [],
        wips: [],
        verifying: [],
        done: [],
      };
      const notAccessibleDb: Record<
        z.infer<typeof SampleStatus>,
        ProjectSamples[]
      > = {
        todos: [],
        wips: [],
        verifying: [],
        done: [],
      };

      const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);
      SampleStatus.options.map((s) => {
        // map existing sample in project
        projectResult[s].map((e) => {
          existingDbInProject[e.database_name] = e;
          if (!accessibleDbs.includes(e.database_name)) {
            notAccessibleDb[s].push(e);
          }
        });
      });

      const editedSamples = {};
      SampleStatus.options.map((s) => {
        // add samples to updatedDbStatus by the order of the request
        projectRequest[s].map((sampleName) => {
          const sampleMeta = existingDbInProject[sampleName];
          if (!sampleMeta) {
            throw new Error('SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT');
          }
          if (editedSamples[sampleName]) {
            throw new Error('DUPLICATED_SAMPLES_IN_PROJECT');
          }
          updatedDbStatus[s].push(sampleMeta);
          editedSamples[sampleName] = 1;
        });
      });

      projectResult.todos = updatedDbStatus.todos.concat(notAccessibleDb.todos);
      projectResult.wips = updatedDbStatus.wips.concat(notAccessibleDb.wips);
      projectResult.verifying = updatedDbStatus.verifying.concat(
        notAccessibleDb.verifying,
      );
      projectResult.done = updatedDbStatus.done.concat(notAccessibleDb.done);

      updatedProject = new Projects(projectResult);

      updatedRes = await this.loggingHelperService.performanceLogAndSaveMongo(
        projectResult,
        userInfo.preferred_username,
        track_number,
        'edit_sample_status',
        COMMON_DATABASE,
        PROJECT_MODEL_NAME,
        updatedProject,
        originalProject,
      );

      await this.filterAccessibleSamples(track_number, userInfo, updatedRes);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.handleUpdateSamplesError(error as Error);
    } finally {
      session.endSession();
    }

    return updatedRes;
  }

  async editDbNote(editNoteReq: EditNoteRequest, userInfo) {
    const { project_id, track_number } = editNoteReq;
    let updatedProject = null;
    let updatedRes = null;

    const projectResult = await this.getAccessibleProject({
      track_number,
      project_id,
      userInfo,
    });

    const session = await this.Project.startSession();
    try {
      session.startTransaction();

      const originalProject = new Projects(projectResult);

      // check version
      if (editNoteReq.__v !== projectResult.__v) {
        throw new Error('UPDATE_OUTDATED_DOCUMENT');
      }

      // update sample note
      const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);
      let updated = false;
      exit_loops: for (const s of SampleStatus.options) {
        for (const sample of projectResult[s]) {
          if (sample.database_name === editNoteReq.database_name) {
            if (!accessibleDbs.includes(sample.database_name))
              throw new Error('SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT');
            sample.note = editNoteReq.note;
            projectResult.markModified(s);
            updated = true;
            break exit_loops;
          }
        }
      }

      if (!updated)
        throw new Error('SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT');

      updatedProject = new Projects(projectResult);

      updatedRes = await this.loggingHelperService.performanceLogAndSaveMongo(
        projectResult,
        userInfo.preferred_username,
        track_number,
        'edit_sample_note_in_project',
        COMMON_DATABASE,
        PROJECT_MODEL_NAME,
        updatedProject,
        originalProject,
      );

      await this.filterAccessibleSamples(track_number, userInfo, updatedRes);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.handleUpdateSamplesError(error as Error);
    } finally {
      session.endSession();
    }

    return updatedRes;
  }

  async getNotAddedDb(projectRequest: GetOneProjectRequest, userInfo) {
    const { project_id, track_number } = projectRequest;

    const project = await this.getAccessibleProject({
      track_number,
      project_id,
      userInfo,
    });
    const { todos, wips, verifying, done } = project;

    const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);

    return accessibleDbs.filter(
      (e) =>
        !todos
          .concat(wips)
          .concat(verifying)
          .concat(done)
          .map((db) => db.database_name)
          .includes(e),
    );
  }

  async delDb(addSmaplesReq: DelDbRequest, userInfo) {
    const { project_id, track_number, databases } = addSmaplesReq;
    let updatedProject = null;
    let updatedRes = null;
    const projectResult = await this.getAccessibleProject({
      track_number,
      userInfo,
      project_id,
    });
    const { todos, wips, verifying, done } = projectResult;

    // check version
    if (addSmaplesReq.__v !== projectResult.__v) {
      throw new CustomException(EXCEPTION_CODE.UPDATE_OUTDATED_DOCUMENT);
    }

    // check if samples accessible
    const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);
    for (const db of databases) {
      if (!accessibleDbs.includes(db)) {
        throw new CustomException(
          EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
        );
      }
    }

    // check if samples already in project
    const dbOverlap = todos
      .concat(wips)
      .concat(verifying)
      .concat(done)
      .map((db) => db.database_name)
      .filter((dbName) => databases.includes(dbName));

    if (dbOverlap.length <= 0)
      throw new CustomException(EXCEPTION_CODE.DATABSE_NOT_EXISTS);

    const session = await this.Project.startSession();
    try {
      session.startTransaction();

      const originalProject = new Projects(projectResult);

      // delete db
      SampleStatus.options.map((sampleStatus) => {
        projectResult[sampleStatus] = projectResult[sampleStatus].filter(
          (e) => !databases.includes(e.database_name),
        );
      });

      updatedProject = new Projects(projectResult);

      updatedRes = await this.loggingHelperService.performanceLogAndSaveMongo(
        projectResult,
        userInfo.preferred_username,
        addSmaplesReq.track_number,
        'remove_samples_to_project',
        COMMON_DATABASE,
        PROJECT_MODEL_NAME,
        updatedProject,
        originalProject,
      );

      await this.filterAccessibleSamples(track_number, userInfo, updatedRes);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.handleUpdateSamplesError(error as Error);
    } finally {
      session.endSession();
    }

    return updatedRes;
  }

  async addDb(addSmaplesReq: EditSmapleStatusRequest, userInfo) {
    const { project_id, track_number } = addSmaplesReq;
    let updatedProject = null;
    let updatedRes = null;
    const projectResult = await this.getAccessibleProject({
      track_number,
      userInfo,
      project_id,
    });
    const { todos, wips, verifying, done } = projectResult;

    // check version
    if (addSmaplesReq.__v !== projectResult.__v) {
      throw new CustomException(EXCEPTION_CODE.UPDATE_OUTDATED_DOCUMENT);
    }

    const allDbInReq = addSmaplesReq.todos
      .concat(addSmaplesReq.wips)
      .concat(addSmaplesReq.verifying)
      .concat(addSmaplesReq.done);

    // check if samples accessible
    const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);
    for (const db of allDbInReq) {
      if (!accessibleDbs.includes(db)) {
        throw new CustomException(
          EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
        );
      }
    }

    // check if samples already in project
    const dbOverlap = todos
      .concat(wips)
      .concat(verifying)
      .concat(done)
      .map((db) => db.database_name)
      .filter((dbName) => allDbInReq.includes(dbName));

    if (dbOverlap.length > 0)
      throw new CustomException(EXCEPTION_CODE.DATABSE_ALREADY_EXISTS);

    const session = await this.Project.startSession();
    try {
      session.startTransaction();

      const originalProject = new Projects(projectResult);

      // find db display_name
      const dbs = await this.databaseService.findDatabaseList(
        track_number,
        userInfo,
        // { database_name: JSON.stringify({ $in: [...databases] }) },
      );
      // add db
      SampleStatus.options.map((stats) => {
        projectResult[stats].push(
          ...dbs
            .filter((e) => addSmaplesReq[stats].includes(e.database_name))
            .map((e) => ({
              database_name: e.database_name,
              display_name: e.display_name,
              note: '',
            })),
        );
      });

      updatedProject = new Projects(projectResult);

      updatedRes = await this.loggingHelperService.performanceLogAndSaveMongo(
        projectResult,
        userInfo.preferred_username,
        addSmaplesReq.track_number,
        'add_samples_to_project',
        COMMON_DATABASE,
        PROJECT_MODEL_NAME,
        updatedProject,
        originalProject,
      );

      await this.filterAccessibleSamples(track_number, userInfo, updatedRes);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.handleUpdateSamplesError(error as Error);
    } finally {
      session.endSession();
    }

    return updatedRes;
  }

  async getDbStatus(
    getDbStatusRequest: GetDbStatusRequest,
    userInfo: UserInfo,
  ) {
    const { project_id, database, track_number } = getDbStatusRequest;

    const project = await this.getAccessibleProject({
      track_number,
      project_id,
      userInfo,
    });

    // filter out samples with access group
    await this.filterAccessibleSamples(track_number, userInfo, project);

    let status = '';

    SampleStatus.options.map((s) => {
      const db = project[s].find((db) => db.database_name === database);
      if (db) status = s;
    });

    if (status === '') {
      const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);
      if (!accessibleDbs.includes(database)) {
        throw new CustomException(EXCEPTION_CODE.DATABSE_NOT_EXISTS);
      }
    }

    return {
      database,
      status,
      __v: project.__v,
    };
  }

  async changeOneDbStatus(
    changeOneDbStatusRequest: ChangeOneDbStatusRequest,
    userInfo,
  ) {
    const { project_id, track_number, database, status } =
      changeOneDbStatusRequest;
    let updatedRes = null;
    const projectResult = await this.getAccessibleProject({
      track_number,
      userInfo,
      project_id,
    });

    // check if status valid
    if (!SampleStatus.options.includes(status as any) && status !== '')
      throw new CustomException(EXCEPTION_CODE.NOT_VALID_DB_STATUS);

    // check version
    if (changeOneDbStatusRequest.__v !== projectResult.__v) {
      throw new CustomException(EXCEPTION_CODE.UPDATE_OUTDATED_DOCUMENT);
    }

    // check if samples accessible
    const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);
    if (!accessibleDbs.includes(database)) {
      throw new CustomException(
        EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST,
      );
    }

    // check if samples already in project and change status
    const originalProject = new Projects(projectResult);
    let foundDb;
    SampleStatus.options.map((s) => {
      const dbIdx = projectResult[s].findIndex(
        (e) => e.database_name === database,
      );
      if (dbIdx > -1) {
        // have db in project -> remove / change
        foundDb = projectResult[s].splice(dbIdx, 1);
        if (status !== '') {
          projectResult[status].push(foundDb[0]);
        }
      }
    });
    if (!foundDb) {
      if (status !== '') {
        // add db to project
        projectResult[status].push({
          database_name: database,
          display_name: database,
          note: '',
        });
      } else {
        throw new CustomException(EXCEPTION_CODE.DATABSE_NOT_EXISTS);
      }
    }
    const updatedProject = new Projects(projectResult);

    const session = await this.Project.startSession();
    try {
      session.startTransaction();

      updatedRes = await this.loggingHelperService.performanceLogAndSaveMongo(
        projectResult,
        userInfo.preferred_username,
        changeOneDbStatusRequest.track_number,
        'change_db_status_in_project',
        COMMON_DATABASE,
        PROJECT_MODEL_NAME,
        updatedProject,
        originalProject,
      );

      await this.filterAccessibleSamples(track_number, userInfo, updatedRes);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      this.handleUpdateSamplesError(error as Error);
    } finally {
      session.endSession();
    }

    return updatedRes;
  }

  private handleUpdateSamplesError(error: Error) {
    if (error.message === 'UPDATE_OUTDATED_DOCUMENT') {
      throw new CustomException(EXCEPTION_CODE.UPDATE_OUTDATED_DOCUMENT);
    } else if (
      error.message === 'SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT'
    ) {
      throw new CustomException(
        EXCEPTION_CODE.SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT,
      );
    } else if (error.message === 'SELECTED_PROJECT_DOES_NOT_EXIST') {
      throw new CustomException(EXCEPTION_CODE.SELECTED_PROJECT_DOES_NOT_EXIST);
    } else if (error.message === 'DUPLICATED_SAMPLES_IN_PROJECT') {
      throw new CustomException(EXCEPTION_CODE.DUPLICATED_SAMPLES_IN_PROJECT);
    }
  }

  private async getAccessibleDbs(track_number, userInfo) {
    return (
      await this.databaseService.findDatabaseList(track_number, userInfo)
    ).map((e) => e.database_name);
  }

  private async filterAccessibleSamples(
    track_number,
    userInfo,
    targetResult: any,
  ) {
    const accessibleDbs = await this.getAccessibleDbs(track_number, userInfo);

    SampleStatus.options.map((statusArr) => {
      targetResult[statusArr] = targetResult[statusArr].filter((e) =>
        accessibleDbs.includes(e.database_name),
      );
    });
  }

  private async getAccessibleProject(props: {
    track_number: string;
    userInfo: any;
    project_id: string;
  }) {
    const { track_number, userInfo, project_id } = props;

    if (!isValidObjectId(project_id)) {
      throw new CustomException(EXCEPTION_CODE.SELECTED_PROJECT_DOES_NOT_EXIST);
    }

    const filters: any = { _id: project_id };
    getDatabaseFilter(userInfo, filters);
    delete filters.is_ready;

    const result =
      await this.loggingHelperService.performanceLogAndFindOneMongo(
        this.Project,
        filters,
        {},
        userInfo.preferred_username,
        track_number,
        'get_one_project',
        COMMON_DATABASE,
      );

    if (!result) {
      throw new CustomException(EXCEPTION_CODE.SELECTED_PROJECT_DOES_NOT_EXIST);
    }

    return result;
  }
}
