#!/usr/bin/perl -w

use strict;
die "Usage: <bedfile>\nThe BED calculate size profile \n" unless @ARGV==1;

my $bedFile = shift;
my %h;
my $tot=0;

# open BED, '<', $bedFile;
&openFile($bedFile);

while(<IN>)
{
        chomp;
        my @F=split /\t/, $_;
        # my $real_size = $F[2] - $F[1];
	my $real_size = $F[3];
        next if $real_size>2000;
        $h{$real_size}++;
        $tot++;
}
close IN;

# print "#size\tcount\tpercentage\n";
for my $pos (1..2000)
{
        # $h{$_}=defined $h{$_} ? $h{$_} : 0;
        my $count=$h{$pos} || 0;
        my $prec=0;
        if($tot>0){$prec=$count/$tot*100 || 0;}
        print join("\t", $pos, $count, $prec), "\n";
}

#---------------------------------------------------------------

# subroutines
sub openFile{
        my $fn = $_[0]; # filePath
        if($fn =~ /\.gz2?$/){
                open IN, "zcat $fn |" or die "Can Not Open File: $fn";
        }elsif($fn =~ /\.bz2$/){
                open IN, "bzcat $fn |" or die "Can Not Open File: $fn";
        }else{
                open IN, "$fn" or die "Can Not Open File: $fn";
        }
}
