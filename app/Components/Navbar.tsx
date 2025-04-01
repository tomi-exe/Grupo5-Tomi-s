import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-between">
      <div className="font-bold text-lg">🎫 TicketZone</div>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/register">Register</Link>
        <Link href="/events">Events</Link>
        <Link href="/my-tickets">My Tickets</Link>
        <Link href="/login">Login</Link>
        <Link href="/logout">Logout</Link>
      </div>
    </nav>
  );
}
