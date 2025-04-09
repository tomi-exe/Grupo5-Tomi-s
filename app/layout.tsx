import { ReactNode } from "react";
import Navbar from "./Components/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <title>Eventful</title>
        <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      </head>
      <body>
        <div className="relative flex size-full min-h-screen flex-col bg-[#111a22] dark group/design-root overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#233748] px-10 py-3">
              <Navbar />
            </header>

            {/* Main Content */}
            <main className="px-40 flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                {children} {/* Render page-specific content */}
              </div>
            </main>

            {/* Footer */}
            <footer className="flex justify-center">
              <div className="flex max-w-[960px] flex-1 flex-col">
                <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
                  <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                    <a
                      className="text-[#92b0c9] text-base font-normal leading-normal min-w-40"
                      href="#"
                    >
                      About Us
                    </a>
                    <a
                      className="text-[#92b0c9] text-base font-normal leading-normal min-w-40"
                      href="#"
                    >
                      Contact
                    </a>
                    <a
                      className="text-[#92b0c9] text-base font-normal leading-normal min-w-40"
                      href="#"
                    >
                      Terms of Service
                    </a>
                    <a
                      className="text-[#92b0c9] text-base font-normal leading-normal min-w-40"
                      href="#"
                    >
                      Privacy Policy
                    </a>
                  </div>
                  <p className="text-[#92b0c9] text-base font-normal leading-normal">
                    @2024 Eventful. All rights reserved
                  </p>
                </footer>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
