#!/usr/bin/env python3

import pysam
import argparse
import pandas as pd
import numpy as np
from concurrent.futures import ProcessPoolExecutor
import sys
from functools import partial

def process_batch(args, chr_x, start_positions, bin_len):
    """Process a batch of bins for a chromosome in a separate process"""
    with pysam.AlignmentFile(args.infile) as bf:
        results = []
        for start in start_positions:
            end = start + bin_len
            cov_list = bf.count_coverage(chr_x, start, end)
            cov_array = np.sum(np.array(cov_list), axis=0)
            cov_bin = np.median(cov_array)
            results.append(f"{chr_x}\t{start}\t{end}\t{cov_bin}")
        return results

def main(args):
    # Load reference lengths
    df_ref_len = pd.read_csv(args.fastafile + '.fai', 
                           sep='\t', header=None)
    sys.stdout.write("completed loading fasta file\n")
    ref_len_dict = dict(zip(df_ref_len[0], df_ref_len[1]))
    
    # Use all contigs if skip_chr_check is True, otherwise use default chrom list
    if args.skip_chr_check:
        chrom_list = df_ref_len[0].tolist()
    else:
        chrom_list = [f'chr{x}' for x in range(1, 23)] + ['chrX', 'chrY']

    batch_size = max(10, args.bin_len // 1000)
    
    with open(args.outfile, 'w') as fout:
        with ProcessPoolExecutor(max_workers=args.threads) as executor:
            # Prepare all tasks
            tasks = []
            for chr_x in chrom_list:
                n_bins = ref_len_dict[chr_x] // args.bin_len
                starts = np.arange(0, n_bins * args.bin_len, args.bin_len)
                batches = [starts[i:i + batch_size] for i in range(0, len(starts), batch_size)]
                
                # Create partial function for this chromosome
                process_func = partial(process_batch, args, chr_x, bin_len=args.bin_len)
                # Submit all batches for this chromosome
                for batch in batches:
                    tasks.append(executor.submit(process_func, batch))
            
            # Collect and write results in order
            for future in tasks:
                batch_result = future.result()
                fout.write('\n'.join(batch_result) + '\n')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="bin coverage")
    parser.add_argument('-i', '--input_file', required=True, type=str, dest='infile', 
                       help='<str> Input Bed file.')    
    parser.add_argument('-o', '--out_prefix', required=True, type=str, dest='outfile', 
                       help='<str> Prefix of output files.')
    parser.add_argument('-l', '--bin_length', required=False, type=int, default=1000000, 
                       dest='bin_len', help='bin length')
    parser.add_argument('-t', '--threads', required=False, type=int, default=20, 
                       dest='threads', help='number of threads (default: 20)')
    parser.add_argument('-v', '--version', action='version', version='%(prog)s 1.0')
    parser.add_argument('-r', '--reference', required=True, type=str, dest='fastafile',
                        help='<str> Reference fasta file.')
    parser.add_argument('--skip-chr-check', action='store_true', 
                        help='Use all contigs from fai file instead of standard chromosomes')
    args = parser.parse_args()
    print(args)
    main(args)
