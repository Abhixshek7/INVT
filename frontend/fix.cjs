const fs = require('fs');
function walk(dir) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        file = dir + '/' + file;
        if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    });
    return results;
}
const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.split('import.meta.env.VITE_API_URL || "http://localhost:5000"').join('${import.meta.env.VITE_API_URL || "http://localhost:5000"}');
    // in case they got double wrapped:
    newContent = newContent.split('${${').join('${');
    newContent = newContent.split('}}').join('}');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
    }
});
