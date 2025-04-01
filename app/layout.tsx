import { ReactNode } from "react";
import Navbar from "./Components/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Add metadata or other head elements here */}
        <title>My App</title>
      </head>
      <body>
        <Navbar />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
