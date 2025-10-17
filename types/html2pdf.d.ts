declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Partial<import("html2canvas").Options>;
    jsPDF?: import("jspdf").jsPDFOptions & {
      format?: string | number[];
      unit?: string;
      orientation?: "portrait" | "landscape";
    };
    pagebreak?: {
      mode?: string | string[];
      avoid?: string | string[];
      after?: string | string[];
      before?: string | string[];
    };
  }

  type Html2PdfSource = string | HTMLElement;

  interface Html2PdfInstance {
    from(element: Html2PdfSource, type?: string): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    outputPdf(): Promise<Blob>;
    save(filename?: string): Promise<void>;
    toPdf(): Html2PdfInstance;
    get(type?: string): unknown;
  }

  interface Html2PdfFactory {
    (): Html2PdfInstance;
    (element: Html2PdfSource, options?: Html2PdfOptions): Promise<void>;
  }

  const html2pdf: Html2PdfFactory;
  export default html2pdf;
  export type { Html2PdfOptions, Html2PdfInstance, Html2PdfFactory };
}
