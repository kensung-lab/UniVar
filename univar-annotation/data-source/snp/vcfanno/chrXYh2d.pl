#!/usr/bin/perl

use strict;
use warnings;


my $already_warned;
while (my $line = <>) {
    if ($line =~ /^#/) {
        # comment lines: pass to output directly
        print $line;
        next;
    }

    chomp $line;
    my @fields = split("\t", $line);
    my @fixed = splice(@fields, 0, 9);
    my $chrom = $fixed[0];
    my $format = $fixed[8];

    unless ($chrom =~ /^chr[XY]$/) {
        # not sex chromosomes: pass to output directly
        print $line, "\n";
        next;
    }

    unless ($fixed[8] =~ /^GT:/) {
        warn "'GT' is required to be the first FORMAT field\n"
            unless $already_warned;
        $already_warned = 1;
        print $line, "\n";
        next;
    }

    # go through each sample
    my $modified;
    for my $f (@fields) {
        my $x = $f; # work on a copy
        $x =~ s/^([^:]*)://;
        my $GT = $1;
        if ($GT =~ m{[|/]}) {
            # not haploid: don't touch
            next;
        }

        $f = "$GT/$GT:$x"; # force diploid
        $modified = 1;
    }

    unless ($modified) {
        print $line, "\n";
        next;
    }

    print join("\t", @fixed, @fields), "\n";
}




#end
