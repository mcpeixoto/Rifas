#!/usr/bin/env python3
"""Generate animated stack-and-cut SVG (en + pt versions) using the Santos rifa as the visual."""
import base64
from pathlib import Path

HERE = Path(__file__).parent
B64 = base64.b64encode((HERE / "rifa-tn.png").read_bytes()).decode("ascii")
RIFA_HREF = f"data:image/png;base64,{B64}"

# rifa thumbnail intrinsic ratio: 240x78 -> 3.077:1
RIFA_W = 92      # px on A4 sheet
RIFA_H = RIFA_W * 78 / 240

STRINGS = {
    "en": {
        "title": "How stack-and-cut numbering works",
        "stage_pages": "Each A4 sheet interleaves numbers across the stack",
        "stage_stack": "Print the set, then stack the pages",
        "stage_cut": "Cut once along the dashed lines",
        "stage_strips": "Each strip is already in sequential order",
        "footer": "no manual sorting · stack, cut, hand out",
        "page": "page",
        "stack": "stack",
    },
    "pt": {
        "title": "Como funciona a numeração empilha-e-corta",
        "stage_pages": "Cada A4 distribui os números pelo set inteiro",
        "stage_stack": "Imprime o set e empilha as páginas",
        "stage_cut": "Corta uma só vez ao longo das linhas",
        "stage_strips": "Cada tira já vai por ordem sequencial",
        "footer": "sem ordenar à mão · empilha, corta, distribui",
        "page": "página",
        "stack": "pilha",
    },
}

SHEETS_NUMS = [
    [1, 11, 21, 31, 41, 51, 61, 71],   # page 1
    [2, 12, 22, 32, 42, 52, 62, 72],   # page 2
    [10, 20, 30, 40, 50, 60, 70, 80],  # page 10
]


def make_sheet(nums, sheet_w=200, sheet_h=260):
    """Render a single A4 sheet group: 4 rows × 2 cols of rifa thumbs with numbers."""
    pad = 14
    cols, rows = 2, 4
    inner_w = sheet_w - 2 * pad
    inner_h = sheet_h - 2 * pad - 18  # leave header strip
    cell_w = inner_w / cols
    cell_h = inner_h / rows
    parts = []
    parts.append(f'<rect class="sheet" x="0" y="0" width="{sheet_w}" height="{sheet_h}" rx="6"/>')
    parts.append(f'<rect class="sheet-header" x="{pad}" y="{pad-4}" width="{inner_w}" height="10" rx="2"/>')
    for i, n in enumerate(nums):
        r, c = i // cols, i % cols
        cx = pad + c * cell_w + cell_w / 2
        cy = pad + 14 + r * cell_h + cell_h / 2
        rifa_x = cx - RIFA_W / 2
        rifa_y = cy - RIFA_H / 2
        parts.append(
            f'<use href="#rifaImg" x="{rifa_x:.1f}" y="{rifa_y:.1f}"/>'
        )
        parts.append(
            f'<rect class="num-bg" x="{cx-12:.1f}" y="{cy-7:.1f}" width="24" height="14" rx="3"/>'
        )
        parts.append(f'<text class="num" x="{cx:.1f}" y="{cy+4:.1f}">{n}</text>')
    # cut lines (dashed) between rows/cols
    for r in range(1, rows):
        y = pad + 14 + r * cell_h
        parts.append(
            f'<line class="cut-guide" x1="{pad}" y1="{y:.1f}" x2="{pad+inner_w}" y2="{y:.1f}"/>'
        )
    for c in range(1, cols):
        x = pad + c * cell_w
        parts.append(
            f'<line class="cut-guide" x1="{x:.1f}" y1="{pad+14}" x2="{x:.1f}" y2="{pad+14+inner_h}"/>'
        )
    return "\n      ".join(parts)


