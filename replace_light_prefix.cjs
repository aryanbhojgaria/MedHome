const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/LandingPage.tsx',
  'src/pages/AuthPage.tsx',
  'src/components/Navbar.tsx'
];

files.forEach(file => {
  const filePath = path.resolve(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  console.log(`\nProcessing ${file}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find lines containing "light:"
  const lines = content.split('\n');
  let modifiedCount = 0;
  
  const newLines = lines.map((line, idx) => {
    if (line.includes('light:')) {
      // Find matches for light: followed by class characters
      // e.g., light:bg-white/90 or light:text-[#111] or light:border-black/5
      // Let's replace "light:" with ""
      const newLine = line.replace(/light:/g, '');
      console.log(`Line ${idx + 1}:`);
      console.log(`-  ${line.trim()}`);
      console.log(`+  ${newLine.trim()}`);
      modifiedCount++;
      return newLine;
    }
    return line;
  });
  
  if (modifiedCount > 0) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Successfully updated ${modifiedCount} lines in ${file}.`);
  } else {
    console.log(`No changes made to ${file}.`);
  }
});
