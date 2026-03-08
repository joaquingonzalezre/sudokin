import { HintStrategy } from "./types";

const getRow = (idx: number) => Math.floor(idx / 9);
const getCol = (idx: number) => idx % 9;
const getBox = (idx: number) =>
  Math.floor(getRow(idx) / 3) * 3 + Math.floor(getCol(idx) / 3);

// Obtiene todas las celdas que "ven" a una celda específica
const getPeers = (idx: number) => {
  const peers = new Set<number>();
  const r = getRow(idx);
  const c = getCol(idx);
  const b = getBox(idx);
  for (let i = 0; i < 81; i++) {
    if (i !== idx && (getRow(i) === r || getCol(i) === c || getBox(i) === b))
      peers.add(i);
  }
  return Array.from(peers);
};

export const findXYChain: HintStrategy = (grid, internalCandidates) => {
  // 1. Recopilamos todas las celdas con exactamente 2 candidatos (Bi-Value Cells)
  const biValueCells = [];
  for (let i = 0; i < 81; i++) {
    if (grid[i] === null && internalCandidates[i].length === 2) {
      biValueCells.push({ idx: i, cands: internalCandidates[i] });
    }
  }

  // Límite de profundidad para no congelar el celular calculando bucles infinitos
  const MAX_DEPTH = 6;

  // 2. Evaluamos cada celda bi-valor como posible INICIO de la cadena
  for (const startCell of biValueCells) {
    // Probamos ambos números de la celda de inicio como posibles objetivos
    for (let i = 0; i < 2; i++) {
      const targetNum = startCell.cands[i]; // El número que queremos eliminar al final
      const firstLink = startCell.cands[1 - i]; // El número que conecta con el siguiente eslabón

      // 3. Función recursiva (Efecto Dominó)
      const findChain = (
        currentIdx: number,
        linkToNext: number,
        path: number[],
      ): any => {
        if (path.length >= MAX_DEPTH) {
          // console.log(`   [XY-Chain] 🛑 Límite de profundidad alcanzado en la cadena.`);
          return null;
        }

        const peers = getPeers(currentIdx);
        for (const peerIdx of peers) {
          if (path.includes(peerIdx)) continue; // Evitar dar vueltas en círculos

          const peerCand = internalCandidates[peerIdx];
          if (peerCand.length !== 2) continue; // Solo nos interesan celdas bi-valor
          if (!peerCand.includes(linkToNext)) continue; // Debe tener la conexión correcta

          const nextLink = peerCand.find((c) => c !== linkToNext)!;

          // RADAR DE ESLABONES:
          // console.log(`   [XY-Chain] 🔗 Eslabón encontrado! Conectando ${linkToNext} con ${nextLink} en celda ${peerIdx}`);

          // 4. ¿Llegamos al final de la cadena?
          if (nextLink === targetNum && path.length >= 2) {
            const endIdx = peerIdx;

            // console.log(`   [XY-Chain] 🎯 ¡Cadena cerrada! Inicio: ${startCell.idx}, Fin: ${endIdx}, Objetivo: ${targetNum}`);

            // Buscamos intersecciones que "vean" a AMBOS extremos
            const startPeers = getPeers(startCell.idx);
            const endPeers = getPeers(endIdx);

            const commonPeers = startPeers.filter(
              (p) =>
                endPeers.includes(p) &&
                !path.includes(p) &&
                p !== endIdx &&
                p !== startCell.idx,
            );

            // Verificamos si hay basura que limpiar en esas intersecciones
            const cellsToClear = commonPeers.filter(
              (p) =>
                grid[p] === null && internalCandidates[p].includes(targetNum),
            );

            if (cellsToClear.length > 0) {
              // console.log(`   [XY-Chain] 💥 ¡BINGO! Se encontró basura para limpiar en las celdas:`, cellsToClear);

              return {
                // ... (aquí sigue el código normal del return que ya tienes)

                found: true,
                type: "XY-CHAIN (Cadena XY)",
                totalSteps: 3,
                steps: [
                  {
                    message: `¡Cazamos una "Cadena XY"! Empieza en la celda marcada y termina en la otra. Ambas contienen el candidato objetivo: ${targetNum}.`,
                    highlights: {
                      primaryCells: [startCell.idx],
                      secondaryCells: [endIdx],
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Si sigues la cadena de celdas conectadas, ocurre un efecto dominó: si la primera celda NO es ${targetNum}, fuerza matemáticamente a la última a SÍ serlo. ¡Una de las dos esquinas será un ${targetNum} seguro!`,
                    highlights: {
                      primaryCells: [...path, endIdx],
                      secondaryCells: [],
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Cualquier casilla que cruce la mirada con ambos extremos de la cadena jamás podrá ser ${targetNum}. ¡Elimínalo de las celdas marcadas en azul!`,
                    highlights: {
                      primaryCells: cellsToClear,
                      secondaryCells: [startCell.idx, endIdx],
                      focusNumber: targetNum,
                    },
                  },
                ],
                action: {
                  type: "REMOVE_CANDIDATE",
                  cells: cellsToClear,
                  values: [targetNum],
                },
              };
            }
          }

          // Si no encontramos basura aún, seguimos alargando la cadena
          const result = findChain(peerIdx, nextLink, [...path, peerIdx]);
          if (result) return result;
        }
        return null;
      };

      // Iniciamos la búsqueda
      const result = findChain(startCell.idx, firstLink, [startCell.idx]);
      if (result) return result;
    }
  }

  return null;
};