def build_svg(lang):
    s = STRINGS[lang]
    sheet_w, sheet_h = 200, 260

    # 3 sheets side by side for stage 1
    sheet_pages = ["", "", ""]
    for i, nums in enumerate(SHEETS_NUMS):
        sheet_pages[i] = make_sheet(nums, sheet_w, sheet_h)

    # stack (just sheet 1, with shadow copies behind)
    stack_sheet = make_sheet(SHEETS_NUMS[0], sheet_w, sheet_h)

    # strips for stage 4
    strip_w = 96
    strip_h = sheet_h - 20
    strip_groups = []
    strip_data = [
        (0, list(range(1, 11)), "#eef6ff", "#1f6feb"),
        (1, list(range(11, 21)), "#fff5ed", "#c45e00"),
        (2, list(range(21, 31)), "#f3f0ff", "#5b3acc"),
        (3, [71, 72, 73, 74, 75, 76, 77, 78, 79, 80], "#ecf9f0", "#1a7f37"),
    ]
    for col, nums, fill, accent in strip_data:
        x = col * (strip_w + 12)
        items = [f'<rect class="strip" x="{x}" y="0" width="{strip_w}" height="{strip_h}" rx="4" fill="{fill}" stroke="#d2d2d7"/>']
        items.append(f'<rect x="{x}" y="0" width="3" height="{strip_h}" fill="{accent}"/>')
        for i, n in enumerate(nums):
            y = 12 + i * 22
            cx = x + strip_w / 2
            items.append(
                f'<use href="#rifaStrip" x="{x+10}" y="{y-7}"/>'
            )
            items.append(f'<text class="strip-num" x="{cx+12}" y="{y+5}" fill="{accent}">{n}</text>')
        strip_groups.append("\n      ".join(items))

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 380" width="760" height="380" font-family="Inter, -apple-system, sans-serif">
  <defs>
    <image id="rifaImg" href="{RIFA_HREF}" width="{RIFA_W}" height="{RIFA_H:.1f}" preserveAspectRatio="xMidYMid meet"/>
    <image id="rifaStrip" href="{RIFA_HREF}" width="60" height="16" preserveAspectRatio="xMidYMid meet" opacity="0.55"/>
  </defs>
  <style>
    .bg {{ fill: #fafafa; }}
    .sheet {{ fill: #ffffff; stroke: #d2d2d7; stroke-width: 1; filter: drop-shadow(0 2px 4px rgba(16,24,40,0.08)); }}
    .sheet-header {{ fill: #eef6ff; }}
    .cut-guide {{ stroke: #c0c0c5; stroke-dasharray: 3 3; stroke-width: 0.7; }}
    .num-bg {{ fill: rgba(255,255,255,0.92); stroke: #d2d2d7; stroke-width: 0.5; }}
    .num {{ font-size: 11px; font-weight: 700; fill: #16161a; text-anchor: middle; }}
    .strip-num {{ font-size: 11px; font-weight: 700; text-anchor: middle; }}
    .strip {{ filter: drop-shadow(0 1px 2px rgba(16,24,40,0.06)); }}
    .label {{ fill: #6e6e78; font-size: 12px; }}
    .title {{ fill: #16161a; font-size: 14px; font-weight: 600; text-anchor: middle; }}
    .footer {{ fill: #8b949e; font-size: 11px; text-anchor: middle; font-style: italic; }}

    @keyframes ph-pages   {{ 0%, 22% {{ opacity: 1 }} 28%, 100% {{ opacity: 0 }} }}
    @keyframes ph-stack   {{ 0%, 22% {{ opacity: 0 }} 28%, 50% {{ opacity: 1 }} 56%, 100% {{ opacity: 0 }} }}
    @keyframes ph-cut     {{ 0%, 50% {{ opacity: 0 }} 56%, 70% {{ opacity: 1 }} 76%, 100% {{ opacity: 0 }} }}
    @keyframes ph-strips  {{ 0%, 70% {{ opacity: 0 }} 76%, 100% {{ opacity: 1 }} }}

    #stage-pages  {{ animation: ph-pages   8s ease-in-out infinite; }}
    #stage-stack  {{ animation: ph-stack   8s ease-in-out infinite; }}
    #stage-cut    {{ animation: ph-cut     8s ease-in-out infinite; }}
    #stage-strips {{ animation: ph-strips  8s ease-in-out infinite; }}

    @keyframes blade-anim {{ 0%, 56% {{ transform: translateX(0) }} 70% {{ transform: translateX(220px) }} 100% {{ transform: translateX(220px) }} }}
    .blade {{ animation: blade-anim 8s ease-in-out infinite; transform-origin: 0 0; }}

    @keyframes fan-1 {{ 0%, 70% {{ transform: translate(70px, 60px) }} 76%, 100% {{ transform: translate(0, 0) }} }}
    @keyframes fan-2 {{ 0%, 70% {{ transform: translate(70px, 60px) }} 76%, 100% {{ transform: translate(0, 0) }} }}
    @keyframes fan-3 {{ 0%, 70% {{ transform: translate(70px, 60px) }} 76%, 100% {{ transform: translate(0, 0) }} }}
    @keyframes fan-4 {{ 0%, 70% {{ transform: translate(70px, 60px) }} 76%, 100% {{ transform: translate(0, 0) }} }}
  </style>

  <rect class="bg" x="0" y="0" width="760" height="380"/>
  <text class="title" x="380" y="28">{s["title"]}</text>

  <!-- STAGE 1: pages side by side -->
  <g id="stage-pages">
    <text class="label" x="380" y="50" text-anchor="middle">{s["stage_pages"]}</text>
    <g transform="translate(60,70)">
      {sheet_pages[0]}
      <text class="label" x="100" y="280" text-anchor="middle">{s["page"]} 1</text>
    </g>
    <g transform="translate(280,70)">
      {sheet_pages[1]}
      <text class="label" x="100" y="280" text-anchor="middle">{s["page"]} 2</text>
    </g>
    <text class="label" x="510" y="200" font-size="22">…</text>
    <g transform="translate(540,70)">
      {sheet_pages[2]}
      <text class="label" x="100" y="280" text-anchor="middle">{s["page"]} 10</text>
    </g>
  </g>

  <!-- STAGE 2: stack -->
  <g id="stage-stack">
    <text class="label" x="380" y="50" text-anchor="middle">{s["stage_stack"]}</text>
    <g transform="translate(280,70)">
      <rect class="sheet" x="-10" y="-10" width="200" height="260" rx="6" opacity="0.35"/>
      <rect class="sheet" x="-5"  y="-5"  width="200" height="260" rx="6" opacity="0.65"/>
      {stack_sheet}
      <text class="label" x="100" y="280" text-anchor="middle">{s["stack"]}</text>
    </g>
  </g>

  <!-- STAGE 3: cut -->
  <g id="stage-cut">
    <text class="label" x="380" y="50" text-anchor="middle">{s["stage_cut"]}</text>
    <g transform="translate(280,70)">
      <rect class="sheet" x="-10" y="-10" width="200" height="260" rx="6" opacity="0.35"/>
      <rect class="sheet" x="-5"  y="-5"  width="200" height="260" rx="6" opacity="0.65"/>
      {stack_sheet}
      <g class="blade">
        <line x1="-25" y1="-15" x2="-25" y2="270" stroke="#cf222e" stroke-width="2.5" stroke-linecap="round"/>
        <text x="-25" y="-22" text-anchor="middle" font-size="16" fill="#cf222e">✂</text>
      </g>
    </g>
  </g>

  <!-- STAGE 4: strips fanned out -->
  <g id="stage-strips">
    <text class="label" x="380" y="50" text-anchor="middle">{s["stage_strips"]}</text>
    <g transform="translate(192,70)">
      {strip_groups[0]}
      {strip_groups[1]}
      {strip_groups[2]}
      <text class="label" x="345" y="125" font-size="20">…</text>
      {strip_groups[3]}
    </g>
  </g>

  <text class="footer" x="380" y="365">{s["footer"]}</text>
</svg>
"""


for lang in ("en", "pt"):
    out = HERE / f"stack-and-cut-{lang}.svg"
    out.write_text(build_svg(lang))
    print(f"wrote {out} ({out.stat().st_size} bytes)")
