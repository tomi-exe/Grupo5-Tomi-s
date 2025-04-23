"use client";

import { useState, ReactNode } from "react";
import Navbar from "./Components/Navbar";
import Link from "next/link";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");

  return (
    <html>
      <head>
        <title>Proyecto</title>
        <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      </head>
      <body>
        <div className="relative flex size-full min-h-screen flex-col bg-[#111a22] dark group/design-root overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#233748] px-10 py-3">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 text-white">
                  <div className="size-4">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Eventful
                  </h2>
                </div>
                <div className="flex items-center gap-9 text-[#92b0c9]">
                  <Navbar />
                </div>
              </div>
              <div className="flex flex-1 justify-end gap-8">
                <label className="flex flex-col min-w-40 !h-10 max-w-64">
                  <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div
                      className="text-[#92b0c9] flex border-none bg-[#233748] items-center justify-center pl-4 rounded-l-xl border-r-0"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#233748] focus:border-none h-full placeholder:text-[#92b0c9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </label>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#233748] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Registrar</span>
                </button>
                <Link href="/login">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#fff] text-black text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Iniciar sesión</span>
                  </button>
                </Link>
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"></div>
              </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="px-40 flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                {children}
              </div>
            </main>

            {/* FOOTER */}
            <footer className="flex justify-center">
              <div className="flex max-w-[960px] flex-1 flex-col">
                <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
                  <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                    <a className="text-[#92b0c9] text-base font-normal leading-normal min-w-40" href="#">About Us</a>
                    <a className="text-[#92b0c9] text-base font-normal leading-normal min-w-40" href="#">Contact</a>
                    <a className="text-[#92b0c9] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
                    <a className="text-[#92b0c9] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
                  </div>
                  <p className="text-[#92b0c9] text-base font-normal leading-normal">@2024 Eventful. All rights reserved</p>
                </footer>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
