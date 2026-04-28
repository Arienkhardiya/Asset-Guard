const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// I will just use regex to wrap the elements precisely to avoid JSX closing tag issues.
fileContent = fileContent.replace(
  /\{canSeeScanner \? \(\<>\s*\{\/\* LEFT: Input Panel \*\/\}/, 
  '{/* LEFT: Input Panel */}'
);
fileContent = fileContent.replace(
  /\<\/\>\) : \([\s\S]*?\}\s*\{\/\* MAIN\/RIGHT: Results Dashboard \*\/\}/, 
  '{/* MAIN/RIGHT: Results Dashboard */}'
);
fileContent = fileContent.replace(
  /\{canSeeScanner && \(\<>\s*\{\/\* A\. THREAT SUMMARY \(TOP, BIG\) \*\/\}/, 
  '{/* A. THREAT SUMMARY (TOP, BIG) */}'
);
fileContent = fileContent.replace(
  /\<\/\>\)\}\{canSeeBusiness && \(\<>\s*\{\/\* C\. SPREAD \& BUSINESS IMPACT \*\/\}/, 
  '{/* C. SPREAD & BUSINESS IMPACT */}'
);
fileContent = fileContent.replace(
  /\<\/\>\)\} \s*\<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*\{canSeeLegal && \(\<>/, 
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">'
);

// We need to completely wipe any broken jsx and restore plain original layout from App.tsx.
const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
fs.writeFileSync('src/pages/Dashboard.tsx', appContent);

