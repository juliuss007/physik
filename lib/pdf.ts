"use client";

import type { Note } from "@/types/app";
import { MODULE_NAME_MAP } from "@/lib/modules";

interface PdfOptions {
  containerId: string;
}

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

export async function exportNoteToPdf(note: Note, { containerId }: PdfOptions) {
  if (typeof window === "undefined") return;

  const latexContent = generateLatexDocument(note);
  const safeDate = note.updatedAt.split("T")[0];
  const baseFilename = `${safeDate}-${note.title.replace(/[^a-zA-Z0-9-_]+/g, "-")}`;

  let pdfBlob: Blob | null = null;

  // 1. Try TeXLive.net first
  try {
    console.log("Trying TeXLive.net...");
    const formData = new FormData();
    formData.append("filecontents[]", latexContent);
    formData.append("filename[]", "main.tex");
    formData.append("engine", "pdflatex");
    formData.append("return", "pdf");

    const response = await fetch("https://texlive.net/cgi-bin/latexcgi", {
      method: "POST",
      body: formData,
    });

    if (response.ok && response.headers.get("content-type")?.includes("pdf")) {
      pdfBlob = await response.blob();
      console.log("✓ Compiled with TeXLive.net");
    }
  } catch (error) {
    console.warn("TeXLive.net failed:", error);
  }

  // 2. Try LaTeX.Online if TeXLive failed
  if (!pdfBlob) {
    try {
      console.log("Trying LaTeX.Online...");
      const response = await fetch(
        `https://latexonline.cc/compile?text=${encodeURIComponent(latexContent)}&command=pdflatex`,
        { method: "GET" }
      );

      if (response.ok && response.headers.get("content-type")?.includes("pdf")) {
        pdfBlob = await response.blob();
        console.log("✓ Compiled with LaTeX.Online");
      }
    } catch (error) {
      console.warn("LaTeX.Online failed:", error);
    }
  }

  // 3. Try local compilation if online services failed
  if (!pdfBlob) {
    try {
      console.log("Trying local compilation...");
      const response = await fetch("/api/compile-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latexContent }),
      });

      if (response.ok) {
        pdfBlob = await response.blob();
        console.log("✓ Compiled locally");
      }
    } catch (error) {
      console.warn("Local compilation failed:", error);
    }
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

  alert(
    `PDF-Kompilierung fehlgeschlagen.\n\nFallback: .tex Datei wurde heruntergeladen.\n\nKompiliere sie auf:\n• https://overleaf.com (Upload → Compile)\n• https://www.latex4technics.com (Paste → Compile)`
  );
}
