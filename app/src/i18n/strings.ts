export type Lang = 'pt' | 'en';

export const dict = {
  appName: { pt: 'rifas-toolkit', en: 'rifas-toolkit' },
  tagline: {
    pt: 'Gera PDFs imprimíveis de rifas a partir de um template, com numeração que facilita o corte em massa.',
    en: 'Generate printable raffle ticket PDFs from a template, with numbering that makes bulk cutting effortless.',
  },

  // header
  themeLight: { pt: 'Claro', en: 'Light' },
  themeDark: { pt: 'Escuro', en: 'Dark' },
  github: { pt: 'GitHub', en: 'GitHub' },
  reset: { pt: 'Trocar / limpar', en: 'Change / reset' },
  confirmReset: { pt: 'Limpar tudo (template + config)?', en: 'Clear everything (template + config)?' },

  // upload
  step1: { pt: '1. Upload do template', en: '1. Upload template' },
  dropPdf: { pt: 'Arrasta o PDF da rifa aqui', en: 'Drop the raffle PDF here' },
  or: { pt: 'ou', en: 'or' },
  chooseFile: { pt: 'Escolher ficheiro', en: 'Choose file' },
  uploadHint: {
    pt: 'PDF de uma rifa, qualquer tamanho. Vamos colocá-la N vezes em A4.',
    en: 'A single-raffle PDF, any size. We will tile it onto A4 sheets.',
  },

  // tabs
  tabSlots: { pt: '2. Marcar números na rifa', en: '2. Mark number positions' },
  tabPreview: { pt: '3. Pré-visualizar A4', en: '3. Preview A4' },

  // slot editor
  addSlot: { pt: '+ Adicionar posição', en: '+ Add position' },
  deleteSelected: { pt: 'Apagar selecionado', en: 'Delete selected' },
  slotsCount: {
    pt: (n: number) => `${n} posiç${n === 1 ? 'ão' : 'ões'} · clica numa para editar`,
    en: (n: number) => `${n} position${n === 1 ? '' : 's'} · click one to edit`,
  },
  slotEmptyHint: {
    pt: 'Clica em "+ Adicionar posição" e arrasta sobre a rifa para o sítio onde queres o número.',
    en: 'Click "+ Add position" and drag it over the raffle to where you want the number.',
  },

  // inspector
  selectedSlot: { pt: 'Posição selecionada', en: 'Selected position' },
  inspectorEmpty: {
    pt: 'Clica numa posição no preview para editar.',
    en: 'Click a position on the preview to edit it.',
  },
  rotation: { pt: 'Rotação°', en: 'Rotation°' },
  font: { pt: 'Fonte (pt)', en: 'Font (pt)' },
  color: { pt: 'Cor', en: 'Color' },
  black: { pt: 'preto', en: 'black' },
  red: { pt: 'vermelho', en: 'red' },

  // layout
  layout: { pt: 'Layout da página', en: 'Page layout' },
  suggestionsHint: { pt: 'Sugestões (clica para aplicar):', en: 'Suggestions (click to apply):' },
  rows: { pt: 'Linhas', en: 'Rows' },
  cols: { pt: 'Colunas', en: 'Columns' },
  a4: { pt: 'A4', en: 'A4' },
  portrait: { pt: 'retrato', en: 'portrait' },
  landscape: { pt: 'paisagem', en: 'landscape' },
  rifaOrient: { pt: 'Rifa', en: 'Ticket' },
  fillOrder: { pt: 'Ordem de preenchimento', en: 'Fill order' },
  fillHorizontal: {
    pt: 'horizontal (linhas primeiro)',
    en: 'horizontal (rows first)',
  },
  fillVertical: {
    pt: 'vertical (colunas primeiro)',
    en: 'vertical (columns first)',
  },
  margins: { pt: 'Margens (mm)', en: 'Margins (mm)' },
  top: { pt: 'Topo', en: 'Top' },
  right: { pt: 'Direita', en: 'Right' },
  bottom: { pt: 'Fundo', en: 'Bottom' },
  left: { pt: 'Esquerda', en: 'Left' },
  gapX: { pt: 'Gap X (mm)', en: 'Gap X (mm)' },
  gapY: { pt: 'Gap Y (mm)', en: 'Gap Y (mm)' },
  cutLines: { pt: 'Linhas de corte', en: 'Cut lines' },

  // numbering
  numbering: { pt: 'Numeração', en: 'Numbering' },
  totalRifas: { pt: 'Total de rifas', en: 'Total tickets' },
  startNumber: { pt: 'Começar em', en: 'Start at' },
  pagesPerSet: { pt: 'Páginas por set', en: 'Pages per set' },
  pagesPerSetHelp: {
    pt: 'Empilha este nº de páginas e corta — as rifas saem em ordem.',
    en: 'Stack this many pages and cut — tickets come out in order.',
  },
  padding: { pt: 'Padding (zeros)', en: 'Padding (zeros)' },
  numberingSummary: {
    pt: (perPage: number, perSet: number, sets: number, total: number, empty: number) =>
      `${perPage}/página · set = ${perSet} rifas · ${sets} sets · ${total} páginas${empty > 0 ? ` · ${empty} células vazias no fim` : ''}`,
    en: (perPage: number, perSet: number, sets: number, total: number, empty: number) =>
      `${perPage}/page · set = ${perSet} tickets · ${sets} sets · ${total} pages${empty > 0 ? ` · ${empty} empty cells at the end` : ''}`,
  },
  header: { pt: 'Cabeçalho', en: 'Header' },
  variables: { pt: 'Variáveis:', en: 'Variables:' },
  headerSize: { pt: 'Tamanho cabeçalho (pt)', en: 'Header size (pt)' },

  // generate
  generate: { pt: 'Gerar', en: 'Generate' },
  previewOnePage: { pt: 'Descarregar 1 página', en: 'Download 1-page sample' },
  generatePdf: { pt: 'Gerar PDF completo', en: 'Generate full PDF' },
  generating: {
    pt: (a: number, b: number) => `Gerando ${a}/${b}…`,
    en: (a: number, b: number) => `Generating ${a}/${b}…`,
  },
  needTemplate: { pt: 'Faz upload do template primeiro.', en: 'Upload a template first.' },
  needSlot: { pt: 'Adiciona pelo menos uma posição.', en: 'Add at least one position.' },

  // preview
  previewIdle: {
    pt: 'Adiciona pelo menos uma posição para ver o preview.',
    en: 'Add at least one position to see the preview.',
  },
  previewSummary: {
    pt: (orient: string, r: number, c: number, perPage: number, totalPages: number) =>
      `A4 ${orient} · ${r}×${c} · ${perPage}/pág · ${totalPages} páginas no PDF final · esta é a página 1 (set 1)`,
    en: (orient: string, r: number, c: number, perPage: number, totalPages: number) =>
      `A4 ${orient} · ${r}×${c} · ${perPage}/page · ${totalPages} pages in final PDF · this is page 1 (set 1)`,
  },
  rendering: { pt: 'a renderizar…', en: 'rendering…' },

  // footer
  footerLine: {
    pt: 'Tudo corre no browser. Nada é enviado para servidor.',
    en: 'Everything runs in the browser. Nothing is sent to a server.',
  },
} as const;

export type DictKey = keyof typeof dict;
