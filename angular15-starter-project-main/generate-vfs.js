const fs = require('fs');
const path = require('path');

// Fonction pour lire le fichier de police et le convertir en base64
function readFont(filePath) {
  return fs.readFileSync(filePath).toString('base64');
}

// Répertoire contenant les polices et fichier de sortie
const fontDir = path.join(__dirname, 'src/assets/fonts/arabic');
const outputPath = path.join(__dirname, 'src/assets/fonts/vfs_fonts.js');

// Liste des fichiers de polices
const fonts = {
  Roboto:{
    normal: readFont(path.join(fontDir, 'Roboto-Regular.ttf')),
    bold: readFont(path.join(fontDir, 'Roboto-Bold.ttf')),
    italics: readFont(path.join(fontDir, 'Roboto-Italic.ttf')),
    bolditalics: readFont(path.join(fontDir, 'Roboto-BoldItalic.ttf'))
  },
  Amiri: {
    normal: readFont(path.join(fontDir, 'Amiri-Regular.ttf')),
    bold: readFont(path.join(fontDir, 'Amiri-Bold.ttf')),
    italics: readFont(path.join(fontDir, 'Amiri-Italic.ttf')),
    bolditalics: readFont(path.join(fontDir, 'Amiri-BoldItalic.ttf'))
  }
};

// Générer le contenu VFS
const vfsContent = {
  pdfMake: {
    vfs: {
      'Roboto-Regular.ttf': fonts.Roboto.normal,
      'Roboto-Bold.ttf': fonts.Roboto.bold,
      'Roboto-Italic.ttf': fonts.Roboto.italics,
      'Roboto-BoldItalic.ttf': fonts.Roboto.bolditalics,

      'Amiri-Regular.ttf': fonts.Amiri.normal,
      'Amiri-Bold.ttf': fonts.Amiri.bold,
      'Amiri-Italic.ttf': fonts.Amiri.italics,
      'Amiri-BoldItalic.ttf': fonts.Amiri.bolditalics,
    }
  }
};

// Écrire le contenu VFS dans le fichier
fs.writeFileSync(outputPath, `module.exports = ${JSON.stringify(vfsContent, null, 2)};`);
console.log('VFS file generated at', outputPath);
