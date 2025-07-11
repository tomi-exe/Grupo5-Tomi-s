import Link from "next/link";

export default function Home() {
  return (
    <main className="px-4 py-12 mx-auto w-full max-w-7xl">
      <section className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
          Descubre tu proximo evento
        </h1>

        <p className="mt-4 text-lg text-gray-300 max-w-prose">
          Explora una variedad de experiencias en vivo, desde conciertos y deportes hasta
          arte y teatro. Encuentra el evento perfecto para ti.
        </p>
        <Link href="/events" className="mt-6">
          <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded">
          Eventos Disponibles
          </button>
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Tendencias</h2>
        {}
      </section>
    </main>
  );
}



