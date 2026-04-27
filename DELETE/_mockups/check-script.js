const fs = require('fs')
const html = fs.readFileSync('app.html', 'utf8');
const scriptStartMatches = [...html.matchAll(/<script(?:>|\s[^>]*>)/gi)];
const scriptEndMatches = [...html.matchAll(/<\/script>/gi)];

let mainScript = '';
let mainStartLine = 0;

for (let i = 0; i < Math.min(scriptStartMatches.length, scriptEndMatches.length); i++) {
  const start = scriptStartMatches[i].index + scriptStartMatches[i][0].length;
  // find the next closing tag after start
  const endMatch = scriptEndMatches.find(m => m.index > start);
  if(!endMatch) continue;
  const end = endMatch.index;
  
  const content = html.substring(start, end);
  if (content.length > mainScript.length) {
    mainScript = content;
    mainStartLine = html.substring(0, start).split('\n').length - 1;
  }
}

const vm = require('vm');
try {
  new vm.Script(mainScript);
  console.log('No syntax errors found in the main script block.');
} catch(e) {
  // e.stack will have something like `evalmachine.<anonymous>:123`
  const match = e.stack.match(/evalmachine\.<anonymous>:(\d+)/) || e.stack.match(/<anonymous>:(\d+)/);
  if(match) {
     const errorLineOffset = parseInt(match[1], 10);
     const actualLine = mainStartLine + errorLineOffset;
     console.log(`Syntax Error at physical file line ${actualLine}: ${e.message}`);
     console.log('Lines around error:');
     const lines = mainScript.split('\n');
     for(let j = Math.max(0, errorLineOffset - 3); j < Math.min(lines.length, errorLineOffset + 2); j++) {
       console.log(`${mainStartLine + j + 1}:\t${lines[j]}`);
     }
  } else {
     console.log(e);
  }
}
