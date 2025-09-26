import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Add this line before importing pyplot
import matplotlib.pyplot as plt
import seaborn as sns
import argparse

def create_plot(input_file, output_file, skip_chr_check):
    df_cov = pd.read_csv(input_file, sep='\t', header=None)
    
    np_cov = np.array(df_cov[3])
    np_cov_zs = [(x - np.median(np_cov)) / np.std(np_cov) for x in np_cov]

    pd_graph = pd.DataFrame(data=np_cov_zs, columns=['val'])
    pd_graph = pd_graph.assign(
        X=range(pd_graph.shape[0]),
        group=[1 if abs(x) > 1.5 else 0 for x in pd_graph['val']]
    )

    fig = plt.figure(figsize=(40, 8))
    plt.tick_params(top=False, bottom=False, left=True, right=False)
    ax = plt.gca()
    ax.axes.yaxis.set_ticklabels([])

    sns.set(style="white", font_scale=1.5)
    sns.set_palette(['blue', 'red'])

    sns.scatterplot(data=pd_graph, x='X', y='val', hue='group', legend=False)

    plt.axhline(y=0, color='k', linestyle='--', linewidth=2)
    plt.axvline(x=0, color='k', linestyle='--', linewidth=2)

    chrom_list = df_cov[0].unique()
    split_chr_v, split_chr_label = 0, []

    for chrom in chrom_list:
        split_chr_label.append((split_chr_v*2+df_cov[df_cov[0]==chrom].shape[0])//2)
        split_chr_v += df_cov[df_cov[0]==chrom].shape[0]
        plt.axvline(x=split_chr_v, color='k', linestyle='--', linewidth=2)
    
    # Use raw contig names if skip_chr_check is True, otherwise strip 'chr'
    if skip_chr_check:
        plt.xticks(split_chr_label, chrom_list, fontsize=25)
    else:
        plt.xticks(split_chr_label, [x.split('chr')[1] for x in chrom_list], fontsize=25)
    
    plt.yticks(fontsize=25)
    sns.despine(offset=20, trim=True, bottom=True)
    plt.xlim(0, len(np_cov_zs)+2)
    plt.ylabel('Z-Score', fontsize=25)
    plt.subplots_adjust(left=0.15, right=0.85, top=0.85, bottom=0.15)
    
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

def main():
    parser = argparse.ArgumentParser(description='Generate a plot from coverage data')
    parser.add_argument('-i', '--input', required=True, help='Input coverage file path')
    parser.add_argument('-o', '--output', required=True, help='Output image file path')
    parser.add_argument('--skip-chr-check', action='store_true', 
                        help='Use raw contig names from input file instead of stripping "chr" prefix')
    
    args = parser.parse_args()
    create_plot(args.input, args.output, args.skip_chr_check)

if __name__ == '__main__':
    main()
