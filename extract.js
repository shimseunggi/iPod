const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const scriptStartStr = '<script type="text/babel">';
const scriptEndStr = '</script>\n</body>';

const scriptStartIndex = indexHtml.indexOf(scriptStartStr);
const scriptEndIndex = indexHtml.lastIndexOf(scriptEndStr);

if (scriptStartIndex !== -1 && scriptEndIndex !== -1) {
  const jsContent = indexHtml.substring(scriptStartIndex + scriptStartStr.length, scriptEndIndex).trim();
  fs.writeFileSync('app.jsx', jsContent);
  
  const newHtml = indexHtml.substring(0, scriptStartIndex) + 
                  '<script src="app.js"></script>\n</body>' + 
                  indexHtml.substring(scriptEndIndex + scriptEndStr.length);
  fs.writeFileSync('index_new.html', newHtml);
  console.log('Successfully extracted app.jsx and created index_new.html');
} else {
  console.error('Could not find script tags');
}
