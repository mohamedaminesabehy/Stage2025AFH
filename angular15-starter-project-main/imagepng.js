const fs = require('fs');

// Remplacez 'path/to/your/image.png' par le chemin vers votre image
const imagePath = 'src/assets/afhlogo.jpg';

// Lire le fichier image
const imageBuffer = fs.readFileSync(imagePath);

// Convertir le buffer en une chaîne Base64
const base64Image = imageBuffer.toString('base64');

// Ajouter le préfixe de type MIME pour PNG
const imageBase64String = `data:image/png;base64,${base64Image}`;

console.log(imageBase64String);