const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}
const files = walk('c:/Users/hp/OneDrive/Desktop/PROJECTS/INVT/frontend/src');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    newContent = newContent.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    newContent = newContent.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        changed++;
    }
});
console.log('Changed ' + changed + ' files.');
