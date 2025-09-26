=head1 NAME

  constraintv2

=head1 SYNOPSIS

  mv constraintv2.pm ~/.vep/Plugins
  ./vep -i variants.vcf --plugin constraintv2,/path/to/file.txt

=head1 DESCRIPTION

  A VEP plugin that annotates variant-transcript pairs based on a given file:
    --plugin constraintv2,/path/to/file.txt

  Example of a valid tab-separated annotation file:
  ```
  gene	transcript	canonical	obs_mis	exp_mis	oe_mis	mu_mis	possible_mis	obs_mis_pphen	exp_mis_pphen	oe_mis_pphen	possible_mis_pphen	obs_syn	exp_syn	oe_syn	mu_syn	possible_syn	obs_lof	mu_lof	possible_lof	exp_lof	pLI	pNull	pRec	oe_lof	oe_syn_lower	oe_syn_upper	oe_mis_lower	oe_mis_upper	oe_lof_lower	oe_lof_upper	constraint_flag	syn_z	mis_z	lof_z	oe_lof_upper_rank	oe_lof_upper_bin	oe_lof_upper_bin_6	n_sites	classic_caf	max_af	no_lofs	obs_het_lof	obs_hom_lof	defined	p	exp_hom_lof	classic_caf_afr	classic_caf_amr	classic_caf_asj	classic_caf_eas	classic_caf_fin	classic_caf_nfe	classic_caf_oth	classic_caf_sas	p_afr	p_amr	p_asj	p_eas	p_fin	p_nfe	p_oth	p_sas	transcript_type	gene_id	transcript_level	cds_length	num_coding_exons	gene_type	gene_length	exac_pLI	exac_obs_lof	exac_exp_lof	exac_oe_lof	brain_expression	chromosome	start_position	end_position
  A1BG	ENST00000263100	true	298	2.9385e+02	1.0141e+00	1.8787e-05	3115	104	1.0139e+02	1.0257e+00	1127	141	1.3690e+02	1.0299e+00	9.2037e-06	1080	15	9.1285e-07	209	1.9119e+01	4.9917e-09	6.1307e-01	3.8693e-01	7.8457e-01	8.9700e-01	1.1840e+00	9.2200e-01	1.1160e+00	5.2400e-01	1.2080e+00		-2.7523e-01	-8.6130e-02	8.7287e-01	51397	6	3	33	5.3610e-04	2.7872e-04	125614	134	0	125748	5.3295e-04	3.5717e-02	4.9617e-04	2.6046e-04	5.9583e-03	8.2871e-04	0.0000e+00	2.5758e-04	8.1973e-04	2.6162e-04	4.9225e-04	2.6021e-04	5.9702e-03	8.1582e-04	0.0000e+00	2.5493e-04	8.1466e-04	2.6134e-04	protein_coding	ENSG00000121410	2	1485	8	protein_coding	8322	9.0649e-05	8	1.2301e+01	6.5033e-01	NA	19	58856544	58864865
  A1BG	ENST00000600966	false	180	1.7669e+02	1.0187e+00	1.1859e-05	1941	66	5.7978e+01	1.1384e+00	633	82	7.9983e+01	1.0252e+00	5.6379e-06	660	8	5.5304e-07	124	1.0849e+01	3.7418e-05	3.8006e-01	6.1990e-01	7.3739e-01	8.5700e-01	1.2320e+00	9.0100e-01	1.1530e+00	4.3200e-01	1.3280e+00		-1.7733e-01	-8.8413e-02	8.0156e-01	56103	7	4	17	3.9467e-04	2.7872e-04	125648	99	0	125747	3.9373e-04	1.9493e-02	1.2325e-04	1.4460e-04	5.9583e-03	1.0876e-04	0.0000e+00	1.8601e-04	6.5189e-04	1.6333e-04	1.2304e-04	1.4455e-04	5.9702e-03	1.0874e-04	0.0000e+00	1.8460e-04	6.5168e-04	1.6333e-04	protein_coding	ENSG00000121410	2	917	5	protein_coding	8322	NA	NA	NA	NA	NA	19	58856544	58864865
  A1CF	ENST00000282641	false	282	3.2952e+02	8.5578e-01	1.6690e-05	3828	85	1.1419e+02	7.4437e-01	1316	131	1.2340e+02	1.0616e+00	6.6397e-06	1185	19	2.1184e-06	365	3.3268e+01	3.4400e-09	1.6996e-02	9.8300e-01	5.7113e-01	9.2000e-01	1.2270e+00	7.7600e-01	9.4400e-01	3.9700e-01	8.3800e-01		-5.3765e-01	9.3033e-01	2.2922e+00	34158	4	2	37	2.4146e-04	4.7853e-05	125686	60	0	125746	2.3860e-04	7.1590e-03	1.8473e-04	3.7714e-04	0.0000e+00	1.6441e-04	4.6296e-05	2.7600e-04	1.6345e-04	2.7070e-04	1.8456e-04	3.7588e-04	0.0000e+00	1.6313e-04	4.6195e-05	2.7252e-04	1.6288e-04	2.6134e-04	protein_coding	ENSG00000148584	3	1782	11	protein_coding	86267	NA	NA	NA	NA	NA	10	52559169	52645435
  ```

  Which can be downloaded from:
  https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/constraint/gnomad.v2.1.1.lof_metrics.by_transcript.txt.bgz
  Please unzip the file before using it with the plugin.

