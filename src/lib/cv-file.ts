export async function readCvFile(file: File): Promise<string> {
  if (file.size > 2_000_000 || file.size === 0)
    throw new Error("Elige un archivo de hasta 2 MB que contenga texto.");
  if (/\.txt$/i.test(file.name)) {
    const text = await file.text();
    if (text.includes("\0") || text.includes("\uFFFD"))
      throw new Error("Guarda el TXT con codificación UTF-8 o pega el texto.");
    if (text.length > 24000)
      throw new Error(
        "El CV supera los 24,000 caracteres. Pega una versión más breve.",
      );
    return text;
  }
  if (!/\.pdf$/i.test(file.name))
    throw new Error("Usa un PDF con texto seleccionable o un archivo TXT.");
  const data = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(data.subarray(0, 5)) !== "%PDF-")
    throw new Error("El archivo no es un PDF válido.");
  const pdfjs = await import("pdfjs-dist");
  // Self-hosted, pinned worker. No CDN requests and no document upload.
  const worker = new Worker("/vendor/pdf.worker.min.mjs", { type: "module" });
  const pdfWorker = pdfjs.PDFWorker.create({ port: worker });
  const task = pdfjs.getDocument({
    data,
    worker: pdfWorker,
    useSystemFonts: false,
    disableFontFace: true,
    maxImageSize: 1_000_000,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
    stopAtErrors: true,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const parse = async () => {
      const pdf = await task.promise;
      if (pdf.numPages > 8)
        throw new Error(
          "El CV supera las 8 páginas. Pega solo la información relevante.",
        );
      let text = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p),
          content = await page.getTextContent();
        text +=
          content.items
            .map((item) =>
              "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
            )
            .join("") + "\n";
        page.cleanup();
        if (text.length > 24000)
          throw new Error("El documento supera los 24,000 caracteres.");
      }
      if (text.trim().length < 80)
        throw new Error(
          "No se pudo extraer suficiente texto. Si es un escaneo, copia y pega el contenido; esta herramienta no realiza OCR.",
        );
      return text.trim();
    };
    return await Promise.race([
      parse(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error("El PDF tarda demasiado. Intenta pegar el texto."),
            ),
          15000,
        );
      }),
    ]);
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException")
      throw new Error(
        "El PDF tiene contraseña. Pega el texto o usa una copia sin protección.",
      );
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
    void task.destroy().catch(() => {});
    pdfWorker.destroy();
    worker.terminate();
  }
}
