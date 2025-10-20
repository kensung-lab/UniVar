# HPO Converter

## Description
This is a [Typescript][type-script] program to convert the [HPO Terms][hpo-website] [`JSON`][json] file download from [HPO Website][hpo-website] to different format.
Currently only accept the `hp.json` format which can be download from this [link](https://hpo.jax.org/app/data/ontology)

## Requirement
1. NodeJS 18+

## Installation
```bash
npm install -g pnpm # if and only if not installed pnpm
pnpm install
```

## Compile
```bash
pnpm run build
```

## Run
```bash
pnpm run start
``` 

## Example of .env file
```.env
MONGO_BASE_URL=mongodb://<username:password@mongodb_ip_address>/
DATA_PATH=./data/
FILE_NAME=hp.json
CONVERTER=UNIVAR
```

[comment]: <Below is the information for other markdown to reference>

[Bioinformation Related]: <========================================================>
[snp]: <https://www.genome.gov/genetics-glossary/Single-Nucleotide-Polymorphisms> (Single Nucleotide Polymorphisms)
[sv]: <https://www.ncbi.nlm.nih.gov/dbvar/content/overview/> (Structural Variation)
[str]: <https://en.wikipedia.org/wiki/STR_analysis> (Short tandem repeat)
[mitro]: <https://www.genome.gov/genetics-glossary/Mitochondrial-DNA> (​MITOCHONDRIAL DNA)
[cram]: <https://en.wikipedia.org/wiki/CRAM_(file_format)> (Compressed Reference-oriented Alignment Map)
[vcf]: <https://samtools.github.io/hts-specs/VCFv4.5.pdf> (Variant Call Format)
[ped]: <https://gatk.broadinstitute.org/hc/en-us/articles/360035531972-PED-Pedigree-format> (Pedigree format)
[hpo-website]: <https://hpo.jax.org/> (HPO Website)
[gene]: <https://www.genome.gov/genetics-glossary/Gene> (Gene)
[exomiser]: <https://github.com/exomiser/Exomiser> (Exomiser)
[gene-panel]: <https://www.genomicseducation.hee.nhs.uk/genotes/knowledge-hub/gene-panel-sequencing/> (Gene Panel)
[allele-frequency]: <https://en.wikipedia.org/wiki/Allele_frequency> (Allele frequency)
[exomiser-variant-tsv]: <https://exomiser.readthedocs.io/en/latest/advanced_analysis.html#outputformats-1> (Exomiser Variant TSV)
[dna-sequencing]: <https://www.genome.gov/genetics-glossary/DNA-Sequencing> (DNA Sequencing)
[short-read-sequencing]: <https://www.genomicseducation.hee.nhs.uk/genotes/knowledge-hub/short-read-sequencing/> (Short Read Sequencing)
[fast5]: <https://help.nanoporetech.com/en/articles/6629603-what-is-a-fast5-file> (fast5)
[fastq]: <https://en.wikipedia.org/wiki/FASTQ_format> (fastq)
[igv]: <https://www.igv.org/> (Integrative Genomics Viewer)

[IT Related]: <====================================================================>
[ci-cd]: <https://www.redhat.com/en/topics/devops/what-is-ci-cd> (CI/CD)
[ci]: <https://www.ibm.com/topics/continuous-integration> (Continuous Integration)
[cd]: <https://www.ibm.com/topics/continuous-deployment> (Continuous Deployment)
[tls]: <https://www.cloudflare.com/zh-tw/learning/ssl/transport-layer-security-tls/> (TLS)
[https]: <https://www.cloudflare.com/learning/ssl/what-is-https/> (HTTPS)
[smtp]: <https://www.cloudflare.com/zh-tw/learning/email-security/what-is-smtp/> (SMTP)
[hostname]: <https://en.wikipedia.org/wiki/Hostname> (Hostname)
[port]: <https://en.wikipedia.org/wiki/Port_(computer_networking)> (Port)
[csv]: <https://en.wikipedia.org/wiki/Comma-separated_values> (Comma-separated values)
[restful-api]: <https://aws.amazon.com/tw/what-is/restful-api/> (RESTful API)
[ldap]: <https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol> (Lightweight Directory Access Protocol)

[Markdown Related]: <====================================================================>
[link-reference]: <https://www.eddymens.com/blog/how-to-reuse-links-in-markdown-reference-links> (Markdown Link Reference)

[Kubernetes Related]: <====================================================================>
[kubernetes]: <https://kubernetes.io/> (Kubernetes)
[kustomize]: <https://kustomize.io/> (Kustomize)
[k8s-namespace]: <https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/> (Kubernetes Namespace)
[k8s-secret]: <https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/> (Kubernetes Secret)
[k8s-dashboard]: <https://github.com/kubernetes/dashboard> (Kubernetes Dashboard)
[k8s-sa]: <https://kubernetes.io/docs/concepts/security/service-accounts/> (Kubernetes Service Accounts)
[k8s-configuration]: <https://kubernetes.io/docs/concepts/configuration/overview/> (Kubernetes Configuration)
[k8s-service]: <https://kubernetes.io/docs/reference/kubernetes-api/service-resources/service-v1/> (Kubernetes Service)
[kubectl]: <https://kubernetes.io/docs/reference/kubectl/> (kubectl)
[karpenter]: <https://karpenter.sh/> (Karpenter)
[helm]: <https://helm.sh/> (Helm)
[kong-ingress]: <https://docs.konghq.com/kubernetes-ingress-controller/latest/> (Kong Ingress Controller)
[ingress-controllers]: <https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/> (Ingress Controllers)
[k8-tz]: <https://github.com/k8tz/k8tz> (Kubernetes Timezone Controller)
[k8s-node]: <https://kubernetes.io/docs/concepts/architecture/nodes/> (Kubernetes Nodes)
[k8s-pod]: <https://kubernetes.io/docs/concepts/workloads/pods/> (Kubernetes Pods)

[Javascript Related]: <====================================================================>
[node-js]: <https://nodejs.org/en> (Node.js)
[type-script]: <https://www.typescriptlang.org/> (TypeScript)
[p-npm]: <https://pnpm.io/> (pNpm)
[nest-js]: <https://docs.nestjs.com/> (NestJS)
[vue]: <https://vuejs.org/> (Vue)
[vite-configure]: <https://vitejs.dev/config/> (Vite Configuration Guide)
[vitest]: <https://vitest.dev/> (Vitest)
[es-lint]: <https://eslint.org/> (ESLint)
[axios]: <https://github.com/axios/axios> (Axios)
[axios-response-interceptors]: <https://axios-http.com/docs/interceptors> (Response Interceptors)

[Docker Related]: <====================================================================>
[docker-image]: <https://docs.docker.com/get-started/overview/#images> (Docker image)
[docker-registry]: <https://docs.docker.com/registry/> (Docker Registry)
[container-image-digest]: <https://docs.digitalocean.com/glossary/digest/> (Container Image Digest)
[dockerfile]: <https://docs.docker.com/engine/reference/builder/> (Dockerfile)

[Git & Github Related]: <====================================================================>
[git]: <https://git-scm.com/> (git)
[github]: <https://github.com/> (Github)
[github-repositories]: <https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories> (Github Repositories)
[git-submodule]: <https://git-scm.com/book/en/v2/Git-Tools-Submodules> (Git Submodule)
[github-docker-registry]: <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry> (Github Docker Registry)
[github-webhook]: <https://docs.github.com/en/webhooks/about-webhooks> (Github Webhook)

[IDE Related]: <====================================================================>
[ide]: <https://en.wikipedia.org/wiki/Integrated_development_environment> (Integrated Development Environment)
[vs-code]: <https://code.visualstudio.com/> (Visual Studio Code)
[volar-vs-plugin]: <https://marketplace.visualstudio.com/items?itemName=Vue.volar> (Volar VS Code Plugin)

[Programming Related]: <====================================================================>
[python]: <https://www.python.org/> (Python)

[Data Format Related]: <====================================================================>
[yaml]: <https://en.wikipedia.org/wiki/YAML> (YAML)
[json]: <https://en.wikipedia.org/wiki/JSON> (JSON)

[AWS Related]: <===================================================================>
[aws]: <https://aws.amazon.com/> (Amazon Web Services)
[aws-efs]: <https://aws.amazon.com/efs/> (Amazon Elastic File System)
[aws-eks]: <https://aws.amazon.com/eks/> (Amazon Elastic Kubernetes Service)
[aws-eventbridge]: <https://aws.amazon.com/eventbridge/> (Amazon EventBridge)
[aws-sqs]: <https://aws.amazon.com/sqs/> (Amazon Simple Queue Service)
[aws-sqs-fifo]: <https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fifo-queues.html> (Amazon SQS FIFO queues)
[aws-s3]: <https://aws.amazon.com/s3/> (Amazon S3)
[aws-ses]: <https://aws.amazon.com/ses/> (Amazon Simple Email Service)
[aws-cloudwatch]: <https://aws.amazon.com/cloudwatch/> (Amazon CloudWatch)
[aws-ec2-spot]: <https://aws.amazon.com/ec2/spot/> (Amazon EC2 Spot Instances)
[aws-fargate]: <https://aws.amazon.com/fargate/> (AWS Fargate)
[aws-ebs]: <https://aws.amazon.com/tw/ebs/> (AWS EBS)
[aws-az]: <https://aws.amazon.com/about-aws/global-infrastructure/regions_az/> (Availability Zones)
[aws-sla]: <https://aws.amazon.com/eks/sla/> (Amazon EKS Service Level Agreement)
[aws-cloudformation]: <https://aws.amazon.com/cloudformation/> (AWS CloudFormation)

[External Application Related]: <==================================================>
[argo]: <https://argoproj.github.io/argo-workflows/> (Argo)
[argo-workflow]: <https://argoproj.github.io/argo-workflows/> (Argo Workflow)
[argo-event]: <https://argoproj.github.io/argo-events/> (Argo Events)
[argo-workflow-templates]: <https://argo-workflows.readthedocs.io/en/latest/workflow-templates/> (Argo Workflow Templates)
[argo-access-token]: <https://argo-workflows.readthedocs.io/en/latest/access-token/> (Argo Access Token)
[argo-event-source]: <https://github.com/argoproj/argo-events/blob/master/api/event-source.md> (Event Source)
[argo-sensor]: <https://github.com/argoproj/argo-events/blob/master/api/sensor.md> (Sensor)
[argo-cd]: <https://argo-cd.readthedocs.io/en/stable/> (Argo CD)
[argo-cd-helm]: <https://artifacthub.io/packages/helm/argo/argo-cd> (Argo CD Helm)
[argo-cd-image-updater]: <https://argocd-image-updater.readthedocs.io/en/stable/> (Argo CD Image Updater)
[argo-cd-application]: <https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications> (Argo CD Application)
[argo-cd-image-updater-helm]: <https://artifacthub.io/packages/helm/argo/argocd-image-updater> (Argo CD Image Updater Helm)
[argo-cd-projects]: <https://argo-cd.readthedocs.io/en/stable/user-guide/projects/> (Argo CD Projects)
[argo-cd-repository]: <https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/> (Argo CD Repository)
[longhorn]: <https://longhorn.io/> (Longhorn)
[keycloak]: <https://www.keycloak.org/> (Keycloak)
[mongo-db]: <https://www.mongodb.com/> (MongoDB)
[mongo-db-doc]: <https://www.mongodb.com/docs/manual/core/document/> (MongoDB Document)
[swagger]: <https://swagger.io/solutions/getting-started-with-oas/> (Swagger)
[sonarqube]: <https://www.sonarsource.com/products/sonarqube/> (SonarQube)
[fluentbit]: <https://fluentbit.io/> (fluentbit)
