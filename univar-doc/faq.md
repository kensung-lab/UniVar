# Frequently Asked Questions (FAQ)

Welcome to the [UniVar][univar] FAQ! Here, we've compiled answers to the most common questions about using the platform, troubleshooting issues, and best practices. If your question isn't covered, feel free to [open an issue on GitHub](https://github.com/kensung-lab/UniVar/issues) or [Email us](mailto:yantszcheng@cuhk.edu.hk).

## General Questions

### What is UniVar?

[UniVar][univar] is a free, no-login web platform for automating the annotation, filtering, and prioritization of genetic variants ([SNVs][snp], [INDELs][indel], [CNVs][cnv], [SVs][sv]) to accelerate rare disease diagnosis. It unifies workflows for all variant types, supports gene panels or [HPO terms][hpo-website] for prioritization, and provides interactive results without requiring programming skills. Learn more in our [paper](https://doi.org/10.1016/j.compbiomed.2024.109560).

### What variant types does UniVar support?

[UniVar][univar] handles [SNVs][snp], [INDELs][indel], [CNVs][cnv], and [SVs][sv] in a single workflow. Upload [VCF][vcf] files containing any or all of these types for comprehensive analysis.

### Do I need to log in or install anything to use the web version?

No login required! Just visit [univar.live/upload][upload_page] to start. For local use (e.g., privacy reasons), follow the [Installation Guide](installation.md).

### How long does an analysis take?

- **Upload and initial processing**: Seconds to minutes.
- **Full annotation (via VEP, Nirvana, etc.)**: A few hours, depending on dataset size and queue.
- **Sorting/filtering/prioritization**: Seconds once annotated.

Results and progress can check via the shareable link.

## Usage Questions

### What should I do if I don't have HPO terms?

No problem! Use a gene panel instead—our novel method prioritizes variants effectively without detailed clinical info. Select from pre-loaded panels or upload your own during upload.

### How do I upload a VCF file?

1. Go to [univar.live/upload](https://univar.live/upload).
2. Drag-and-drop your [VCF][vcf] (and optional [PED][ped] file for pedigree).
3. Add context ([HPO][hpo-website] or gene panel).
4. Click "UPLOAD" and wait for the shareable link.

Tip: Test with our sample [VCF][vcf] from the upload page.

### What outputs do I get?

- Ranked interactive table with pathogenicity scores, annotations, and filters.
- Visualizations (e.g., [IGV][igv] tracks).
- Exports: CSV/TSV for variants.

### Can I export results for further analysis?

Yes! Download ranked variants as CSV/TSV directly from the results page. For local pipelines, integrate with the [annotation pipeline](../univar-annotation/).

## Security and Privacy

### Is my data secure on the web platform?

Absolutely. Uploaded files are processed securely and stored in a database accessible only via your unique shareable link. Only you (or those you share with) can view results. Our internal IT team has limited access for maintenance only. For maximum privacy, use the local installation.

## Local Setup and Customization

### Why run UniVar locally?

- Full data privacy (no uploads).
- Customize pipelines (e.g., add tools or tweak parameters).
- Handle large-scale or offline analyses.

See [Installation Guide](installation.md) for [Docker][docker]/[Nextflow][nextflow] setup.

### How do I customize the Nextflow pipelines?

- Clone the repo and edit `.nf` files or config profiles.
- For alignment: Modify [alignment-2-call-next](../alignment-2-call-next/) for your [FASTQ][fastq] inputs.
- For annotation: Adjust [annotation-next](../univar-annotation/annotation-next/) to include custom databases.

Check subfolder READMEs for examples.

### What if I encounter errors during local setup?

- Ensure [Docker][docker] and [Nextflow][nextflow] are installed.
- Verify database downloads via [data-source](../univar-annotation/data-source/).
- Common fix: Run `nextflow config` to check profiles. Report bugs on [GitHub][github].

## Support and Citation

### How do I cite UniVar?

Please cite our paper:

> Au-Yeung, C.C.Y., et al. (2025). UniVar: A variant interpretation platform enhancing rare disease diagnosis through robust filtering and unified analysis of SNV, INDEL, CNV, and SV. _Computers in Biology and Medicine_, 185, 109560. [https://doi.org/10.1016/j.compbiomed.2024.109560](https://doi.org/10.1016/j.compbiomed.2024.109560)

### Who can I contact for help?

- For bugs/features: [GitHub Issues](https://github.com/kensung-lab/UniVar/issues).
- For general questions: [Email us](mailto:yantszcheng@cuhk.edu.hk)
- Join [GitHub Discussions](https://github.com/kensung-lab/UniVar/discussions) for community chat.

Last updated: October 2025. We'll expand this FAQ as we add more features!

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
[docker-image]: https://docs.docker.com/get-started/overview/#images "Docker image"
[docker]: https://www.docker.com/ "Docker"
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
