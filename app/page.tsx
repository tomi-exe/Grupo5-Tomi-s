import Link from "next/link";

export default function Home() {
  return (
    <main className="px-4 py-12 mx-auto w-full max-w-7xl">
      <section className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
          Discover your next event
        </h1>

        <p className="mt-4 text-lg text-gray-300 max-w-prose">
          Explore a variety of live experiences, from concerts and sports to arts and theatre.
          Find the perfect event tailored to your interests.
        </p>
        <Link href="/events" className="mt-6">
          <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded">
          Browse events
          </button>
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Trending Events</h2>
        {/* Aquí iría tu lista de eventos destacada */}
      </section>
    </main>
  );
}



