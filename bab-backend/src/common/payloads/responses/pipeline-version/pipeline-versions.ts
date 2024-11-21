import { PipelineVersion } from 'src/applicationInfo';

export class PipelineVersions {
  hkgi_pipeline_version: string;

  small_variant_version: string;

  structural_variant_version: string;

  constructor(pipelineVersion: PipelineVersion) {
    this.hkgi_pipeline_version = pipelineVersion.version;
    this.small_variant_version = pipelineVersion.small_variant?.version;
    this.structural_variant_version =
      pipelineVersion.structural_variant?.version;
  }
}
