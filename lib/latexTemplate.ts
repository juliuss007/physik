/**
 * Builds a complete styled LaTeX document with dark mode aesthetic
 * matching the website's engineering datasheet design
 */

function escapeLatexTitle(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/&/g, "\\&")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function buildLatexDocument(body: string, title: string): string {
  const escapedTitle = escapeLatexTitle(title);

  return `\\documentclass[a4paper,11pt]{article}

% Page setup
\\usepackage[margin=1.5cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}

% Fonts
\\usepackage{lmodern}

% Math packages
\\usepackage{amsmath,amssymb,amsfonts}

% Support for \\text{} in math mode
\\usepackage{amstext}

% Colors - Dark mode
\\usepackage{xcolor}
\\definecolor{darkbg}{HTML}{0a0a0a}
\\definecolor{lighttext}{HTML}{e5e5e5}
\\definecolor{accent}{HTML}{FF4F00}
\\definecolor{bordercolor}{HTML}{333333}

\\pagecolor{darkbg}
\\color{lighttext}

% Section styling
\\usepackage{titlesec}
\\titleformat{\\section}
  {\\large\\bfseries\\color{accent}}
  {}
  {0pt}
  {}
\\titleformat{\\subsection}
  {\\normalsize\\bfseries\\color{accent}}
  {}
  {0pt}
  {}

% Hyperlinks
\\usepackage{hyperref}
\\hypersetup{
  colorlinks=true,
  linkcolor=accent,
  urlcolor=accent
}

% List spacing
\\usepackage{enumitem}
\\setlist{itemsep=0.25em, parsep=0pt, topsep=0.5em}

% Paragraph spacing
\\usepackage{parskip}
\\setlength{\\parskip}{0.5em}
\\setlength{\\parindent}{0pt}

\\begin{document}
\\pagestyle{empty}

% Title block
{\\LARGE\\bfseries\\color{lighttext}${escapedTitle}\\par}
\\vspace{0.75em}
{\\color{bordercolor}\\hrule height 1pt}
\\vspace{1em}

% Body content
${body}

\\end{document}`;
}
