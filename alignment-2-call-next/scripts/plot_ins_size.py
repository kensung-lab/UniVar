import pandas as pd
import matplotlib
matplotlib.use('Agg')  # For non-interactive use on servers
import matplotlib.pyplot as plt
import argparse
import os

def create_plot(input_file, output_file):
    # Extract proband ID from filename
    filename = os.path.basename(input_file)
    proband_id = filename.split('___')[0]

    # Create figure
    fig = plt.figure(figsize=(8, 6))

    # Read the histogram file
    histo = pd.read_csv(input_file, sep='\t', names=['size', 'count', 'freq'])

    # Find the size corresponding to maximum frequency
    max_freq_idx = histo['freq'].idxmax()
    max_size = histo['size'][max_freq_idx]
    max_freq = histo['freq'][max_freq_idx]

    # Plot the data
    plt.plot(histo['size'], histo['freq'], linewidth=3, color='b', label='Autosomal', alpha=1)
    
    # Dynamic x-axis limits
    min_size = histo['size'].min()
    max_size_data = histo['size'].max()
    # Calculate padding to balance space around min and max
    range_size = max_size_data - min_size
    padding = range_size * 0.1  # 10% padding on each side
    xlim_min = max(0, min_size - padding)  # Ensure no negative limit
    xlim_max = max_size_data + padding
    plt.xlim(xlim_min, xlim_max)

    # Set labels and ticks
    plt.xlabel('Insert Size', fontsize=25)
    plt.ylabel('Frequency (%)', fontsize=25)
    plt.xticks(fontsize=20)
    plt.yticks(fontsize=20)

    # Add vertical line at peak with label
    plt.axvline(x=max_size, color='r', label=f'Max: {max_size}')
    plt.legend(frameon=False, fontsize=22, loc='upper right')

    # Set title with proband ID
    plt.title(proband_id, fontsize=30)
    plt.subplots_adjust(left=0.15, right=0.85, top=0.85, bottom=0.15)

    # Save the plot
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Generate histogram plot from histo file')
    parser.add_argument('-i', '--input', required=True, help='Input histogram file path (e.g., ABC123___ddxddd3ddd.histo)')
    parser.add_argument('-o', '--output', required=True, help='Output image file path')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Create the plot
    create_plot(args.input, args.output)

if __name__ == '__main__':
    main()
