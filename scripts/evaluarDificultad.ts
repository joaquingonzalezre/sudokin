import * as fs from "fs";
import * as path from "path";
import { getHint } from "../src/logic/hintManager";
import { calculateAllCandidates } from "../src/logic/candidateManager";
// Importamos directamente, tsx se encarga de transpilara
import { sudokusCrudos as arrayCrudos } from "./sudokus_crudos";


// --- REFERENCIA DE PUNTAJES SEGÚN ESTRATEGIA (Mientras más alto, más difícil de encontrar) ---
const SCORE_MAP: Record<string, number> = {
    "Hidden Single": 1,
    "Naked Single": 2,
    "Naked Pair": 5,
    "Hidden Pair": 10,
    "Pointing Pairs": 15,
    "Naked Triple": 25,
    "Hidden Triple": 40,
    "X-Wing": 100,
    "Y-Wing": 150,
    "Swordfish": 300,
    "XY-Chain": 500,
    "Ninguna": 0, // Fallback en caso de que se atasque
};


// Archivos de salida
const rawFilePath = path.join(__dirname, "sudokus_crudos.ts");
const imposiblesFilePath = path.join(__dirname, "sudokus_imposibles.ts");

// Para evitar problemas de importacion dinamica, leemos el archivo con regex:
const sudokusCrudos = arrayCrudos;


interface EvaluatedSudoku {
    grid: number[];
    score: number;
}

const evaluated: EvaluatedSudoku[] = [];
const imposibles: number[][] = [];
const uniqueCheck = new Set<string>();

// Pre-filtrar duplicados
const uniqueSudokusCrudos = sudokusCrudos.filter(grid => {
    const gridStr = grid.join("");
    if (uniqueCheck.has(gridStr)) {
        return false; // Repetido
    }
    uniqueCheck.add(gridStr);
    return true; // Único
});

console.log(`Evaluando ${uniqueSudokusCrudos.length} sudokus únicos (se omitieron ${sudokusCrudos.length - uniqueSudokusCrudos.length} duplicados)...\n`);

for (let i = 0; i < uniqueSudokusCrudos.length; i++) {
    const originalGrid = uniqueSudokusCrudos[i].map((val) => (val === 0 ? null : val));
    // Creamos una copia que mutaremos durante el juego
    const gameGrid = [...originalGrid];

    // Calculamos los candidatos iniciales (vacíos donde hay número, 1-9 donde hay 0)
    let currentCandidates = calculateAllCandidates(gameGrid);

    let score = 0;
    let isStuck = false;

    // Mientras haya celdas vacías (null)
    while (gameGrid.includes(null)) {
        // IMPORTANTÍSIMO: isAiNotesActive = true
        const hint = getHint(gameGrid, currentCandidates, currentCandidates, true);

        if (!hint.found || hint.type === "Ninguna") {
            // La IA no encontró cómo seguir avanzando. El sudoku es demasiado difícil.
            isStuck = true;
            break;
        }

        // Le sumamos los puntos a este sudoku
        const pts = SCORE_MAP[hint.type] || 0;
        score += pts;

        // APLICAR LA ACCIÓN PARA QUE EL JUEGO AVANCE
        if (hint.action) {
            if (hint.action.type === "PLACE_NUMBER") {
                // Poner el número
                gameGrid[hint.action.cells[0]] = hint.action.value!;
                // Refrescar los candidatos globalmente porque cambió el tablero
                currentCandidates = calculateAllCandidates(gameGrid);
            } else if (
                hint.action.type === "REMOVE_CANDIDATE" ||
                hint.action.type === "KEEP_CANDIDATES"
            ) {
                // En estos, NO recalculamos el tablero entero, solo podamos los eliminados manualmente.
                // Si recalculamos, borraríamos el progreso de la técnica (ej: lo que borró un XWing)
                const valuesToRemove = hint.action.values || (hint.action.value ? [hint.action.value] : []);

                if (hint.action.type === "REMOVE_CANDIDATE" && valuesToRemove.length > 0) {
                    hint.action.cells.forEach((cellIndex) => {
                        currentCandidates[cellIndex] = currentCandidates[cellIndex].filter(
                            (c) => !valuesToRemove.includes(c),
                        );
                    });
                }

                if (hint.action.type === "KEEP_CANDIDATES" && valuesToRemove.length > 0) {
                    hint.action.cells.forEach((cellIndex) => {
                        currentCandidates[cellIndex] = currentCandidates[cellIndex].filter(
                            (c) => valuesToRemove.includes(c),
                        );
                    });
                }
            }
        } else {
            // Fallback por si la pista devolvió "found" pero no "action"
            isStuck = true;
            break;
        }
    }

    if (isStuck) {
        console.log(`❌ Sudoku #${i + 1} fue IMPOSIBLE para la IA.`);
        // Lo devolvemos al formato de 0 para guardar
        imposibles.push(originalGrid.map(v => v === null ? 0 : v));
    } else {
        console.log(`✅ Sudoku #${i + 1} solucionado (Puntos: ${score})`);
        evaluated.push({
            grid: originalGrid.map(v => v === null ? 0 : v),
            score: score,
        });
    }
}

// --- ORDENAR LOS EXITOSOS POR DIFICULTAD ---
evaluated.sort((a, b) => a.score - b.score);
const sortedSudokus = evaluated.map((e, index) => ({
    id: index + 1,
    grid: e.grid
}));

const formatSorted = (sudokus: { id: number, grid: number[] }[]) => {
    const items = sudokus.map(s => {
        return `  {\n    id: ${s.id},\n    grid: [\n      ${s.grid.join(", ")}\n    ]\n  }`;
    }).join(",\n");
    return `[\n${items}\n]`;
};

const formatGrids = (grids: number[][]) => {
    const innerGrids = grids.map(grid => `  [\n    ${grid.join(", ")}\n  ]`).join(",\n");
    return `[\n${innerGrids}\n]`;
};

// --- GUARDAR ARCHIVOS ---
// 1. Guardamos el nuevo sudokus_ordenados.ts
const ordenadosExport = `// scripts/sudokus_ordenados.ts
// Este archivo fue ordenado automáticamente por evaluarDificultad.ts
// Total de Sudokus jugables: ${sortedSudokus.length}
export const sudokusOrdenados: { id: number; grid: number[] }[] = ${formatSorted(sortedSudokus)};
`;
const ordenadosFilePath = path.join(__dirname, "sudokus_ordenados.ts");
fs.writeFileSync(ordenadosFilePath, ordenadosExport, "utf8");

// 2. Guardamos el sudokus_imposibles.ts
const imposiblesExport = `// scripts/sudokus_imposibles.ts
// Estos sudokus requieren técnicas de resolución humanas o niveles superiores que la IA actual no soporta.
// Total de Sudokus imposibles: ${imposibles.length}
export const sudokusImposibles: number[][] = ${formatGrids(imposibles)};
`;
fs.writeFileSync(imposiblesFilePath, imposiblesExport, "utf8");

console.log("\n====== RESULTADOS ======");
console.log(`Sudokus crudos iniciales: ${sudokusCrudos.length}`);
console.log(`Sudokus únicos evaluados: ${uniqueSudokusCrudos.length}`);
console.log(`Ordenados con éxito y guardados: ${sortedSudokus.length}`);
console.log(`Aislados por dificultad extrema: ${imposibles.length}`);
console.log("====== FIN ==============\n");
