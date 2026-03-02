export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <h1 className="text-5xl font-bold text-center">Fairchild</h1>
      <p className="text-gray-400 mt-2 text-center">Tropical Botanic Garden</p>
      <a
        href="/tickets"
        className="mt-8 px-6 py-3 bg-green-600 rounded-xl font-medium text-white"
      >
        Buy Tickets
      </a>
    </main>
  );
}
