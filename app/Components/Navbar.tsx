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

        {/* Panel de Administración */}
        <div className="relative group">
          <div className="block px-4 py-2 rounded transition duration-300 ease-in-out hover:bg-white hover:text-black text-sm bg-purple-600/20 border border-purple-600/50 cursor-pointer">
            🔧 ADMINISTRACIÓN
          </div>

          {/* Submenu de administración */}
          <div className="absolute right-0 mt-2 w-48 bg-[#192734] border border-[#233748] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <Link
              href="/admin/transfers"
              className="block px-4 py-2 text-sm hover:bg-[#233748] rounded-t-lg"
            >
              📋 Transferencias
            </Link>
            <Link
              href="/organizer/dashboard"
              className="block px-4 py-2 text-sm hover:bg-[#233748]"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/coupons"
              className="block px-4 py-2 text-sm hover:bg-[#233748]"
            >
              🎫 Gestión de Cupones
            </Link>
            <Link
              href="/admin/events"
              className="block px-4 py-2 text-sm hover:bg-[#233748]"
            >
              📅 Gestión de Eventos
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 text-sm hover:bg-[#233748] rounded-b-lg"
            >
              👥 Gestión de Usuarios
            </Link>
          </div>
        </div>

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