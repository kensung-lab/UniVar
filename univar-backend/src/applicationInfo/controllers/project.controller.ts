import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import {
  BaseRequest,
  BaseResponse,
  EditSmapleStatusRequest,
  EditNoteRequest,
  GetOneProjectRequest,
  DelDbRequest,
  GetDbStatusRequest,
  ChangeOneDbStatusRequest,
} from 'src/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth';
import { ProjectService } from '../services/common/project.service';
import { Projects } from '../schemas';

@ApiTags('project')
@Controller('project')
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiResponse({
    status: 200,
    description: 'Retrieved data in project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/list')
  @HttpCode(200)
  async findProjectList(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.listProject(
      baseRequest,
      userInfo,
    );
    return new BaseResponse(projects, baseRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieved data in project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/get-one-project')
  @HttpCode(200)
  async getOneProject(
    @Body() getOneProjectRequest: GetOneProjectRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.getOneProject(
      getOneProjectRequest,
      userInfo,
    );
    return new BaseResponse(projects, getOneProjectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'edit database status in project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/edit-database-status')
  @HttpCode(200)
  async editDbStatus(
    @Body() projectRequest: EditSmapleStatusRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.editDbStatus(
      projectRequest,
      userInfo,
    );
    return new BaseResponse(projects, projectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'edit database note in project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/edit-database-note')
  @HttpCode(200)
  async editDbNote(
    @Body() projectRequest: EditNoteRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.editDbNote(
      projectRequest,
      userInfo,
    );
    return new BaseResponse(projects, projectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'get available database to add to project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/list-database-to-add')
  @HttpCode(200)
  async getNotAddedDb(
    @Body() projectRequest: GetOneProjectRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const dbList = await this.projectService.getNotAddedDb(
      projectRequest,
      userInfo,
    );
    return new BaseResponse(dbList, projectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'add database to project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/add-database')
  @HttpCode(200)
  async addDb(
    @Body() projectRequest: EditSmapleStatusRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.addDb(projectRequest, userInfo);
    return new BaseResponse(projects, projectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'remove database from project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/remove-database')
  @HttpCode(200)
  async removeDb(
    @Body() projectRequest: DelDbRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.delDb(projectRequest, userInfo);
    return new BaseResponse(projects, projectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'get one database status from project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/get-one-db-status')
  @HttpCode(200)
  async getDbStatus(
    @Body() projectRequest: GetDbStatusRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.getDbStatus(
      projectRequest,
      userInfo,
    );
    return new BaseResponse(projects, projectRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'change one database status from project by user success',
    type: BaseResponse<Projects>,
  })
  @Post('/change-one-db-status')
  @HttpCode(200)
  async changeOneDbStatus(
    @Body() projectRequest: ChangeOneDbStatusRequest,
    @AuthenticatedUser() userInfo,
  ) {
    const projects = await this.projectService.changeOneDbStatus(
      projectRequest,
      userInfo,
    );
    return new BaseResponse(projects, projectRequest.track_number);
  }
}
