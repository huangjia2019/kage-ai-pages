#!/usr/bin/env python3
"""Regenerate dual-axis matrix.png + matrix.svg with v2 changes:
- C1 axis label "Context Engineering" → "Perception"
- C5 row: Generator-Critic moved to Chain; Self-Heal Loop added at Loop (★)
- C4 row: ReAct Loop removed from Loop (cell becomes empty)

Output: kage-ai-site/research/dual-axis/matrix.{png,svg}
"""
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

plt.rcParams['svg.fonttype'] = 'none'  # keep text as text in SVG

# Brand palette
BRAND_DARK   = '#5a3a1a'
BRAND_ACCENT = '#a85a1e'
BRAND_BG     = '#faf6f0'
BRAND_HEAD   = '#f5e6d3'
BRAND_RHEAD  = '#ead4b8'
BRAND_BORDER = '#d4c4b0'
EMPTY_GREY   = '#c9b89e'

FUNCTIONS = ['Perception', 'Memory', 'Reasoning', 'Action',
             'Reflection', 'Collaboration', 'Governance']
# 2026-06-14: Orchestrate moved from column 4 → column 6 (rightmost).
# Choreography is NOT listed as a topology — it is a coordination mode
# that operates across topologies (closer to the Teams pattern).
TOPOLOGIES = ['Chain', 'Route', 'Parallel', 'Loop', 'Hierarchy', 'Orchestrate']

# Cell content: (text, is_original_star); None for empty cells.
# Column order matches TOPOLOGIES above.
MATRIX = [
    # C1 Perception
    [('Semantic\nCompaction', True),  ('Context\nTriage', True),  ('Multi-Modal\nFusion', False), ('Progressive\nDiscovery', True), None, None],
    # C2 Memory
    [('RAG\nPipeline', False), None, None, ('Failure\nJournal', True), ('Hierarchical\nRetention', True), ('Progress\nTracking', True)],
    # C3 Reasoning
    [('Chain-of-\nThought', False), ('Complexity\nRouting', True), ('Parallel\nExploration', False), ('Iterative\nHypothesis', True), None, None],
    # C4 Action
    [('Prompt\nChaining', False), ('Tool\nDispatch', False), None, None, ('Guardrail\nSandwich', True), ('Plan-and-\nExecute', False)],
    # C5 Reflection
    [('Generator-\nCritic', False), ('Skill\nPackage', True), None, ('Self-Heal\nLoop', True), ('Experience\nReplay', False), None],
    # C6 Collaboration
    [('Handoff\nChain', False), None, ('Fan-Out/\nGather', False), ('Adversarial\nReview', False), ('Hierarchical\nDelegation', False), None],
    # C7 Governance
    [None, ('Approval\nGate', True), ('Progressive\nCommitment', True), None, ('Blast\nRadius', True), ('Observability\nHarness', True)],
]

n_rows = len(FUNCTIONS)
n_cols = len(TOPOLOGIES)

# Figure setup — landscape orientation
fig_w_in = 10.95
fig_h_in = 7.70
fig, ax = plt.subplots(figsize=(fig_w_in, fig_h_in), dpi=100)
fig.patch.set_facecolor(BRAND_BG)
ax.set_facecolor(BRAND_BG)
ax.set_xlim(0, n_cols + 1.5)
ax.set_ylim(0, n_rows + 1.0)
ax.invert_yaxis()
ax.axis('off')

cell_w = 1.0
cell_h = 1.0
header_h = 0.7
row_header_w = 1.5

# Column headers (topologies)
for j, topo in enumerate(TOPOLOGIES):
    x = row_header_w + j * cell_w
    rect = patches.Rectangle((x, 0), cell_w, header_h,
                             facecolor=BRAND_HEAD, edgecolor=BRAND_BORDER, linewidth=1.0)
    ax.add_patch(rect)
    ax.text(x + cell_w/2, header_h/2, topo,
            ha='center', va='center', fontsize=11, fontweight='bold',
            color=BRAND_DARK, family='sans-serif')

# Row headers (cognitive functions)
for i, func in enumerate(FUNCTIONS):
    y = header_h + i * cell_h
    rect = patches.Rectangle((0, y), row_header_w, cell_h,
                             facecolor=BRAND_RHEAD, edgecolor=BRAND_BORDER, linewidth=1.0)
    ax.add_patch(rect)
    ax.text(row_header_w/2, y + cell_h/2, func,
            ha='center', va='center', fontsize=11, fontweight='bold',
            color=BRAND_DARK, family='sans-serif')

# Top-left corner
corner = patches.Rectangle((0, 0), row_header_w, header_h,
                           facecolor=BRAND_HEAD, edgecolor=BRAND_BORDER, linewidth=1.0)
ax.add_patch(corner)
ax.text(row_header_w/2, header_h/2, '7×6 = 28',
        ha='center', va='center', fontsize=10, style='italic',
        color=BRAND_DARK, family='sans-serif')

# Body cells
for i, row in enumerate(MATRIX):
    for j, cell in enumerate(row):
        x = row_header_w + j * cell_w
        y = header_h + i * cell_h
        if cell is None:
            rect = patches.Rectangle((x, y), cell_w, cell_h,
                                     facecolor=BRAND_BG, edgecolor=BRAND_BORDER, linewidth=0.6)
            ax.add_patch(rect)
            ax.text(x + cell_w/2, y + cell_h/2, '—',
                    ha='center', va='center', fontsize=14,
                    color=EMPTY_GREY, family='sans-serif')
        else:
            text, is_star = cell
            rect = patches.Rectangle((x, y), cell_w, cell_h,
                                     facecolor='#ffffff', edgecolor=BRAND_BORDER, linewidth=0.8)
            ax.add_patch(rect)
            ax.text(x + cell_w/2, y + cell_h/2 - 0.05, text,
                    ha='center', va='center', fontsize=8.5,
                    color=BRAND_DARK, family='sans-serif')
            if is_star:
                ax.text(x + cell_w - 0.12, y + 0.15, '★',
                        ha='center', va='center', fontsize=9,
                        color=BRAND_ACCENT, family='sans-serif')

# Axis labels (outside grid)
ax.text(row_header_w/2 + (n_cols * cell_w)/2 + row_header_w/2, n_rows * cell_h + header_h + 0.4,
        'Execution Topology →',
        ha='center', va='center', fontsize=10, style='italic',
        color=BRAND_ACCENT, family='sans-serif')

# Subtle footer
ax.text(row_header_w + (n_cols * cell_w)/2, n_rows * cell_h + header_h + 0.7,
        '28 named patterns · 15 with original names (★) · 14 open-territory cells',
        ha='center', va='center', fontsize=9, style='italic',
        color=BRAND_DARK, family='sans-serif')

plt.tight_layout()

out_dir = Path('/home/huangj2/Documents/99-website/kage-ai-site/research/dual-axis')
plt.savefig(out_dir / 'matrix.png', dpi=100, facecolor=BRAND_BG, bbox_inches='tight', pad_inches=0.2)
plt.savefig(out_dir / 'matrix.svg', facecolor=BRAND_BG, bbox_inches='tight', pad_inches=0.2)
print(f'✓ Wrote {out_dir / "matrix.png"}')
print(f'✓ Wrote {out_dir / "matrix.svg"}')

import os
print(f'  PNG size: {os.path.getsize(out_dir / "matrix.png"):,} bytes')
print(f'  SVG size: {os.path.getsize(out_dir / "matrix.svg"):,} bytes')
