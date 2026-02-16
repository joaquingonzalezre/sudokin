// Definimos el tipo para el grid principal (81 números o nulos)
export type SudokuGridType = (number | null)[]; // Aquí puedes agregar tantos puzzles como quieras
export const sudokuPuzzles = [
  {
    id: 1,
    difficulty: "Media",
    // Este es tu puzzle actual
    grid: [
      8, 0, 1, 0, 9, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 7, 0,
      0, 0, 0, 0, 2, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 7, 3, 0, 0, 2, 7, 0, 0, 9, 2,
      1, 5, 0, 0, 0, 2, 7, 0, 0, 6, 9, 0, 3, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 3,
      7, 1, 0, 0, 5, 0,
    ],
  },
  {
    id: 2,
    difficulty: "Fácil",
    // Un ejemplo de otro puzzle (puedes cambiar los números luego)
    grid: [
      1, 0, 0, 4, 8, 9, 0, 0, 6, 7, 3, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 2,
      9, 5, 0, 0, 7, 1, 2, 0, 6, 0, 0, 5, 0, 0, 7, 0, 3, 0, 0, 8, 0, 0, 6, 0, 9,
      5, 7, 0, 0, 9, 1, 4, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 7, 8, 0, 0,
      5, 1, 2, 0, 0, 4,
    ],
  },
  {
    id: 3,
    difficulty: "prueba",
    //prueba 1digito por terminar el puzzle )
    grid: [
      1, 5, 2, 4, 8, 9, 3, 7, 6, 7, 3, 9, 2, 5, 6, 8, 4, 1, 4, 6, 8, 3, 7, 1, 2,
      9, 5, 3, 8, 7, 1, 2, 4, 6, 5, 9, 5, 9, 1, 7, 6, 3, 4, 2, 8, 2, 4, 6, 8, 9,
      5, 7, 1, 3, 9, 1, 4, 6, 3, 7, 5, 8, 2, 6, 2, 5, 9, 4, 8, 1, 3, 7, 8, 7, 3,
      5, 1, 2, 9, 0, 0,
    ],
  },
];

// Exportamos una función helper para obtener un puzzle por defecto
export const getPuzzle = (index: number) => sudokuPuzzles[index].grid;
