=head1 NAME

  constraintv4

=head1 SYNOPSIS

  mv constraintv4.pm ~/.vep/Plugins
  ./vep -i variants.vcf --plugin constraintv4,/path/to/file.txt

=head1 DESCRIPTION

  A VEP plugin that annotates variant-transcript pairs based on a given file:
    --plugin constraintv4,/path/to/file.txt

  Example of a valid tab-separated annotation file:
  ```
  gene    gene_id transcript      canonical       mane_select     lof_hc_lc.obs   lof_hc_lc.exp   lof_hc_lc.possible      lof_hc_lc.oe         lof_hc_lc.mu    lof_hc_lc.pLI   lof_hc_lc.pNull lof_hc_lc.pRec  lof.obs lof.exp lof.possible    lof.oe  lof.mu  lof.pLI lof.pNull    lof.pRec        lof.oe_ci.lower lof.oe_ci.upper lof.oe_ci.upper_rank    lof.oe_ci.upper_bin_decile      lof.z_raw       lof.z_score  mis.obs mis.exp mis.possible    mis.oe  mis.mu  mis.oe_ci.lower mis.oe_ci.upper mis.z_raw       mis.z_score     mis_pphen.obs        mis_pphen.exp   mis_pphen.possible      mis_pphen.oe    syn.obs syn.exp syn.possible    syn.oe  syn.mu  syn.oe_ci.lower syn.oe_ci.upper      syn.z_raw       syn.z_score     constraint_flags        level   transcript_type chromosome      cds_length      num_coding_exons
  A1BG    1       NM_130786.4     true    true    45      4.3048e+01      193     1.0454e+00      7.0633e-07      1.6256e-16      8.4915e-01   1.5085e-01      45      4.3048e+01      193     1.0454e+00      7.0633e-07      1.7706e-16      8.4295e-01      1.5705e-01           8.2200e-01      1.3400e+00      NA      NA      -2.9756e-01     -2.5212e-01     707     6.4703e+02      2870    1.0927e+00           7.6657e-06      1.0260e+00      1.1630e+00      -2.3574e+00     -8.6092e-01     220     1.9060e+02      890     1.1543e+00           316     2.9594e+02      994     1.0678e+00      3.0216e-06      9.7300e-01      1.1720e+00      -1.1660e+00     -6.3549e-01          []      NA      NA      NA      NA      NA
  A1BG    ENSG00000121410 ENST00000263100 true    true    45      4.3048e+01      193     1.0454e+00      7.0633e-07      1.6256e-16           8.4915e-01      1.5085e-01      45      4.3048e+01      193     1.0454e+00      7.0633e-07      1.7706e-16      8.4295e-01           1.5705e-01      8.2200e-01      1.3400e+00      14057   7       -2.9756e-01     -2.5212e-01     707     6.4703e+02      2870         1.0927e+00      7.6657e-06      1.0260e+00      1.1630e+00      -2.3574e+00     -8.6092e-01     220     1.9060e+02      890          1.1543e+00      316     2.9594e+02      994     1.0678e+00      3.0216e-06      9.7300e-01      1.1720e+00      -1.1660e+00          -6.3549e-01     []      2       protein_coding  chr19   1485    8
  A1BG    ENSG00000121410 ENST00000600966 false   false   24      2.6268e+01      123     9.1365e-01      4.1979e-07      2.5306e-08           3.4303e-01      6.5697e-01      22      2.5006e+01      119     8.7979e-01      3.9582e-07      1.8365e-07      2.6452e-01           7.3548e-01      6.2800e-01      1.2560e+00      NA      NA      6.0114e-01      5.0934e-01      399     4.0552e+02      1858         9.8393e-01      4.9120e-06      9.0600e-01      1.0690e+00      3.2367e-01      1.1820e-01      103     1.0958e+02      512          9.3995e-01      166     1.7890e+02      637     9.2791e-01      1.9057e-06      8.1700e-01      1.0550e+00      9.6425e-01           5.2556e-01      []      1       protein_coding  chr19   917     5
  ```

  Which can be downloaded from:
  https://storage.googleapis.com/gcp-public-data--gnomad/release/4.1/constraint/gnomad.v4.1.constraint_metrics.tsv
  Please unzip the file before using it with the plugin.

=cut

package constraintv4;

use strict;
use warnings;

use Text::CSV;

use Bio::EnsEMBL::Variation::Utils::BaseVepPlugin;
use base qw(Bio::EnsEMBL::Variation::Utils::BaseVepPlugin);

my %constraint_mapping = (
  'constraint_v4_syn_z' => {
                           header => 'syn.z_score',
                           description => 'gnomAD v4 constraint - Synonymous Z-score'
                         },
  'constraint_v4_oe_syn' => {
                           header => 'syn.oe',
                           description => 'gnomAD v4 constraint - Observed/Expected Synonymous'
                         },
  'constraint_v4_oe_syn_lower' => {
                                 header => 'syn.oe_ci.lower',
                                 description => 'gnomAD v4 constraint - Lower bound of Observed/Expected Synonymous'
                               },
  'constraint_v4_oe_syn_upper' => {
                                 header => 'syn.oe_ci.upper',
                                 description => 'gnomAD v4 constraint - Upper bound of Observed/Expected Synonymous'
                               },
  'constraint_v4_mis_z' => {
                           header => 'mis.z_score',
                           description => 'gnomAD v4 constraint - Missense Z-score'
                         },
  'constraint_v4_oe_mis' => {
                           header => 'mis.oe',
                           description => 'gnomAD v4 constraint - Observed/Expected Missense'
                         },
  'constraint_v4_oe_mis_lower' => {
                                 header => 'mis.oe_ci.lower',
                                 description => 'gnomAD v4 constraint - Lower bound of Observed/Expected Missense'
                               },
  'constraint_v4_oe_mis_upper' => {
                                 header => 'mis.oe_ci.upper',
                                 description => 'gnomAD v4 constraint - Upper bound of Observed/Expected Missense'
                               },
  'constraint_v4_pLI' => {
                         header => 'lof.pLI',
                         description => 'gnomAD v4 constraint - Probability of Loss-of-function Intolerance'
                       },
  'constraint_v4_oe_lof' => {
                           header => 'lof.oe',
                           description => 'gnomAD v4 constraint - Observed/Expected Loss-of-function'
                         },
  'constraint_v4_oe_lof_lower' => {
                                 header => 'lof.oe_ci.lower',
                                 description => 'gnomAD v4 constraint - Lower bound of Observed/Expected Loss-of-function'
                               },
  'constraint_v4_oe_lof_upper' => {
                                 header => 'lof.oe_ci.upper',
                                 description => 'gnomAD v4 constraint - Upper bound of Observed/Expected Loss-of-function'
                               }
);


sub new {
  my $class = shift;
  my $self = $class->SUPER::new(@_);

  # get file
  my $txt_file = $self->params->[0] || "";

  die("ERROR: gnomAD constraint v4 file $txt_file not found\n") unless $txt_file && -e $txt_file;

  open(my $fh, $txt_file) or die $!;
  chomp(my $column_names = <$fh>);

  my $tsv = Text::CSV->new({ auto_diag => 1, binary => 1, sep_char => "\t" , quote_char => q{'}});

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
