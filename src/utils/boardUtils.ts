import { HintResult, HighlightInstruction } from "../logic/hints/types";

export function getCellBgColor(
  globalIdx: number,
  val: number | null,
  selectedIdx: number | null,
  isInitial: boolean,
  hasConflict: boolean,
  hintState: { active: boolean; currentStep: number; data: HintResult | null },
  highlights: HighlightInstruction,
  grid: (number | null)[],
): string {
  const globalRow = Math.floor(globalIdx / 9);
  const globalCol = globalIdx % 9;

  let isPeer = false;
  let isSameValue = false;

  if (!hintState.active && selectedIdx !== null && selectedIdx !== globalIdx) {
    const sRow = Math.floor(selectedIdx / 9);
    const sCol = selectedIdx % 9;
    const sVal = grid[selectedIdx];
    if (
      globalRow === sRow ||
      globalCol === sCol ||
      (Math.floor(globalRow / 3) === Math.floor(sRow / 3) &&
        Math.floor(globalCol / 3) === Math.floor(sCol / 3))
    ) {
      isPeer = true;
    }
    if (sVal !== null && val === sVal) isSameValue = true;
  }

  let bgColor = "white";
  const isSelected = globalIdx === selectedIdx;

  if (hintState.active && isSelected) bgColor = "#38bdf8";
  else if (highlights.primaryCells.includes(globalIdx)) bgColor = "#85fd65";
  else if (highlights.secondaryCells.includes(globalIdx)) bgColor = "#fbcfe8";
  else if (highlights.focusNumber !== null && val === highlights.focusNumber)
    bgColor = "#e69100";
  else if (!hintState.active && isSelected)
    bgColor = val !== null ? "#d48200" : "#fb9b00";
  else if (hasConflict && !isInitial) bgColor = "#ffcccc";
  else if (!hintState.active && isSameValue) bgColor = "#e69100";
  else if (!hintState.active && isPeer)
    bgColor = isInitial ? "#d3c6af" : "#f9eac2";
  else if (isInitial) bgColor = "#e0e0e0";

  return bgColor;
}
