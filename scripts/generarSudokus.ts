import { getSudoku } from 'sudoku-gen';
import fs from 'fs';

// Esta función convierte el texto que da la librería a tu formato de ceros
function formatearTablero(puzzleString: string): number[] {
  return puzzleString.split('').map(char => (char === '-' ? 0 : parseInt(char, 10)));
}

const cantidad = 460;
const dificultades = ['easy', 'medium', 'hard', 'expert']; // Fácil, medio, difícil, experto

// Preparamos el inicio del archivo
let contenidoArchivo = `// Archivo autogenerado con ${cantidad} sudokus\n\nexport const nuevosSudokus: number[][] = [\n`;

console.log(`Generando ${cantidad} sudokus...`);

for (let i = 0; i < cantidad; i++) {
  // Vamos rotando las dificultades para tener de todo tipo
  const dificultad = dificultades[i % 4]; 
  const sudoku = getSudoku(dificultad as any);
  const tablero = formatearTablero(sudoku.puzzle);
  
  // Le damos tu formato exacto
  contenidoArchivo += `  [\n    // Sudoku Autogenerado ${i + 1} - Dificultad: ${dificultad}\n    `;
  contenidoArchivo += tablero.join(', ') + ',\n  ],\n';
}

// Cerramos el array
contenidoArchivo += '];\n';

// Guardamos el archivo mágicamente en tu computadora
fs.writeFileSync('./scripts/sudokus_generados.ts', contenidoArchivo);
console.log('¡Éxito! Revisa el archivo scripts/sudokus_generados.ts');