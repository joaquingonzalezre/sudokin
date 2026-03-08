// Importamos desde la carpeta components que está un nivel arriba de 'app'
import SudokuBoard from "@/components/SudokuBoard";

export default function Home() {
  return (
    // 🛑 Eliminamos "items-center" y agregamos "w-full" para garantizar libertad horizontal
    <main className="flex min-h-screen flex-col w-full">
      <SudokuBoard />
    </main>
  );
}