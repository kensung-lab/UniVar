import { ProjectService, Projects } from 'src/applicationInfo';
import {
  B_TEAM_USERINFO,
  S_TEAM_USERINFO,
  mockDatabaseService,
  mockLoggingHelperService,
  mockModel,
} from '../../../mock';
import {
  BaseRequest,
  ChangeOneDbStatusRequest,
  CustomException,
  DelDbRequest,
  EditNoteRequest,
  EditSmapleStatusRequest,
  GetDbStatusRequest,
  GetOneProjectRequest,
} from 'src/common';
import { ObjectId } from 'mongodb';

describe('ProjectService', () => {
  let service;

  beforeEach(() => {
    service = new ProjectService(
      mockModel as any,
      mockLoggingHelperService,
      mockDatabaseService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('instance should be an instanceof ProjectService', () => {
    expect(service instanceof ProjectService).toBeTruthy();
  });

  it('should have a method listProject()', async () => {
    const baseRequest: BaseRequest = { track_number: '123214' };
    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 1110,
    } as any;

    mockLoggingHelperService.performanceLogAndFindMongo = jest
      .fn()
      .mockResolvedValue([project]);
    await service.listProject(baseRequest, B_TEAM_USERINFO);
  });

  it('should have a method getOneProject()', async () => {
    const getOneProjectRequest: GetOneProjectRequest = {
      project_id: '653b5f900deb2a0772dc256b',
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 1110,
    } as any;

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);
    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      { database_name: 'testing' },
    ]);

    await service.getOneProject(getOneProjectRequest, S_TEAM_USERINFO);
  });

  it('should have a method editDbStatus()', async () => {
    const projectRequest: EditSmapleStatusRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
      todos: [],
      wips: [],
      verifying: ['family_duo_20230206-180313'],
      done: [],
      __v: 8,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);
    await service.editDbStatus(projectRequest, B_TEAM_USERINFO);
  });

  it('should have a method editDbStatus() with UPDATE_OUTDATED_DOCUMENT error', async () => {
    const projectRequest: EditSmapleStatusRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
      todos: [],
      wips: [],
      verifying: ['family_duo_20230206-180313'],
      done: [],
      __v: 0,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);
    await expect(
      service.editDbStatus(projectRequest, B_TEAM_USERINFO),
    ).rejects.toThrow(CustomException);
  });

  it('should have a method editDbStatus()', async () => {
    const projectRequest: EditSmapleStatusRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
      todos: [],
      wips: [],
      verifying: ['family_duo_20230206-180313'],
      done: [],
      __v: 8,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);
    await service.editDbStatus(projectRequest, B_TEAM_USERINFO);
  });

  it('should have a method editDbNote()', async () => {
    const req: EditNoteRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
      database_name: 'family_trio_20221122-152351-1',
      note: 'hihi, this sample is done',
      __v: 8,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);
    await service.editDbNote(req, B_TEAM_USERINFO);
  });

  it('should have a method getNotAddedDb()', async () => {
    const projectRequest: GetOneProjectRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);

    await service.getNotAddedDb(projectRequest, S_TEAM_USERINFO);
  });

  it('should have a method delDb()', async () => {
    const addSmaplesReq: DelDbRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
      databases: [
        'family_trio_20221122-152351-1',
        'family_trio_20221122-152351',
      ],
      __v: 8,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);

    await service.delDb(addSmaplesReq, B_TEAM_USERINFO);
  });

  it('should have a method addDb()', async () => {
    const addSmaplesReq: EditSmapleStatusRequest = {
      track_number: 'aws_1234_hihi_1919',
      project_id: '653b5f900deb2a0772dc256b',
      todos: [],
      wips: [],
      verifying: [],
      done: ['family_trio_20220721-123250-2'],
      __v: 8,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_trio_20220721-123250-2',
        display_name: 'family_trio_20220721-123250-2',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);

    await service.addDb(addSmaplesReq, B_TEAM_USERINFO);
  });

  it('should have a method getDbStatus()', async () => {
    const getDbStatusRequest: GetDbStatusRequest = {
      track_number: '12315467ufdas',
      project_id: '653b5f900deb2a0772dc256b',
      database: 'family_trio_20220721-123250-1',
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_trio_20220721-123250-2',
        display_name: 'family_trio_20220721-123250-2',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);

    await service.getDbStatus(getDbStatusRequest, S_TEAM_USERINFO);
  });

  it('should have a method changeOneDbStatus()', async () => {
    const changeOneDbStatusRequest: ChangeOneDbStatusRequest = {
      track_number: '1dsagfdasgh34r',
      project_id: '653b5f900deb2a0772dc256b',
      database: 'family_trio_20220721-123250-1',
      status: 'done',
      __v: 8,
    };

    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_trio_20220721-123250-2',
        display_name: 'family_trio_20220721-123250-2',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);

    await service.changeOneDbStatus(changeOneDbStatusRequest, S_TEAM_USERINFO);
  });

  it('should have a method handleUpdateSamplesError() with UPDATE_OUTDATED_DOCUMENT', () => {
    expect(() => {
      service.handleUpdateSamplesError(new Error('UPDATE_OUTDATED_DOCUMENT'));
    }).toThrow(CustomException);
  });

  it('should have a method handleUpdateSamplesError() with SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT', () => {
    expect(() => {
      service.handleUpdateSamplesError(
        new Error('SELECTED_DATABASE_DOES_NOT_EXIST_IN_PROJECT'),
      );
    }).toThrow(CustomException);
  });

  it('should have a method handleUpdateSamplesError() with SELECTED_PROJECT_DOES_NOT_EXIST', () => {
    expect(() => {
      service.handleUpdateSamplesError(
        new Error('SELECTED_PROJECT_DOES_NOT_EXIST'),
      );
    }).toThrow(CustomException);
  });

  it('should have a method handleUpdateSamplesError() with DUPLICATED_SAMPLES_IN_PROJECT', () => {
    expect(() => {
      service.handleUpdateSamplesError(
        new Error('DUPLICATED_SAMPLES_IN_PROJECT'),
      );
    }).toThrow(CustomException);
  });

  it('should have a method getAccessibleDbs()', async () => {
    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_trio_20220721-123250-2',
        display_name: 'family_trio_20220721-123250-2',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);
    await service.getAccessibleDbs('123', S_TEAM_USERINFO);
  });

  it('should have a method filterAccessibleSamples()', async () => {
    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    await service.filterAccessibleSamples('1232145', B_TEAM_USERINFO, project);
  });

  it('should have a method getAccessibleProject()', async () => {
    const project: Projects = {
      _id: new ObjectId('653b5f900deb2a0772dc256b'),
      name: 'project-seed',
      todos: [
        {
          database_name: 'family_trio_20221122-152351-1',
          display_name: 'family_trio_20221122-152351-1',
          note: 'Will do analysing by Sam later',
        },
        {
          database_name: 'family_trio_20230927-y3rtcOi',
          display_name: 'family_trio_20230927-y3rtcOi',
          note: '',
        },
        {
          database_name: 'family_trio_20220721-123250',
          display_name: 'family_trio_20220721-123250',
          note: '',
        },
        {
          database_name: 'family_trio_20230105-110345-1',
          display_name: 'family_trio_20230105-110345-1',
          note: '',
        },
        {
          database_name: 'family_solo_20220429-182327-1',
          display_name: 'family_solo_20220429-182327-1',
          note: '',
        },
        {
          database_name: 'family_solo_20221114-123803',
          display_name: 'family_solo_20221114-123803',
          note: 'currently verifying this sample by KEN IP',
        },
      ],
      wips: [
        {
          database_name: 'family_solo_20230522-01d86f8b-1',
          display_name: 'family_solo_20230522-01d86f8b-1',
          note: 'working by kingsley',
        },
        {
          database_name: 'family_trio_20230404-eba379f9-1',
          display_name: 'family_trio_20230404-eba379f9-1',
          note: 'Joshua working on this.',
        },
        {
          database_name: 'family_trio_20220721-123250-1',
          display_name: 'family_trio_20220721-123250-1',
          note: 'Ken is doing on that.',
        },
        {
          database_name: 'family_solo_20230522-01d86f8b',
          display_name: 'family_solo_20230522-01d86f8b',
          note: 'Wilson said this sample is important.',
        },
        {
          database_name: 'family_trio_20221122-152355-1',
          display_name: 'family_trio_20221122-152355-1',
          note: '',
        },
      ],
      verifying: [
        {
          database_name: 'family_trio_20221122-152351',
          display_name: 'family_trio_20221122-152351',
          note: 'This is example note of a sample in dashboard, displaying some of the key note to let user know what this sample doing. User can also search the samples in dashboard by string. If user search keyword',
        },
        {
          database_name: 'family_duo_20230206-180313-1',
          display_name: 'family_duo_20230206-180313-1',
          note: '',
        },
        {
          database_name: 'family_trio_20230404-eba379f9',
          display_name: 'family_trio_20230404-eba379f9',
          note: '',
        },
      ],
      done: [
        {
          database_name: 'family_duo_20230206-180313',
          display_name: 'family_duo_20230206-180313',
          note: 'QQQ ABCDE THIS SAMPLES',
        },
        {
          database_name: 'family_trio_20230105-110345',
          display_name: 'family_trio_20230105-110345',
          note: 'Closed by Ken IP',
        },
        {
          database_name: 'family_trio_20230105-152056',
          display_name: 'family_trio_20230105-152056',
          note: 'closed by Dr.Lo',
        },
      ],
      create_user: 'wilson',
      access_group: ['steam'],
      creation_date: new Date(),
      __v: 8,
    } as any;

    (<any>mockDatabaseService.findDatabaseList).mockResolvedValue([
      {
        database_name: 'family_duo_20230206-180313',
        display_name: 'family_duo_20230206-180313',
      },
      {
        database_name: 'family_trio_20220721-123250-2',
        display_name: 'family_trio_20220721-123250-2',
      },
      {
        database_name: 'family_duo_20230206-180313-1',
        display_name: 'family_duo_20230206-180313-1',
      },
      {
        database_name: 'family_solo_20220429-182327',
        display_name: 'family_solo_20220429-182327',
      },
      {
        database_name: 'family_solo_20220429-182327-1',
        display_name: 'family_solo_20220429-182327-1',
      },
      {
        database_name: 'family_solo_20221114-123803',
        display_name: 'family_solo_20221114-123803',
      },
      {
        database_name: 'family_solo_20221114-123803-1',
        display_name: 'family_solo_20221114-123803-1',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b',
        display_name: 'family_solo_20230522-01d86f8b',
      },
      {
        database_name: 'family_solo_20230522-01d86f8b-1',
        display_name: 'family_solo_20230522-01d86f8b-1',
      },
      {
        database_name: 'family_solo_20231108-a5ef4f9a',
        display_name: 'family_solo_20231108-a5ef4f9a',
      },
      {
        database_name: 'family_trio_20220721-123250',
        display_name: 'family_trio_20220721-123250',
      },
      {
        database_name: 'family_trio_20220721-123250-1',
        display_name: 'family_trio_20220721-123250-1',
      },
      {
        database_name: 'family_trio_20221122-152351',
        display_name: 'family_trio_20221122-152351',
      },
      {
        database_name: 'family_trio_20221122-152351-1',
        display_name: 'family_trio_20221122-152351-1',
      },
      {
        database_name: 'family_trio_20221122-152355',
        display_name: 'family_trio_20221122-152355',
      },
      {
        database_name: 'family_trio_20221122-152355-1',
        display_name: 'family_trio_20221122-152355-1',
      },
      {
        database_name: 'family_trio_20230105-110345',
        display_name: 'family_trio_20230105-110345',
      },
      {
        database_name: 'family_trio_20230105-110345-1',
        display_name: 'family_trio_20230105-110345-1',
      },
      {
        database_name: 'family_trio_20230105-152056',
        display_name: 'family_trio_20230105-152056',
      },
      {
        database_name: 'family_trio_20230105-152056-1',
        display_name: 'family_trio_20230105-152056-1',
      },
      {
        database_name: 'family_trio_20230404-eba379f9',
        display_name: 'family_trio_20230404-eba379f9',
      },
      {
        database_name: 'family_trio_20230404-eba379f9-1',
        display_name: 'family_trio_20230404-eba379f9-1',
      },
      {
        database_name: 'family_trio_20230927-y3rtcOi',
        display_name: 'family_trio_20230927-y3rtcOi',
      },
    ]);

    mockLoggingHelperService.performanceLogAndFindOneMongo = jest
      .fn()
      .mockResolvedValue(project);

    await service.getAccessibleProject({
      track_number: '1232134fdsa',
      userInfo: S_TEAM_USERINFO,
      project_id: '653b5f900deb2a0772dc256b',
    });
  });
});
