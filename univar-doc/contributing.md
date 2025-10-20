# Contributing to UniVar

Thank you for your interest in contributing to **UniVar**! We welcome contributions from the community to improve this [Unified Variant Interpretation Platform][univar]. Whether it's fixing a bug, adding a feature, improving documentation, or enhancing the pipelines, your help makes UniVar better for everyone.

## Ways to Contribute

### Reporting Bugs

- **Before reporting**: Search [existing issues](https://github.com/kensung-lab/UniVar/issues) to see if it's already reported.
- **How to report**:
  1. Open a new issue at [Issues](https://github.com/kensung-lab/UniVar/issues/new).
  2. Use the "Bug report" template.
  3. Provide:
     - A clear title (e.g., "Annotation pipeline fails on large [SV][sv] [VCFs][vcf]").
     - Steps to reproduce.
     - Expected vs. actual behavior.
     - Environment details (e.g., [Nextflow][nextflow] version, OS).
     - Screenshots or logs if possible.
- Label it with `bug` for visibility.

### Suggesting Features

- **Before suggesting**: Check [discussions](https://github.com/kensung-lab/UniVar/discussions) or issues for similar ideas.
- **How to suggest**:
  1. Open a new issue using the "Feature request" template.
  2. Describe the feature, why it's useful, and any mockups or references.
  3. Label it with `enhancement`.
- We prioritize features that enhance usability, performance, or support for more variant types.

### Submitting Pull Requests (PRs)

We love PRs! Follow these steps to get your contribution merged:

1. **Fork the repository** and clone your fork:

```sh
git clone https://github.com/your-username/UniVar.git
cd UniVar
```

2. **Create a feature branch** from `main`:

```sh
git checkout -b feature/your-feature-name
```

3. **Make your changes**:

- Follow our [coding standards](#coding-standards) below.
- Update documentation if needed (e.g., in `univar-doc/`).
- Add tests for new features or bug fixes.

4. **Commit your changes**:

- Use descriptive messages: `git commit -m "Add support for custom gene panels in Exomiser"`.
- Push to your fork: `git push origin feature/your-feature-name`.

5. **Open a PR**:

- Go to [Pull Requests](https://github.com/kensung-lab/UniVar/pulls) and click "New pull request".
- Link to the related issue (e.g., "Closes #123").
- Describe what you changed and why.

6. **What to expect**:

- We'll review promptly and may request changes.
- Ensure your PR passes CI checks (if set up).
- Once approved, we'll merge it!

**Tips**:

- Keep PRs small and focused—one feature or bug fix per PR.
- For pipeline changes (e.g., [Nextflow][nextflow] workflows), test on a sample dataset.

## Development Setup

To contribute to the codebase:

1. **Prerequisites**:

- [Git][git], [Docker][docker], [Nextflow][Nextflow].
- [Node.js][node-js] (for frontend/backend).
- [Python][python] (for data tools).

2. **Clone and install**:

```sh
git clone https://github.com/kensung-lab/UniVar.git
cd UniVar
```

- For frontend: `cd univar-frontend && npm install && npm run dev`.
- For backend: `cd univar-backend && npm install && npm run start:dev`.
- For pipelines: `nextflow run univar-annotation/annotation-next -profile docker`.

3. See [Installation Guide](univar-doc/installation.md) for full details.

## Coding Standards

- **JavaScript/TypeScript**: Follow [ESLint][es-lint] rules (configured in repo). Use Prettier for formatting.
- **Nextflow**: Use semantic versioning for modules; add clear params and docs.
- **Python**: PEP 8 style; use black for formatting.
- **Markdown**: Consistent headings, links via references.
- **Commits**: Conventional commits (e.g., `feat: add SV filtering`).

## Testing

- **Unit tests**: Run `npm test` in frontend/backend.
- **Pipeline tests**: Use sample data in `tests/` folders.
- **Manual testing**: Upload sample [VCFs][vcf] to web/local instance.

## Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Harassment or discrimination will not be tolerated.

## Questions?

- Join [GitHub Discussions](https://github.com/kensung-lab/UniVar/discussions) for general chat.
- [Email us](mailto:yantszcheng@cuhk.edu.hk) for private queries.

Thanks for contributing! 🎉

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
[vitest]: https://vitest.dev/ "Vitest"
[es-lint]: https://eslint.org/ "ESLint"
[axios]: https://github.com/axios/axios "Axios"
[axios-response-interceptors]: https://axios-http.com/docs/interceptors "Response Interceptors"
[Docker Related]: ====================================================================
[docker]: https://www.docker.com/ "Docker"
[docker-image]: https://docs.docker.com/get-started/overview/#images "Docker image"
[docker-registry]: https://docs.docker.com/registry/ "Docker Registry"
[container-image-digest]: https://docs.digitalocean.com/glossary/digest/ "Container Image Digest"
[dockerfile]: https://docs.docker.com/engine/reference/builder/ "Dockerfile"
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
