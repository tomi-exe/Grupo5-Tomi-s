import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#111a22] text-white p-4">
      <div className="flex justify-between items-center">
        <div className="font-bold text-3xl pb-4">🎫 TicketZone</div>
        <button
          onClick={toggleMenu}
          className="sm:hidden text-white focus:outline-none"
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>
      <div
        className={`mt-4 sm:mt-0 sm:flex sm:items-center sm:justify-end ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <Link
          href="/"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          INICIO
        </Link>
        <Link
          href="/events"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          EVENTOS
        </Link>
        <Link
          href="/my-tickets"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          MIS TICKETS
        </Link>
        <Link
          href="/resale-market"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          REVENTAS
        </Link>
        <Link
          href="/transfer-history"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          TRANSFERENCIAS
        </Link>
        <Link
          href="/purchase-history"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          HISTORIAL DE COMPRAS
        </Link>
        <Link
          href="/organizer/dashboard"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black text-sm bg-blue-600/20 border border-blue-600/50"
        >
          📊 DASHBOARD ORGANIZADOR
        </Link>
        <Link
          href="/admin/transfers"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black text-sm bg-orange-600/20 border border-orange-600/50"
        >
          ADMIN
        </Link>
        <Link
          href="/logout"
          className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black"
        >
          SALIR
        </Link>
      </div>
    </nav>
  );
}