=head1 NAME

 cgd

=head1 SYNOPSIS

 mv cgd.pm ~/.vep/Plugins
 ./vep -i variants.vcf --plugin cgd,/path/to/file.txt

=head1 DESCRIPTION

  A VEP plugin that annotates variant-transcript pairs based on a given file:
  
    --plugin cgd,/path/to/file.txt

  Example of a valid tab-separated annotation file:
  ```
  #GENE	HGNC ID	ENTREZ GENE ID	CONDITION	INHERITANCE	AGE GROUP	ALLELIC CONDITIONS	MANIFESTATION CATEGORIES	INTERVENTION CATEGORIES	COMMENTS	INTERVENTION/RATIONALE	REFERENCES
  A2M	7	2	Alpha-2-macroglobulin deficiency	AD	N/A	N/A	General	General	Variants have been implicated in pulmonary disease, but the evidence appears mixed	The clinical consequences of variants are unclear	94459, 2475424, 1370808
  A2ML1	23336	144568	Otitis media, susceptibility to	AD	Pediatric		Allergy/Immunology/Infectious	Allergy/Immunology/Infectious		Individuals may have increased susceptibility to otitis media, and awareness may allow awareness leading to prompt diagnosis and treatment of otitis media	26121085
  ```

  Which can be downloaded from:
  https://research.nhgri.nih.gov/CGD/download/txt/CGD.txt.gz
  Please unzip the file before using it with the plugin.


=cut

package cgd;

use strict;
use warnings;

use Data::Dumper;
use Text::CSV;

use Bio::EnsEMBL::Variation::Utils::BaseVepPlugin;
use base qw(Bio::EnsEMBL::Variation::Utils::BaseVepPlugin);

my %cgd_mapping = (
    'cgd_gene' => { header => '#GENE', description => 'CGD - Gene Symbol' },
    'cgd_hgncid' => { header => 'HGNC ID', description => 'CGD - HGNC Gene ID' },
    'cgd_entrezid' => { header => 'ENTREZ GENE ID', description => 'CGD - Entrez Gene ID' },
    'cgd_condition' => { header => 'CONDITION', description => 'CGD - Associated Condition' },
    'cgd_inheritance' => { header => 'INHERITANCE', description => 'CGD - Inheritance Pattern' },
    'cgd_agegroup' => { header => 'AGE GROUP', description => 'CGD - Age Group Affected' },
    'cgd_allelicconditions' => { header => 'ALLELIC CONDITIONS', description => 'CGD - Allelic Conditions' },
    'cgd_manifestationcategories' => { header => 'MANIFESTATION CATEGORIES', description => 'CGD - Manifestation Categories' },
    'cgd_interventioncategories' => { header => 'INTERVENTION CATEGORIES', description => 'CGD - Intervention Categories' },
    'cgd_comments' => { header => 'COMMENTS', description => 'CGD - Additional Comments' },
    'cgd_interventionrationale' => { header => 'INTERVENTION/RATIONALE', description => 'CGD - Intervention Rationale' },
    'cgd_references' => { header => 'REFERENCES', description => 'CGD - References' },
);

sub new {
  my $class = shift;
  my $self = $class->SUPER::new(@_);

  # get file
  my $txt_file = $self->params->[0] || "";

  die("ERROR: CGD text file $txt_file not found - you need to download or create it first, see documentation in pulgin file\n") unless $txt_file && -e $txt_file;

  open(my $fh, $txt_file) or die $!;
  chomp(my $column_names = <$fh>);

  my $tsv = Text::CSV->new({ auto_diag => 1, binary => 1, quote_char => undef, sep_char => "\t" });

  $tsv->parse($column_names);
  $tsv->column_names($tsv->fields);

  while (my $href = $tsv->getline_hr($fh)) {
    my $gene = $href->{'#GENE'};
    
    die("ERROR: CGD unexpected gene\n") unless defined $gene && $gene ne "" && !exists $self->{cache}->{$gene};
    $self->{cache}->{$gene} = $href;
  }

  close $fh;

  return $self;
}

sub feature_types {
  return [ 'Transcript' ];
}

sub get_header_info {
  my %header_info = (map { $_ => $cgd_mapping{$_}{description} } keys %cgd_mapping);
  return \%header_info;
}

sub run {
  my ($self, $tva) = @_;
  my $gene_symbol = $tva->transcript->{_gene_symbol} || $tva->transcript->{_gene_hgnc};

  if (defined $gene_symbol && exists $self->{cache}->{$gene_symbol}) {
    my %result = (map {
        $_ => ($self->{cache}->{$gene_symbol}->{$cgd_mapping{$_}{header}})
      } keys %cgd_mapping);

    return \%result;
  }

  return {};
}

1;
