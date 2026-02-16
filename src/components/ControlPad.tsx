import clsx from "clsx";

interface ControlPadProps {
  onNumberClick: (num: number) => void;
  onDeleteClick: () => void;
  onUndoClick: () => void;
  onCreateCandidates: () => void;
  inputMode: "normal" | "candidate";
  setInputMode: (mode: "normal" | "candidate") => void;
  showCandidates: boolean;
  setShowCandidates: (show: boolean) => void;
}

export default function ControlPad({
  onNumberClick,
  onDeleteClick,
  onUndoClick,
  onCreateCandidates,
  inputMode,
  setInputMode,
  showCandidates,
  setShowCandidates,
}: ControlPadProps) {
  return (
    <div className="flex flex-col w-[260px] select-none">
      {/* SELECTOR DE MODO (TOGGLE NEGRO SÓLIDO) */}
      <div className="flex w-full mb-6 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setInputMode("normal")}
          className={clsx(
            "flex-1 py-2 text-sm font-semibold transition-all",
            inputMode === "normal"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-400 hover:text-gray-600",
          )}
        >
          Normal
        </button>
        <button
          onClick={() => setInputMode("candidate")}
          className={clsx(
            "flex-1 py-2 text-sm font-semibold transition-all border-l border-gray-100",
            inputMode === "candidate"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-400 hover:text-gray-600",
          )}
        >
          Candidate
        </button>
      </div>

      {/* TECLADO NUMÉRICO (CON ESPACIADO PROFESIONAL) */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="aspect-square bg-gray-200/80 rounded-md text-3xl font-bold text-gray-800 hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center border border-gray-300/50 shadow-sm"
          >
            {num}
          </button>
        ))}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={onDeleteClick}
          className="h-14 flex items-center justify-center bg-gray-200/80 rounded-md hover:bg-red-50 hover:text-red-600 border border-gray-300/50 transition-colors text-gray-800 font-bold text-2xl"
        >
          ✕
        </button>
        <button
          onClick={onUndoClick}
          className="h-14 flex items-center justify-center bg-gray-200/80 rounded-md hover:bg-gray-300 border border-gray-300/50 transition-colors text-gray-800 font-bold text-lg"
        >
          Undo
        </button>
      </div>

      {/* TOGGLE AUTO CANDIDATE (ESTILO CHECKBOX MINIMALISTA) */}
      <div
        className="flex items-center space-x-2 cursor-pointer group px-1"
        onClick={() => setShowCandidates(!showCandidates)}
      >
        <div
          className={clsx(
            "w-4 h-4 border rounded flex items-center justify-center transition-colors",
            showCandidates
              ? "bg-white border-gray-900"
              : "border-gray-400 bg-white",
          )}
        >
          {showCandidates && <div className="w-2 h-2 bg-gray-900 rounded-sm" />}
        </div>
        <span className="text-xs font-medium text-gray-600 group-hover:text-black">
          Auto Candidate Mode
        </span>
      </div>

      {/* BOTÓN SECUNDARIO PARA CALCULAR */}
      <button
        onClick={onCreateCandidates}
        className="mt-4 w-full py-2 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest text-left px-1"
      >
        + Refrescar Candidatos
      </button>
    </div>
  );
}
