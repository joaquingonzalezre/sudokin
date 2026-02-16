import clsx from "clsx";

interface ControlPadProps {
  onNumberClick: (num: number) => void;
  onDeleteClick: () => void;
  onUndoClick: () => void; // <--- ¡AQUÍ ESTABA EL ERROR! Ahora ya existe.
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
    <div className="flex flex-col w-full max-w-[300px] gap-4 p-4">
      {/* 1. SELECTOR DE MODO */}
      <div className="flex bg-gray-200 p-1 rounded-lg shadow-inner">
        <button
          onClick={() => setInputMode("normal")}
          className={clsx(
            "flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200",
            inputMode === "normal"
              ? "bg-white text-black shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          Normal
        </button>
        <button
          onClick={() => setInputMode("candidate")}
          className={clsx(
            "flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200",
            inputMode === "candidate"
              ? "bg-black text-white shadow-lg"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          Candidato
        </button>
      </div>

      {/* 2. TECLADO NUMÉRICO */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="h-14 bg-white rounded-lg text-2xl font-semibold text-gray-800 hover:bg-gray-50 active:bg-blue-50 active:text-blue-600 transition-all shadow-sm border border-gray-200 hover:border-gray-300"
          >
            {num}
          </button>
        ))}
      </div>

      {/* 3. ZONA DE ACCIONES (GRID 2x2) */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* FILA 1, BOTÓN 1: BORRAR (Cruz) */}
        <button
          onClick={onDeleteClick}
          className="h-12 flex items-center justify-center bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
          title="Borrar celda"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* FILA 1, BOTÓN 2: DESHACER (Undo) */}
        <button
          onClick={onUndoClick}
          className="h-12 flex items-center justify-center bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
          title="Deshacer último movimiento"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>
          Deshacer
        </button>

        {/* FILA 2, BOTÓN 1: VISIBILIDAD (Ojo) */}
        <button
          onClick={() => setShowCandidates(!showCandidates)}
          className={clsx(
            "h-12 flex items-center justify-center border rounded-lg transition-colors font-semibold text-xs px-1",
            showCandidates
              ? "bg-gray-800 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50",
          )}
          title="Mostrar/Ocultar notas"
        >
          {showCandidates ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Visibles
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
              Ocultos
            </>
          )}
        </button>

        {/* FILA 2, BOTÓN 2: CREAR (Varita) */}
        <button
          onClick={onCreateCandidates}
          className="h-12 flex items-center justify-center bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors font-bold text-xs uppercase tracking-tight"
          title="Calcular candidatos automáticamente"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Crear
        </button>
      </div>
    </div>
  );
}
