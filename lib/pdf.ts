"use client";

import type { Note } from "@/types/app";
import { MODULE_NAME_MAP } from "@/lib/modules";

interface PdfOptions {
  containerId: string;
}

const PDF_FETCH_TIMEOUT_MS = 15_000;

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (match) => `\\${match}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function convertMarkdownToLatex(markdown: string): string {
  let latex = markdown;

  // Protect inline math $...$ and display math $$...$$
  const mathBlocks: string[] = [];
  latex = latex.replace(/\$\$[\s\S]+?\$\$/g, (match) => {
    mathBlocks.push(match);
    return `__MATH_BLOCK_${mathBlocks.length - 1}__`;
  });
  latex = latex.replace(/\$[^$\n]+?\$/g, (match) => {
    mathBlocks.push(match);
    return `__MATH_INLINE_${mathBlocks.length - 1}__`;
  });

  // Convert headers
  latex = latex.replace(/^### (.*?)$/gm, (_, text) => `\\subsubsection{${escapeLatex(text)}}`);
  latex = latex.replace(/^## (.*?)$/gm, (_, text) => `\\subsection{${escapeLatex(text)}}`);
  latex = latex.replace(/^# (.*?)$/gm, (_, text) => `\\section{${escapeLatex(text)}}`);

  // Convert bold and italic
  latex = latex.replace(/\*\*\*(.*?)\*\*\*/g, (_, text) => `\\textbf{\\textit{${escapeLatex(text)}}}`);
  latex = latex.replace(/\*\*(.*?)\*\*/g, (_, text) => `\\textbf{${escapeLatex(text)}}`);
  latex = latex.replace(/\*(.*?)\*/g, (_, text) => `\\textit{${escapeLatex(text)}}`);

  // Convert code blocks
  latex = latex.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `\\begin{lstlisting}\n${code}\\end{lstlisting}`;
  });

  // Convert inline code
  latex = latex.replace(/`([^`]+)`/g, (_, code) => `\\texttt{${escapeLatex(code)}}`);

  // Convert lists
  latex = latex.replace(/^- (.*?)$/gm, (_, text) => `\\item ${text}`);
  latex = latex.replace(/((?:\\item .*?\n)+)/g, (match) => `\\begin{itemize}\n${match}\\end{itemize}\n`);

  // Restore math blocks
  latex = latex.replace(/__MATH_BLOCK_(\d+)__/g, (_, index) => {
    const math = mathBlocks[parseInt(index)];
    return `\\[\n${math.slice(2, -2)}\n\\]`;
  });
  latex = latex.replace(/__MATH_INLINE_(\d+)__/g, (_, index) => {
    const math = mathBlocks[parseInt(index)];
    return `$${math.slice(1, -1)}$`;
  });

  return latex;
}

function generateLatexDocument(note: Note): string {
  const moduleName = MODULE_NAME_MAP[note.module] || note.module;
  const formattedDate = new Date(note.updatedAt).toLocaleDateString("de-DE");
  const tags = note.tags.map(escapeLatex).join(", ");

  const content = convertMarkdownToLatex(note.content);

  return `\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[ngerman]{babel}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsfonts}
\\usepackage{physics}
\\usepackage{siunitx}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage[left=2.5cm,right=2.5cm,top=2.5cm,bottom=2.5cm]{geometry}

% Listings setup
\\lstset{
  basicstyle=\\ttfamily\\small,
  breaklines=true,
  frame=single,
  backgroundcolor=\\color{gray!10}
}

% Hyperref setup
\\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=blue
}

\\title{${escapeLatex(note.title)}}
\\author{${escapeLatex(moduleName)}}
\\date{${formattedDate}}

\\begin{document}

\\maketitle

\\noindent\\textbf{Modul:} ${escapeLatex(moduleName)} \\\\
\\textbf{Tags:} ${tags || "---"} \\\\
\\textbf{Erstellt:} ${new Date(note.createdAt).toLocaleDateString("de-DE")} \\\\
\\textbf{Aktualisiert:} ${formattedDate}

\\bigskip
\\hrule
\\bigskip

${content}

\\end{document}`;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = PDF_FETCH_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function showFallbackMessage(message: string) {
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(message);
    return;
  }
  console.warn(message);
}

export async function exportNoteToPdf(note: Note, { containerId }: PdfOptions) {
  if (typeof window === "undefined") return;

  const latexContent = generateLatexDocument(note);
  const safeDate = note.updatedAt.split("T")[0];
  const baseFilename = `${safeDate}-${note.title.replace(/[^a-zA-Z0-9-_]+/g, "-")}`;

  let pdfBlob: Blob | null = null;

  const tryCompile = async (label: string, request: () => Promise<Response>) => {
    try {
      console.log(`Trying ${label}...`);
      const response = await request();
      if (response.ok && response.headers.get("content-type")?.includes("pdf")) {
        const blob = await response.blob();
        if (blob.size > 0) {
          console.log(`✓ Compiled with ${label}`);
          return blob;
        }
      }
      console.warn(`${label} returned non-PDF response (${response.status})`);
      return null;
    } catch (error) {
      const suffix = error instanceof Error ? error.message : String(error);
      console.warn(`${label} failed:`, suffix);
      return null;
    }
  };

  // 1. Try TeXLive.net first
  pdfBlob = await tryCompile("TeXLive.net", async () => {
    const formData = new FormData();
    formData.append("filecontents[]", latexContent);
    formData.append("filename[]", "main.tex");
    formData.append("engine", "pdflatex");
    formData.append("return", "pdf");

    return fetchWithTimeout("https://texlive.net/cgi-bin/latexcgi", {
      method: "POST",
      body: formData
    });
  });

  // 2. Try LaTeX.Online if TeXLive failed
  if (!pdfBlob) {
    pdfBlob = await tryCompile("LaTeX.Online", () =>
      fetchWithTimeout(
        `https://latexonline.cc/compile?text=${encodeURIComponent(latexContent)}&command=pdflatex`,
        { method: "GET" }
      )
    );
  }

  // 3. Try local compilation if online services failed
  if (!pdfBlob) {
    pdfBlob = await tryCompile("local compilation", () =>
      fetchWithTimeout("/api/compile-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ latexContent })
      })
    );
  }

  // 4. If we have a PDF, download it
  if (pdfBlob && pdfBlob.size > 0) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseFilename}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return;
  }

  // 5. Final fallback: Download .tex file
  console.error("All compilation methods failed");
  const blob = new Blob([latexContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseFilename}.tex`;
  link.click();
  URL.revokeObjectURL(url);

  showFallbackMessage(
    `PDF-Kompilierung fehlgeschlagen.\n\nFallback: .tex Datei wurde heruntergeladen.\n\nKompiliere sie auf:\n• https://overleaf.com (Upload → Compile)\n• https://www.latex4technics.com (Paste → Compile)`
  );
}
