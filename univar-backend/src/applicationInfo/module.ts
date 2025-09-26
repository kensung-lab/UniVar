import { Module } from '@nestjs/common';
import {
  AuthController,
  BookmarkController,
  DatabaseController,
  GenePanelController,
  HPOTermController,
  PipelineVersionController,
  ProjectController,
} from './controllers';
import {
  AuthService,
  BookmarkService,
  DatabaseService,
  GenePanelService,
  HPOTermService,
  PipelineVersionService,
  ProjectService,
} from './services';
import { UtilsModule } from 'src/utils/module';
import { MongooseModule } from '@nestjs/mongoose';
import { COMMON_DATABASE, GENE_DATABASE } from 'src/common';
import {
  BOOKMARK_MODEL_NAME,
  BookmarksSchema,
  DATABASE_MODEL_NAME,
  DatabasesSchema,
  GENE_PANEL_MODEL_NAME,
  GENE_PANEL_VERSION_MODEL_NAME,
  GenePanelVersionsSchema,
  GenePanelsSchema,
  HPOTermsSchema,
  HPO_TERMS_MODEL_NAME,
  PIPELINE_MODEL_NAME,
  PROJECT_MODEL_NAME,
  PipelineVersionSchema,
  ProjectsSchema,
  VERSIONS_MODEL_NAME,
  VersionsSchema,
} from './schemas';
import { GeneService } from './services/gene/gene.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: BOOKMARK_MODEL_NAME, schema: BookmarksSchema },
        { name: DATABASE_MODEL_NAME, schema: DatabasesSchema },
        { name: GENE_PANEL_MODEL_NAME, schema: GenePanelsSchema },
        {
          name: GENE_PANEL_VERSION_MODEL_NAME,
          schema: GenePanelVersionsSchema,
        },
        { name: HPO_TERMS_MODEL_NAME, schema: HPOTermsSchema },
        { name: PIPELINE_MODEL_NAME, schema: PipelineVersionSchema },
        { name: PROJECT_MODEL_NAME, schema: ProjectsSchema },
      ],
      COMMON_DATABASE,
    ),
    MongooseModule.forFeature(
      [{ name: VERSIONS_MODEL_NAME, schema: VersionsSchema }],
      GENE_DATABASE,
    ),
    UtilsModule,
  ],
  controllers: [
    AuthController,
    DatabaseController,
    GenePanelController,
    BookmarkController,
    PipelineVersionController,
    ProjectController,
    HPOTermController,
  ],
  providers: [
    AuthService,
    DatabaseService,
    GenePanelService,
    BookmarkService,
    GeneService,
    PipelineVersionService,
    ProjectService,
    HPOTermService,
  ],
  exports: [
    AuthService,
    DatabaseService,
    GenePanelService,
    BookmarkService,
    GeneService,
    PipelineVersionService,
    ProjectService,
    HPOTermService,
  ],
})
export class ApplicationModule {}
