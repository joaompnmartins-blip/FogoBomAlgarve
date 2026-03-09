const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, Header, Footer, PageNumber, NumberFormat,
  LevelFormat, UnderlineType
} = require('docx');
const fs = require('fs');

// ── Data passed via stdin as JSON ──────────────────────────────────────────
const raw = fs.readFileSync('/dev/stdin', 'utf8');
const d = JSON.parse(raw);

// ── Helpers ────────────────────────────────────────────────────────────────
const BRAND   = "D05C1E"; // orange brand colour
const GREY_BG = "F5F5F5";
const BLUE_BG = "EAF2FB";
const W       = 9026;     // A4 content width in DXA (1" margins)

function empty(s) { return !s || String(s).trim() === "" || s === "None"; }
function val(s, fallback) { return empty(s) ? (fallback || "—") : String(s).trim(); }

const border  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, opts = {}) {
  const { bold = false, shade = null, span = 1, w: cw = null, align = AlignmentType.LEFT, size = 20 } = opts;
  return new TableCell({
    borders,
    columnSpan: span,
    width: cw ? { size: cw, type: WidthType.DXA } : undefined,
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, size, font: "Arial" })]
    })]
  });
}

function labelCell(text) {
  return cell(text, { bold: true, shade: GREY_BG, size: 18 });
}

function row2(label, value) {
  return new TableRow({ children: [labelCell(label), cell(val(value))] });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 320, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND, space: 1 } },
    children: [new TextRun({ text, bold: true, size: 26, color: BRAND, font: "Arial" })]
  });
}

function twoCol(pairs) {
  // pairs = [[label, value], [label, value]] — renders as 4-column row
  const cols = [W/4, W/4, W/4, W/4];
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: cols,
    rows: pairs.map(pair => new TableRow({
      children: [
        labelCell(pair[0][0]),
        cell(val(pair[0][1])),
        labelCell(pair[1][0]),
        cell(val(pair[1][1])),
      ]
    }))
  });
}

// ── Title block ─────────────────────────────────────────────────────────────
const titleBlock = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: "🔥  PLANO OPERACIONAL DE QUEIMA", bold: true, size: 40, color: BRAND, font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: `Relatório #${val(d.bp_id)}`, size: 24, color: "666666", font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
    children: [new TextRun({ text: `Gerado em ${new Date().toLocaleDateString('pt-PT', {day:'2-digit',month:'long',year:'numeric'})}`, size: 20, color: "999999", font: "Arial", italics: true })]
  }),
];

// ── 1. Identificação ─────────────────────────────────────────────────────────
const identification = [
  sectionHeading("1. Identificação"),
  new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W/2, W/2],
    rows: [
      new TableRow({ children: [labelCell("Pré-Plano associado"), cell(val(d.preplan_name))] }),
      new TableRow({ children: [labelCell("Parcela(s)"), cell(val(d.parcel_names))] }),
      new TableRow({ children: [labelCell("Responsável"), cell(val(d.responsible))] }),
      new TableRow({ children: [labelCell("Data de Execução"), cell(val(d.execution_date))] }),
    ]
  }),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
];

// ── 2. Equipa ────────────────────────────────────────────────────────────────
const vd = d.vehicles || {};
const equipa = [
  sectionHeading("2. Equipa e Meios"),
  twoCol([
    [["Nº de Homens", d.num_men], ["Operacionais", (d.operatives || []).join(", ") || "—"]],
    [["VFCI", vd.VFCI ?? "0"], ["VFCM", vd.VFCM ?? "0"]],
    [["Outros veículos", vd.Outro], ["", ""]],
  ]),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
];

// ── 3. Problemas identificados ───────────────────────────────────────────────
const problemasText = (d.problems || []).length ? d.problems.join("; ") : "Nenhum problema identificado";
const problemas = [
  sectionHeading("3. Problemas Identificados"),
  new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [
      new TableRow({ children: [cell(problemasText, { span: 1 })] })
    ]
  }),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
];

// ── 4. Humidade dos combustíveis ─────────────────────────────────────────────
const humidade = [
  sectionHeading("4. Humidade dos Combustíveis"),
  twoCol([
    [["Superficial (%)", d.fuel_superficial], ["Manta morta F (%)", d.fuel_manta_f]],
    [["Manta morta H (%)", d.fuel_manta_h], ["", ""]],
  ]),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
];

// ── 5. Meteorologia ──────────────────────────────────────────────────────────
const meteo = [
  sectionHeading("5. Meteorologia"),
  twoCol([
    [["Estado do tempo", d.weather_state], ["Direção do vento", d.wind_direction]],
    [["Vel. vento (Beaufort)", d.wind_speed_beaufort], ["Vel. vento (km/h)", d.wind_speed_kmh]],
    [["Condução do fogo", d.fire_conduct], ["Descrição (se 'Outro')", d.fire_conduct_other]],
  ]),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
];

// ── 6. Efeitos e Eficácia ────────────────────────────────────────────────────
const resultados = [
  sectionHeading("6. Efeitos e Eficácia"),
  new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W/2, W/2],
    rows: [
      new TableRow({ children: [labelCell("Efeitos da queima"), labelCell("Eficácia da ação")] }),
      new TableRow({ children: [
        cell(val(d.burn_effects, "Não registado")),
        cell(val(d.burn_efficiency, "Não registado")),
      ]}),
    ]
  }),
  new Paragraph({ spacing: { after: 160 }, children: [] }),
];

// ── 7. Notas adicionais ──────────────────────────────────────────────────────
const notesRows = [];
if (!empty(d.notes)) {
  notesRows.push(sectionHeading("7. Notas Adicionais"));
  notesRows.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({ children: [cell(val(d.notes))] })]
  }));
  notesRows.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
}

// ── 8. Assinaturas ───────────────────────────────────────────────────────────
const sigLine = (label) => new TableCell({
  borders,
  width: { size: W / 2, type: WidthType.DXA },
  margins: { top: 80, bottom: 80, left: 140, right: 140 },
  children: [
    new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: label, bold: true, size: 18, font: "Arial" })] }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "999999" } },
      spacing: { before: 20 },
      children: [new TextRun({ text: "Assinatura / Data", size: 16, color: "999999", italics: true, font: "Arial" })]
    })
  ]
});

const assinaturas = [
  sectionHeading("8. Assinaturas"),
  new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W/2, W/2],
    rows: [new TableRow({ children: [sigLine("Responsável da Queima"), sigLine("Técnico de Fogo Controlado")] })]
  }),
];

// ── Document assembly ────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },  // A4
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND, space: 1 } },
          spacing: { after: 160 },
          children: [new TextRun({ text: `Fogo Bom Algarve  |  Plano de Queima #${val(d.bp_id)}`, size: 16, color: "888888", font: "Arial" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
          children: [
            new TextRun({ text: "Página ", size: 16, color: "888888", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888", font: "Arial" }),
            new TextRun({ text: " de ", size: 16, color: "888888", font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "888888", font: "Arial" }),
          ]
        })]
      })
    },
    children: [
      ...titleBlock,
      ...identification,
      ...equipa,
      ...problemas,
      ...humidade,
      ...meteo,
      ...resultados,
      ...notesRows,
      ...assinaturas,
    ]
  }]
});

const outPath = process.argv[2] || '/tmp/bp_report.docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('OK:' + outPath);
}).catch(e => {
  console.error('ERROR:' + e.message);
  process.exit(1);
});
