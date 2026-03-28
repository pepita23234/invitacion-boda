const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\tefft\\Desktop\\Invitacion boda';
const targetDir = 'C:\\Users\\tefft\\Desktop\\Invitacion boda\\nextjs-app\\public';

const images = ['Grupo01_a.webp', 'Grupo01_b.webp', 'Grupo01_c.webp'];

images.forEach(img => {
  const source = path.join(sourceDir, img);
  const target = path.join(targetDir, img);
  
  try {
    fs.copyFileSync(source, target);
    console.log(`✓ Copiado: ${img}`);
  } catch (err) {
    console.error(`✗ Error copiando ${img}:`, err.message);
  }
});

console.log('\n¡Proceso completado!');
