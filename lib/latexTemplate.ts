/**
 * Builds a complete styled LaTeX document
 */

function escapeLatexTitle(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([%_#&{}$])/g, "\\$1")
    .replace(/\~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function buildLatexDocument(body: string, title: string): string {
  const escapedTitle = escapeLatexTitle(title);

  return `\\documentclass[a4paper,11pt]{article}
\\usepackage[margin=2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{physics}
\\usepackage{siunitx}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{parskip}

% Define accent color
\\definecolor{accent}{HTML}{FF4F00}

% Style sections
\\titleformat{\\section}{\\Large\\bfseries\\color{accent}}{}{0pt}{}
\\titleformat{\\subsection}{\\large\\bfsform}{}{0pt}{}

% Hyperref setup
\\hypersetup{
  colorlinks=true,
  linkcolor=black,
  urlcolor=blue
}

\\begin{document}
\\pagestyle{plain}

% Title
{\\huge\\bfseries ${escapedTitle}\\par}
\\vspace{1em}
\\hrule
\\vspace{1em}

% Body content
${body}

\\end{document}`;
}
