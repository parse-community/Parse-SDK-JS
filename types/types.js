const fs = require('fs');
let declarations = fs.readFileSync('index.d.ts').toString();
const generics = fs.readFileSync('generics.ts').toString();
const classes = generics.split('class ');
for (let classGrop of classes) {
  const name = classGrop.split('<')[0].split(' ')[0];
  classGrop = classGrop.substring(0, classGrop.lastIndexOf("}"));
  declarations = declarations.replace(`class ${name} {`, `class ${classGrop}`);
}
fs.writeFileSync('index.d.ts', declarations);
