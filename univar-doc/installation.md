# Installation Guide

This guide provides an overview for setting up [UniVar][univar] locally for development, testing, or production use. [UniVar][univar] is a full-stack application with modular components. For detailed instructions on each part, refer to the README.md files in the respective subfolders.

**Note**: This is for advanced users. For quick web access, use the [live demo](https://univar.live/upload) without installation. If you're new, start with the [User Guide (PDF)](user-guide.pdf).

## Prerequisites

Ensure you have:

- [Git][git]
- [Node.js (v18+)][node-js] with [pnpm][p-npm]
- [Docker][docker] and [Docker Compose][docker-compose] (recommended)
- [MongoDB][mongo-db] 8+
- [Python][python] 3.13+
- [Java][java] 21+ (for [Nextflow][nextflow])
- [Nextflow][nextflow] 25.04.7+

Verify: `node --version`, `docker --version`, etc.

## Step 1: Clone the Repository

```sh
git clone https://github.com/kensung-lab/UniVar.git
cd UniVar
```

## Step 2: Set Up the Database (MongoDB)

- **Local**: Install and start [MongoDB][mongo-db] (see [MongoDB docs][install-mongo]).
- **Docker**: Use the `docker-compose.yml` in [univar-mongodb](../univar-mongodb/) for containerized setup. Alternatively, use the `mongo_start.sh` and `mongo_stop.sh` shell scripts to manage the [MongoDB][mongo-db] container.
- **Initialize**: See [univar-mongodb/README.md](../univar-mongodb/README.md) for scripts to set up collections.

Set `MONGO_URI` in backend `.env`.

## Step 3: Prepare Data and Databases

- **HPO, Gene Panels, Genes**: Run import scripts in [univar-data-tools/README.md](../univar-data-tools/README.md) and its subfolders (hpo-converter, import-gene-panel, univar-gene-db).
- **Annotation Databases**: Download via scripts in [univar-annotation/README.md](../univar-annotation/README.md). These are specifically for the annotation pipeline.

## Step 4: Set Up the Backend

- Navigate: `cd univar-backend`
- Follow [univar-backend/README.md](../univar-backend/README.md) for installation, `.env` config, and running (e.g., `pnpm install && pnpm run start:dev`).
- Configure the upload folder in `.env` (e.g., `UPLOAD_DIR=/path/to/uploads`) where user [VCFs][vcf] will be placed.

## Step 5: Set Up the Frontend

- Navigate: `cd univar-frontend`
- Follow [univar-frontend/README.md](../univar-frontend/README.md) for installation and dev server (e.g., `pnpm install && pnpm run dev`).

## Step 6: Docker Deployment

- See [univar-docker/README.md](../univar-docker/README.md) for building and running with [`docker-compose`][docker-compose].
- Ensure all UniVar [Docker images][docker-image] from [univar-docker](../univar-docker/) are built and available on the server for pipeline execution.

## Step 7: Pipelines

These are essential for local variant processing and storage in [MongoDB][mongo-db], which the backend/frontend relies on for display, filtering, and ordering.

- **Annotation**: Follow [univar-annotation/README.md](../univar-annotation/README.md), including subfolders like [annotation-next](../univar-annotation/annotation-next/) and [exomiser-next](../univar-annotation/exomiser-next/). This runs the full annotation pipeline on raw [VCF][vcf].gz files ([SNVs][snp]/[SVs][sv] with [VEP][vep], [VCFanno][vcfanno], [Nirvana][nirvana]; prioritization with [Exomiser][exomiser]). Configure pipeline arguments to point to the backend's upload folder for monitoring new [VCFs][vcf].
- **Variant Import**: Follow [variant-import-tool/README.md](../variant-import-tool/README.md). This imports the annotated [VCF][vcf]/[JSON][json] output from the annotation pipeline into [MongoDB][mongo-db] for querying. Place the tool on the server in a designated location and configure the annotation pipeline arguments to point to this location.
- **Pipeline Scripts**: To monitor the backend-specified upload folder. Running these scripts will trigger [Nextflow][nextflow] workflows for annotation on new uploads.
- **Alignment-to-Calling** (Optional): See [alignment-2-call-next/README.md](../alignment-2-call-next/README.md) if starting from [FASTQ][fastq] files to generate initial [VCFs][vcf].

## Step 8: Running the Full Stack

1. Start [MongoDB][mongo-db].
2. Prepare data/databases (Step 3).
3. Start backend and frontend (Steps 4-5).
4. Run pipeline-scripts (Step 7) to monitor uploads and trigger annotation.
5. Upload a sample [VCF][vcf] via frontend; it will be processed automatically, imported to [MongoDB][mongo-db], and displayed for filtering/ordering.
6. Access frontend at `http://localhost:5173`. The UI will display, filter, and order data from [MongoDB][mongo-db] based on annotated fields.

## Troubleshooting

- Connection issues: Check env vars and ports.
- Pipeline errors: Verify [Java][java]/[Docker][docker]; see subfolder READMEs.
- For more, check [FAQ](faq.md) or [GitHub Issues](https://github.com/kensung-lab/UniVar/issues).

Last updated: October 2025.

[comment]: <Below is the information for other markdown to reference>
[Bioinformation Related]: ========================================================
[snp]: https://www.genome.gov/genetics-glossary/Single-Nucleotide-Polymorphisms "Single Nucleotide Polymorphisms"
[indel]: https://www.sciencedirect.com/topics/medicine-and-dentistry/indel-mutation "indel Mutation"
[sv]: https://www.ncbi.nlm.nih.gov/dbvar/content/overview/ "Structural Variation"
[cnv]: https://www.genome.gov/genetics-glossary/Copy-Number-Variation-CNV "​Copy Number Variation"
[str]: https://en.wikipedia.org/wiki/STR_analysis "Short tandem repeat"
[mitro]: https://www.genome.gov/genetics-glossary/Mitochondrial-DNA "MITOCHONDRIAL DNA"
[cram]: https://en.wikipedia.org/wiki/CRAM_(file_format) "Compressed Reference-oriented Alignment Map"
[vcf]: https://samtools.github.io/hts-specs/VCFv4.5.pdf "Variant Call Format"
[ped]: https://gatk.broadinstitute.org/hc/en-us/articles/360035531972-PED-Pedigree-format "Pedigree format"
[hpo-website]: https://hpo.jax.org/ "HPO Website"
[gene]: https://www.genome.gov/genetics-glossary/Gene "Gene"
[exomiser]: https://github.com/exomiser/Exomiser "Exomiser"
[gene-panel]: https://www.genomicseducation.hee.nhs.uk/genotes/knowledge-hub/gene-panel-sequencing/ "Gene Panel"
[allele-frequency]: https://en.wikipedia.org/Allele_frequency "Allele frequency"
[exomiser-variant-tsv]: https://exomiser.readthedocs.io/en/latest/advanced_analysis.html#outputformats-1 "Exomiser Variant TSV"
[dna-sequencing]: https://www.genome.gov/genetics-glossary/DNA-Sequencing "DNA Sequencing"
[short-read-sequencing]: https://www.genomicseducation.hee.nhs.uk/genotes/knowledge-hub/short-read-sequencing/ "Short Read Sequencing"
[fast5]: https://help.nanoporetech.com/en/articles/6629603-what-is-a-fast5-file "fast5"
[fastq]: https://en.wikipedia.org/wiki/FASTQ_format "fastq"
[IT Related]: ====================================================================
[ci-cd]: https://www.redhat.com/en/topics/devops/what-is-ci-cd "CI/CD"
[ci]: https://www.ibm.com/topics/continuous-integration "Continuous Integration"
[cd]: https://www.ibm.com/topics/continuous-deployment "Continuous Deployment"
[tls]: https://www.cloudflare.com/zh-tw/learning/ssl/transport-layer-security-tls/ "TLS"
[https]: https://www.cloudflare.com/learning/ssl/what-is-https/ "HTTPS"
[smtp]: https://www.cloudflare.com/zh-tw/learning/email-security/what-is-smtp/ "SMTP"
[hostname]: https://en.wikipedia.org/wiki/Hostname "Hostname"
[port]: https://en.wikipedia.org/wiki/Port_(computer_networking) "Port"
[csv]: https://en.wikipedia.org/wiki/Comma-separated_values "Comma-separated values"
[restful-api]: https://aws.amazon.com/tw/what-is/restful-api/ "RESTful API"
[ldap]: https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol "Lightweight Directory Access Protocol"
[Markdown Related]: ====================================================================
[link-reference]: https://www.eddymens.com/blog/how-to-reuse-links-in-markdown-reference-links "Markdown Link Reference"
[Kubernetes Related]: ====================================================================
[kubernetes]: https://kubernetes.io/ "Kubernetes"
[kustomize]: https://kustomize.io/ "Kustomize"
[k8s-namespace]: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/ "Kubernetes Namespace"
[k8s-secret]: https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/ "Kubernetes Secret"
[k8s-dashboard]: https://github.com/kubernetes/dashboard "Kubernetes Dashboard"
[k8s-sa]: https://kubernetes.io/docs/concepts/security/service-accounts/ "Kubernetes Service Accounts"
[k8s-configuration]: https://kubernetes.io/docs/concepts/configuration/overview/ "Kubernetes Configuration"
[k8s-service]: https://kubernetes.io/docs/reference/kubernetes-api/service-resources/service-v1/ "Kubernetes Service"
[kubectl]: https://kubernetes.io/docs/reference/kubectl/ "kubectl"
[karpenter]: https://karpenter.sh/ "Karpenter"
[helm]: https://helm.sh/ "Helm"
[kong-ingress]: https://docs.konghq.com/kubernetes-ingress-controller/latest/ "Kong Ingress Controller"
[ingress-controllers]: https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/ "Ingress Controllers"
[k8-tz]: https://github.com/k8tz/k8tz "Kubernetes Timezone Controller"
[k8s-node]: https://kubernetes.io/docs/concepts/architecture/nodes/ "Kubernetes Nodes"
[k8s-pod]: https://kubernetes.io/docs/concepts/workloads/pods/ "Kubernetes Pods"
[Javascript Related]: ====================================================================
[node-js]: https://nodejs.org/en "Node.js"
[type-script]: https://www.typescriptlang.org/ "TypeScript"
[p-npm]: https://pnpm.io/ "pNpm"
[nest-js]: https://docs.nestjs.com/ "NestJS"
[vue]: https://vuejs.org/ "Vue"
[vite-configure]: https://vitejs.dev/config/ "Vite Configuration Guide"
[java]: https://www.java.com/zh-TW/ "Java"
[vitest]: https://vitest.dev/ "Vitest"
[es-lint]: https://eslint.org/ "ESLint"
[axios]: https://github.com/axios/axios "Axios"
[axios-response-interceptors]: https://axios-http.com/docs/interceptors "Response Interceptors"
[Docker Related]: ====================================================================
[docker-image]: https://docs.docker.com/get-started/overview/#images "Docker image"
[docker]: https://www.docker.com/ "Docker"
[docker-registry]: https://docs.docker.com/registry/ "Docker Registry"
[container-image-digest]: https://docs.digitalocean.com/glossary/digest/ "Container Image Digest"
[dockerfile]: https://docs.docker.com/engine/reference/builder/ "Dockerfile"
[docker-compose]: https://docs.docker.com/compose/ "Docker Compose"
[Git & Github Related]: ====================================================================
[git]: https://git-scm.com/ "git"
[github]: https://github.com/ "Github"
[github-repositories]: https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories "Github Repositories"
[git-submodule]: https://git-scm.com/book/en/v2/Git-Tools-Submodules "Git Submodule"
[github-docker-registry]: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry "Github Docker Registry"
[github-webhook]: https://docs.github.com/en/webhooks/about-webhooks "Github Webhook"
[IDE Related]: ====================================================================
[ide]: https://en.wikipedia.org/wiki/Integrated_development_environment "Integrated Development Environment"
[vs-code]: https://code.visualstudio.com/ "Visual Studio Code"
[vue-vs-plugin]: https://marketplace.visualstudio.com/items?itemName=Vue.volar "Vue Official VS Code Plugin"
[Programming Related]: ====================================================================
[python]: https://www.python.org/ "Python"
[Data Format Related]: ====================================================================
[yaml]: https://en.wikipedia.org/wiki/YAML "YAML"
[json]: https://en.wikipedia.org/wiki/JSON "JSON"
[AWS Related]: ===================================================================
[aws]: https://aws.amazon.com/ "Amazon Web Services"
[aws-efs]: https://aws.amazon.com/efs/ "Amazon Elastic File System"
[aws-eks]: https://aws.amazon.com/eks/ "Amazon Elastic Kubernetes Service"
[aws-eventbridge]: https://aws.amazon.com/eventbridge/ "Amazon EventBridge"
[aws-sqs]: https://aws.amazon.com/sqs/ "Amazon Simple Queue Service"
[aws-sqs-fifo]: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html "Amazon SQS FIFO queues"
[aws-s3]: https://aws.amazon.com/s3/ "Amazon S3"
[aws-ses]: https://aws.amazon.com/ses/ "Amazon Simple Email Service"
[aws-cloudwatch]: https://aws.amazon.com/cloudwatch/ "Amazon CloudWatch"
[aws-ec2-spot]: https://aws.amazon.com/ec2/spot/ "Amazon EC2 Spot Instances"
[aws-fargate]: https://aws.amazon.com/fargate/ "AWS Fargate"
[aws-ebs]: https://aws.amazon.com/tw/ebs/ "AWS EBS"
[aws-az]: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/ "Availability Zones"
[aws-sla]: https://aws.amazon.com/eks/sla/ "Amazon EKS Service Level Agreement"
[External Application Related]: ==================================================
[argo]: https://argoproj.github.io/argo-workflows/ "Argo"
[argo-workflow]: https://argoproj.github.io/argo-workflows/ "Argo Workflow"
[argo-event]: https://argoproj.github.io/argo-events/ "Argo Events"
[argo-workflow-templates]: https://argo-workflows.readthedocs.io/en/latest/workflow-templates/ "Argo Workflow Templates"
[argo-access-token]: https://argo-workflows.readthedocs.io/en/latest/access-token/ "Argo Access Token"
[argo-event-source]: https://github.com/argoproj/argo-events/blob/master/api/event-source.md "Event Source"
[argo-sensor]: https://github.com/argoproj/argo-events/blob/master/api/sensor.md "Sensor"
[argo-cd]: https://argo-cd.readthedocs.io/en/stable/ "Argo CD"
[argo-cd-helm]: https://artifacthub.io/packages/helm/argo/argo-cd "Argo CD Helm"
[argo-cd-image-updater]: https://argocd-image-updater.readthedocs.io/en/stable/ "Argo CD Image Updater"
[argo-cd-application]: https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications "Argo CD Application"
[argo-cd-image-updater-helm]: https://artifacthub.io/packages/helm/argo/argocd-image-updater "Argo CD Image Updater Helm"
[argo-cd-projects]: https://argo-cd.readthedocs.io/en/stable/user-guide/projects/ "Argo CD Projects"
[argo-cd-repository]: https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/ "Argo CD Repository"
[longhorn]: https://longhorn.io/ "Longhorn"
[keycloak]: https://www.keycloak.org/ "Keycloak"
[mongo-db]: https://www.mongodb.com/ "MongoDB"
[install-mongo]: https://www.mongodb.com/docs/manual/installation/ "Install MongoDB"
[swagger]: https://swagger.io/solutions/getting-started-with-oas/ "Swagger"
[sonarqube]: https://www.sonarsource.com/products/sonarqube/ "SonarQube"
[External Bioinformatics Application Related]: ==================================================
[igv]: https://www.igv.org/ "Integrative Genomics Viewer"
[vep]: https://asia.ensembl.org/info/docs/tools/vep/index.html "Ensembl Variant Effect Predictor"
[vcfanno]: https://github.com/brentp/vcfanno "vcfanno"
[nirvana]: https://illumina.github.io/NirvanaDocumentation "Nirvana"
[nextflow]: https://www.nextflow.io/ "Nextflow"
[bwa]: https://github.com/lh3/bwa "BWA"
[samtools]: https://github.com/samtools/samtools "samtools"
[deepvariant]: https://github.com/google/deepvariant "DeepVariant"
[surveyor]: https://github.com/Mesh89/SurVeyor "SurVeyor"
[bcftools]: https://github.com/samtools/bcftools "bcftools"
[cnvkit]: https://github.com/etal/cnvkit "cnvkit"
[glnexus]: https://github.com/dnanexus-rnd/GLnexus "GLnexus"
[Internal Application Related]: ==================================================
[univar]: https://github.com/kensung-lab/UniVar "UniVar"
[univar-doc]: ./univar-doc/ "UniVar Document"
[upload_page]: https://univar.live/upload "Upload Page"
