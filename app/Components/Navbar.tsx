import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-rgb(17 26 34 / var(--tw-bg-opacity, 1)) text-white p-4 flex flex-col sm:flex-row sm:justify-between items-center">
      <div className="font-bold text-lg mb-2 sm:mb-0">🎫 TicketZone</div>
      <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
        <Link href="/">Home</Link>
        <Link href="/register">Register</Link>
        <Link href="/events">Events</Link>
        <Link href="/tickets">My Tickets</Link>
        <Link href="/login">Login</Link>
        <Link href="/logout">Logout</Link>
      </div>
    </nav>
  );
}

