import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController, ProjectService } from 'src/applicationInfo';
import {
  GetOneProjectRequest,
  EditNoteRequest,
  EditSmapleStatusRequest,
  DelDbRequest,
  GetDbStatusRequest,
  ChangeOneDbStatusRequest,
} from 'src/common';
import { B_TEAM_USERINFO } from '../../mock';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            listProject: jest.fn(),
            getOneProject: jest.fn(),
            editDbStatus: jest.fn(),
            editDbNote: jest.fn(),
            getNotAddedDb: jest.fn(),
            addDb: jest.fn(),
            delDb: jest.fn(),
            getDbStatus: jest.fn(),
            changeOneDbStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  describe('listAllProject', () => {
    it('should get project list', async () => {
      const req = {
        track_number: 'aws_1234_hihi_1919',
      };
      const userInfo = {};

      await controller.findProjectList(req, userInfo);

      expect(service.listProject).toHaveBeenCalledWith(req, userInfo);
    });
  });

  describe('findOneProject', () => {
    it('should get one project', async () => {
      const req: GetOneProjectRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
      };
      const userInfo = {};

      await controller.getOneProject(req, userInfo);

      expect(service.getOneProject).toHaveBeenCalledWith(req, userInfo);
    });
  });

  describe('editDbStatus', () => {
    it('should edit db status', async () => {
      const req: EditSmapleStatusRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
        todos: [],
        wips: [],
        verifying: ['HG002'],
        done: ['HG003', 'HG004'],
        __v: 8,
      };
      const userInfo = {};

      await controller.editDbStatus(req, userInfo);

      expect(service.editDbStatus).toHaveBeenCalledWith(req, userInfo);
    });
  });

  describe('editSampleNote', () => {
    it('should edit sample note', async () => {
      const req: EditNoteRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
        database_name: 'HG002',
        note: 'hihi, this sample is done',
        __v: 8,
      };
      const userInfo = {};

      await controller.editDbNote(req, userInfo);

      expect(service.editDbNote).toHaveBeenCalledWith(req, userInfo);
    });
  });

  describe('getNotAddedDb', () => {
    it('get available database to add to project by user success', async () => {
      const req: GetOneProjectRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
      };

      await controller.getNotAddedDb(req, B_TEAM_USERINFO);

      expect(service.getNotAddedDb).toHaveBeenCalledWith(req, B_TEAM_USERINFO);
    });
  });

  describe('addDb', () => {
    it('add database to project by user success', async () => {
      const req: EditSmapleStatusRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
        todos: [],
        wips: [],
        verifying: ['HG002'],
        done: ['HG003', 'HG004'],
        __v: 8,
      };

      await controller.addDb(req, B_TEAM_USERINFO);

      expect(service.addDb).toHaveBeenCalledWith(req, B_TEAM_USERINFO);
    });
  });

  describe('removeDb', () => {
    it('remove database from project by user success', async () => {
      const req: DelDbRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
        databases: ['HG003', 'HG004'],
        __v: 0,
      };

      await controller.removeDb(req, B_TEAM_USERINFO);

      expect(service.delDb).toHaveBeenCalledWith(req, B_TEAM_USERINFO);
    });
  });

  describe('getDbStatus', () => {
    it('get one database status from project by user success', async () => {
      const req: GetDbStatusRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
        database: 'HG004',
      };

      await controller.getDbStatus(req, B_TEAM_USERINFO);

      expect(service.getDbStatus).toHaveBeenCalledWith(req, B_TEAM_USERINFO);
    });
  });

  describe('changeOneDbStatus', () => {
    it('remove database from project by user success', async () => {
      const req: ChangeOneDbStatusRequest = {
        track_number: 'aws_1234_hihi_1919',
        project_id: '87s6dfg8976dsf9gds67',
        database: 'HG004',
        status: '',
        __v: 0,
      };

      await controller.changeOneDbStatus(req, B_TEAM_USERINFO);

      expect(service.changeOneDbStatus).toHaveBeenCalledWith(
        req,
        B_TEAM_USERINFO,
      );
    });
  });
});