=cut

package constraintv2;

use strict;
use warnings;

use Text::CSV;

use Bio::EnsEMBL::Variation::Utils::BaseVepPlugin;
use base qw(Bio::EnsEMBL::Variation::Utils::BaseVepPlugin);

my %constraint_mapping = (
  'constraint_v2_syn_z' => {
                           header => 'syn_z',
                           description => 'gnomAD constraint - Synonymous Z-score'
                         },
  'constraint_v2_oe_syn' => {
                           header => 'oe_syn',
                           description => 'gnomAD constraint - Observed/Expected Synonymous'
                         },
  'constraint_v2_oe_syn_lower' => {
                                 header => 'oe_syn_lower',
                                 description => 'gnomAD constraint - Lower bound of Observed/Expected Synonymous'
                               },
  'constraint_v2_oe_syn_upper' => {
                                 header => 'oe_syn_upper',
                                 description => 'gnomAD constraint - Upper bound of Observed/Expected Synonymous'
                               },
  'constraint_v2_mis_z' => {
                           header => 'mis_z',
                           description => 'gnomAD constraint - Missense Z-score'
                         },
  'constraint_v2_oe_mis' => {
                           header => 'oe_mis',
                           description => 'gnomAD constraint - Observed/Expected Missense'
                         },
  'constraint_v2_oe_mis_lower' => {
                                 header => 'oe_mis_lower',
                                 description => 'gnomAD constraint - Lower bound of Observed/Expected Missense'
                               },
  'constraint_v2_oe_mis_upper' => {
                                 header => 'oe_mis_upper',
                                 description => 'gnomAD constraint - Upper bound of Observed/Expected Missense'
                               },
  'constraint_v2_pLI' => {
                         header => 'pLI',
                         description => 'gnomAD constraint - Probability of Loss-of-function Intolerance'
                       },
  'constraint_v2_oe_lof' => {
                           header => 'oe_lof',
                           description => 'gnomAD constraint - Observed/Expected Loss-of-function'
                         },
  'constraint_v2_oe_lof_lower' => {
                                 header => 'oe_lof_lower',
                                 description => 'gnomAD constraint - Lower bound of Observed/Expected Loss-of-function'
                               },
  'constraint_v2_oe_lof_upper' => {
                                 header => 'oe_lof_upper',
                                 description => 'gnomAD constraint - Upper bound of Observed/Expected Loss-of-function'
                               }
);


sub new {
  my $class = shift;
  my $self = $class->SUPER::new(@_);

  # get file
  my $txt_file = $self->params->[0] || "";

  die("ERROR: gnomAD constraint v2 file $txt_file not found\n") unless $txt_file && -e $txt_file;

  open(my $fh, $txt_file) or die $!;
  chomp(my $column_names = <$fh>);

  my $tsv = Text::CSV->new({ auto_diag => 1, binary => 1, sep_char => "\t" });

  $tsv->parse($column_names);
  $tsv->column_names($tsv->fields);

  while (my $href = $tsv->getline_hr($fh)) {
    my $transcript = $href->{'transcript'};

    die("ERROR: constraint unexpected transcript\n") unless defined $transcript && $transcript ne "" && ! defined $self->{cache}->{$transcript};
    $self->{cache}->{$transcript} = $href;
  }

  close $fh;

  return $self;
}

sub feature_types {
  return ['Transcript'];
}

sub get_header_info {
  my %header_info = (map { $_ => $constraint_mapping{$_}{description} } keys %constraint_mapping);
  return \%header_info;
}

sub run {
  my ($self, $tva) = @_;
  my $stable_id = $tva->transcript->stable_id;
  $stable_id =~ s/\.\d+$//;

  if (defined $stable_id && exists $self->{cache}->{$stable_id}) {
    my %result = ( map {
        $_ => ($self->{cache}->{$stable_id}->{$constraint_mapping{$_}{header}})
      } keys %constraint_mapping );
    
    return \%result;
  }

  return {};
}

1;
