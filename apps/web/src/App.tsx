export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0c14] text-white flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[#f2c738] tracking-wide">ALYM</h1>
        <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest">
          Athletic League Youth Manager
        </p>
      </div>
      <div className="flex flex-col gap-3 w-64">
        <button className="bg-[#f2c738] text-black font-bold py-3 rounded-lg hover:brightness-110 transition">
          Nouveau Jeu
        </button>
        <button className="border border-[#f2c738] text-[#f2c738] font-bold py-3 rounded-lg hover:bg-[#f2c738]/10 transition">
          Continuer
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-8">v0.1.0 — Setup en cours</p>
    </div>
  );
}
