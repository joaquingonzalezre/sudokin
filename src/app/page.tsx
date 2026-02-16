// Importamos desde la carpeta components que está un nivel arriba de 'app'
import SudokuBoard from "@/components/SudokuBoard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <SudokuBoard />
    </main>
  );
}
