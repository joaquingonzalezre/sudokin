import { SudokuGridType } from "../data/sudokuPuzzles";
import { CandidateGridType, calculateAllCandidates } from "./candidateManager";

// Definimos la estructura rica de datos que devolverá el Hint
export type HintData = {
  type: "error" | "naked-single" | "none"; // Tipo de pista
  cellIdx: number | null; // Índice lineal (0-80) de la celda objetivo
  value: number | null; // El valor que debería ir ahí
  levels: {
    // Los 5 niveles de profundidad
    1: string; // Qué buscar (Dígito)
    2: string; // Dónde buscar (Fila/Columna)
    3: string; // Dónde buscar (Cuadrante)
    4: string; // Ubicación exacta
    5: string; // Explicación lógica completa
  };
};

/**
 * EL CEREBRO DEL HINT (Profesor Observador)
 */
export const getHint = (
  grid: SudokuGridType,
  userCandidates: CandidateGridType,
): HintData => {
  // 1. OBTENER LA VERDAD MATEMÁTICA
  // Calculamos qué números son realmente posibles en cada celda vacía según las reglas del Sudoku.
  const trueCandidates = calculateAllCandidates(grid);

  // 2. GENERAR CANDIDATOS "EFECTIVOS" (La Intersección Inteligente)
  // Aquí es donde el algoritmo "lee" la mente del usuario.
  const effectiveCandidates: number[][] = [];

  for (let i = 0; i < 81; i++) {
    // Si la celda ya tiene un número fijo, no nos interesa para pistas
    if (grid[i] !== null) {
      effectiveCandidates[i] = [];
      continue;
    }

    const trueCands = trueCandidates[i];
    const userCands = userCandidates[i];

    // CASO A: El usuario NO tiene notas en esta celda.
    // Asumimos que todas las posibilidades matemáticas están abiertas.
    if (userCands.length === 0) {
      effectiveCandidates[i] = trueCands;
    }
    // CASO B: El usuario SÍ tiene notas.
    // Respetamos su filtro. Solo consideramos los números que sean matemáticamente posibles
    // Y que el usuario TAMBIÉN tenga anotados.
    else {
      const intersection = trueCands.filter((tc) => userCands.includes(tc));

      // SUB-CASO DE ERROR: El usuario borró TODOS los candidatos correctos.
      // (Ej: La verdad es [2, 5] y el usuario anotó solo [8, 9])
      if (intersection.length === 0) {
        const row = Math.floor(i / 9) + 1;
        const col = (i % 9) + 1;
        return {
          type: "error",
          cellIdx: i,
          value: null,
          levels: {
            1: `⚠️ CRÍTICO: En la Fila ${row}, Columna ${col}, tus notas han eliminado todas las posibilidades correctas. Revisa esa celda antes de continuar.`,
            2: "",
            3: "",
            4: "",
            5: "",
          },
        };
      }

      effectiveCandidates[i] = intersection;
    }
  }

  // 3. BUSCAR "NAKED SINGLE" (Único Candidato)
  // Buscamos en la matriz EFECTIVA una celda que solo tenga 1 opción posible.
  // Esto puede pasar porque el tablero lo dicta, O porque el usuario borró las otras opciones.
  const nakedIdx = effectiveCandidates.findIndex((c) => c.length === 1);

  if (nakedIdx !== -1) {
    const val = effectiveCandidates[nakedIdx][0]; // El número ganador

    // Coordenadas para los mensajes
    const row = Math.floor(nakedIdx / 9) + 1;
    const col = (nakedIdx % 9) + 1;
    // Cálculo del Cuadrante (1-9)
    const boxRow = Math.floor((row - 1) / 3);
    const boxCol = Math.floor((col - 1) / 3);
    const boxNum = boxRow * 3 + boxCol + 1;

    // GENERAMOS LOS 5 NIVELES DE PISTAS
    return {
      type: "naked-single",
      cellIdx: nakedIdx,
      value: val,
      levels: {
        1: `🧐 Hay una jugada lógica disponible relacionada con el número ${val}.`,

        2: `🔍 Centra tu atención en la Fila ${row}. Hay una celda ahí que ya está resuelta.`,

        3: `📦 Mira dentro del Cuadrante (Caja) número ${boxNum}.`,

        4: `📍 La solución está exactamente en la celda: Fila ${row}, Columna ${col}.`,

        5: `💡 EXPLICACIÓN: Es un "Naked Single". Según las reglas del Sudoku (y tus propias notas eliminadas), el número ${val} es la ÚNICA opción matemática que cabe en esta casilla. ¡Ponlo!`,
      },
    };
  }

  // 4. SI NO HAY NAKED SINGLES
  // Aquí es donde en el futuro agregarás lógica para "Hidden Singles", "Pairs", etc.
  return {
    type: "none",
    cellIdx: null,
    value: null,
    levels: { 1: "", 2: "", 3: "", 4: "", 5: "" },
  };
};
