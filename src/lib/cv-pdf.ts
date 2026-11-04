import { PDFDocument, PageSizes, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { isCvSectionHeading } from "./cv-analysis";

type PdfFonts = { regular: Uint8Array; bold: Uint8Array };

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const joined = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(joined, size) <= max) {
      line = joined;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    let width = 0;
    for (const character of word) {
      const next = font.widthOfTextAtSize(character, size);
      if (width + next > max && line) {
        lines.push(line);
        line = "";
        width = 0;
      }
      line += character;
      width += next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createCvPdf(
  draft: string,
  job: { title: string; organization: string },
  fontBytes: PdfFonts,
) {
  if (!draft.trim() || draft.length > 24000)
    throw new Error("El borrador debe contener entre 1 y 24 000 caracteres.");
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(fontBytes.regular, { subset: true });
  const bold = await pdf.embedFont(fontBytes.bold, { subset: true });
  const supported = new Set(regular.getCharacterSet());
  if (
    [...`${draft}${job.title}${job.organization}`].some(
      (character) =>
        !/\s/.test(character) && !supported.has(character.codePointAt(0)!),
    )
  ) {
    throw new Error(
      "El borrador contiene símbolos que esta tipografía no representa. Descarga el TXT para conservarlos completos.",
    );
  }
  const [width, height] = PageSizes.A4;
  const margin = 48;
  const measure = width - margin * 2;
  const ink = rgb(0.1, 0.16, 0.24);
  let page = pdf.addPage(PageSizes.A4);
  let y = height - margin;
  function space(required: number) {
    if (y - required >= margin + 14) return;
    if (pdf.getPageCount() >= 30)
      throw new Error(
        "El borrador supera las 30 páginas. Revisa los saltos de línea o descarga el TXT.",
      );
    page = pdf.addPage(PageSizes.A4);
    y = height - margin;
  }
  function paragraph(
    text: string,
    font: PDFFont,
    size: number,
    leading: number,
  ) {
    const lines = wrap(text, font, size, measure);
    space(Math.min(2, lines.length) * leading);
    for (const line of lines) {
      space(leading);
      page.drawText(line, { x: margin, y, font, size, color: ink });
      y -= leading;
    }
  }
  pdf.setTitle("Currículum vitae");
  pdf.setCreator("Convoca Perú");
  pdf.setLanguage("es-PE");
  paragraph("Currículum vitae", bold, 20, 28);
  paragraph(`Postulación a ${job.title}`, regular, 10, 15);
  paragraph(job.organization, regular, 10, 15);
  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.6,
    color: rgb(0.75, 0.78, 0.82),
  });
  y -= 22;
  let blank = false;
  let first = true;
  const lines = draft.replace(/\r\n?/g, "\n").split("\n");
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) {
      if (!blank) y -= 8;
      blank = true;
      continue;
    }
    blank = false;
    const heading = isCvSectionHeading(line);
    if (line.trim().length < 100 && lines[index + 1]?.trim()) space(45);
    if (heading) {
      space(48);
      y -= 6;
    }
    const prominent = first && !heading && line.trim().length < 80;
    paragraph(
      line,
      heading || prominent ? bold : regular,
      prominent ? 14 : heading ? 11.5 : 10.5,
      prominent ? 20 : 15,
    );
    first = false;
  }
  const pages = pdf.getPages();
  pages.forEach((sheet, index) => {
    const label = `${index + 1} / ${pages.length}`;
    sheet.drawText(label, {
      x: width - margin - regular.widthOfTextAtSize(label, 8),
      y: 28,
      font: regular,
      size: 8,
      color: rgb(0.35, 0.4, 0.47),
    });
  });
  return pdf.save();
}
