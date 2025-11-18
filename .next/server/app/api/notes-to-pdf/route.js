"use strict";(()=>{var e={};e.id=28,e.ids=[28],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},59184:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>u,serverHooks:()=>m,staticGenerationAsyncStorage:()=>d});var a={};r.r(a),r.d(a,{POST:()=>l,runtime:()=>c});var s=r(49303),n=r(88716),o=r(60670),p=r(87070);function i(e){return e.replace(/\\/g,"\\textbackslash{}").replace(/%/g,"\\%").replace(/\$/g,"\\$").replace(/#/g,"\\#").replace(/&/g,"\\&").replace(/_/g,"\\_").replace(/\{/g,"\\{").replace(/\}/g,"\\}").replace(/~/g,"\\textasciitilde{}").replace(/\^/g,"\\textasciicircum{}").replace(/</g,"\\textless{}").replace(/>/g,"\\textgreater{}")}let c="nodejs";async function l(e){try{let t=await e.json();if(!t.content||"string"!=typeof t.content||""===t.content.trim())return p.NextResponse.json({error:"Missing content"},{status:400});if(t.content.length>5e4)return p.NextResponse.json({error:"Content too large (max 50k characters)"},{status:413});let r=t.content,a=t.title?.trim()||"Notizen",s=(a.trim().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae").replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss").replace(/\s+/g,"_").replace(/[^\w\-_.]/g,"").replace(/_{2,}/g,"_").substring(0,200)||"Notizen")+".pdf",n=function(e){let t=[],r=e,a=(r=(r=(r=(r=(r=(r=(r=(r=r.replace(/\$\$([\s\S]+?)\$\$/g,(e,r)=>{let a=`XMATHBLKDISP${t.length}ENDX`;return t.push({id:a,content:r.trim(),type:"display"}),` ${a} `})).replace(/\$([^\n$]+?)\$/g,(e,r)=>{let a=`XMATHBLKINLN${t.length}ENDX`;return t.push({id:a,content:r.trim(),type:"inline"}),a})).replace(/\$/g,"\\$")).replace(/`([^`]+)`/g,(e,t)=>`\\texttt{${i(t)}}`)).replace(/\*\*\*(.+?)\*\*\*/g,(e,t)=>`\\textbf{\\textit{${i(t)}}}`)).replace(/\*\*(.+?)\*\*/g,(e,t)=>`\\textbf{${i(t)}}`)).replace(/\*(.+?)\*/g,(e,t)=>`\\textit{${i(t)}}`)).replace(/_([^_\s]+(?:\s+[^_\s]+)*)_/g,(e,t)=>`\\textit{${i(t)}}`)).split("\n"),s=[],n=!1,o=!1;for(let e of a)if(/^### /.test(e)){let t=e.replace(/^### /,"").trim();s.push(`\\subsection{${t}}`)}else if(/^## /.test(e)){let t=e.replace(/^## /,"").trim();s.push(`\\section{${t}}`)}else if(/^# /.test(e)){let t=e.replace(/^# /,"").trim();s.push(`\\section*{${t}}`)}else if(/^[\-\*]\s+/.test(e)){o&&(s.push("\\end{enumerate}"),o=!1),n||(s.push("\\begin{itemize}"),n=!0);let t=e.replace(/^[\-\*]\s+/,"");s.push(`  \\item ${t}`)}else if(/^\d+\.\s+/.test(e)){n&&(s.push("\\end{itemize}"),n=!1),o||(s.push("\\begin{enumerate}"),o=!0);let t=e.replace(/^\d+\.\s+/,"");s.push(`  \\item ${t}`)}else n&&(s.push("\\end{itemize}"),n=!1),o&&(s.push("\\end{enumerate}"),o=!1),!e.trim()||e.includes("\\")||e.match(/XMATHBLK/)?s.push(e):s.push(i(e));for(let e of(n&&s.push("\\end{itemize}"),o&&s.push("\\end{enumerate}"),r=s.join("\n"),t)){let t;t="display"===e.type?`
\\[
${e.content}
\\]
`:/[+\-*/=<>^_{}[\]()]/.test(e.content)||/\\(?:frac|sum|int|alpha|beta|gamma|theta|phi|pi|sigma|omega|infty|sqrt|cdot|times|div|leq|geq|neq|approx|partial|nabla|Delta)/i.test(e.content)?`\\(${e.content}\\)`:`\\(\\text{${e.content}}\\)`,r.includes(e.id)||console.warn(`Warning: Math block placeholder ${e.id} not found in processed text`),r=r.replace(RegExp(e.id,"g"),t)}let p=r.match(/XMATHBLK(?:DISP|INLN)\d+ENDX/g);return p&&console.error(`Error: Unreplaced math placeholders found: ${p.join(", ")}`),r}(r),o=function(e,t){let r=t.replace(/\\/g,"\\textbackslash{}").replace(/%/g,"\\%").replace(/\$/g,"\\$").replace(/#/g,"\\#").replace(/&/g,"\\&").replace(/_/g,"\\_").replace(/\{/g,"\\{").replace(/\}/g,"\\}").replace(/~/g,"\\textasciitilde{}").replace(/\^/g,"\\textasciicircum{}");return`\\documentclass[a4paper,11pt]{article}

% Page setup
\\usepackage[margin=1.5cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}

% Fonts - Helvetica (modern technical aesthetic)
\\usepackage{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage{courier}  % Courier for monospace

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
{\\LARGE\\bfseries\\color{lighttext}${r}\\par}
\\vspace{0.75em}
{\\color{bordercolor}\\hrule height 1pt}
\\vspace{1em}

% Body content
${e}

\\end{document}`}(n,a),c=new URLSearchParams;c.set("text",o),c.set("download",s);let l=`https://latexonline.cc/compile?${c.toString()}`,u=await fetch(l,{method:"GET",headers:{"User-Agent":"Physik-App/1.0"}}),g=u.headers.get("Content-Type")||"";if(u.ok&&g.startsWith("application/pdf")){let e=await u.arrayBuffer(),t=Buffer.from(e);return new Response(t,{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${s}"`,"Cache-Control":"no-store"}})}if(400===u.status){let e=await u.text();return p.NextResponse.json({error:"Compilation failed",log:e},{status:400})}let d=await u.text();return p.NextResponse.json({error:"Upstream LaTeX service error",status:u.status,details:d},{status:502})}catch(e){return console.error("PDF generation error:",e),p.NextResponse.json({error:"Internal server error",details:e instanceof Error?e.message:String(e)},{status:500})}}let u=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/notes-to-pdf/route",pathname:"/api/notes-to-pdf",filename:"route",bundlePath:"app/api/notes-to-pdf/route"},resolvedPagePath:"/Users/august/Desktop/physik/app/api/notes-to-pdf/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:g,staticGenerationAsyncStorage:d,serverHooks:m}=u,h="/api/notes-to-pdf/route";function f(){return(0,o.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:d})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[948,972],()=>r(59184));module.exports=a})();