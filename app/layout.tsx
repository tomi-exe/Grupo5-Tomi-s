import { ReactNode } from "react";
import Navbar from "./Components/Navbar";
import Login from "./login/login";
import Tickets from "./my-tickets/tickets";
import Link from "next/link";

export default function RootLayout({ children }: { children: ReactNode }) {
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
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
                      value=""
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
            <div className="px-40 flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <div className="@container">
                  <div className="@[480px]:p-4">
                    <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10">
                      <div className="flex flex-col gap-2 text-left">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                          Discover your next event
                        </h1>
                        <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                          Explore a variety of live experiences, from concerts
                          and sports to arts and theatre. Find the perfect event
                          tailored to your interests.
                        </h2>
                      </div>
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#117cd4] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
                        <span className="truncate">Browse events</span>
                      </button>
                    </div>
                  </div>
                </div>
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Trending Events
                </h2>
                <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden">
                  <div className="flex items-stretch p-4 gap-3">
                    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                      <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col"></div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">
                          Rockfest 2024
                        </p>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          Massive rock music festival with top bands
                        </p>
                      </div>
                    </div>
                    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                      <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col"></div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">
                          Pro Basketball League Finals
                        </p>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          The ultimate showdown in professional basketball
                        </p>
                      </div>
                    </div>
                    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                      <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col"></div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">
                          City Philharmonic Orchestra
                        </p>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          An evening of classNameical music with renowned
                          musicians
                        </p>
                      </div>
                    </div>
                    <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                      <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col"></div>
                      <div>
                        <p className="text-white text-base font-medium leading-normal">
                          Summer Family Fest
                        </p>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          Fun-filled activities for the whole family
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Browse by Category
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
                    <p className="text-white text-base font-medium leading-normal">
                      Concerts
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
                    <p className="text-white text-base font-medium leading-normal">
                      Sports
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
                    <p className="text-white text-base font-medium leading-normal">
                      Arts &amp; Theatre
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
                    <p className="text-white text-base font-medium leading-normal">
                      Family
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
                    <p className="text-white text-base font-medium leading-normal">
                      Festivals
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"></div>
                    <p className="text-white text-base font-medium leading-normal">
                      Comedy
                    </p>
                  </div>
                </div>
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  For Organizers
                </h2>
                <div className="flex flex-col gap-10 px-4 py-10 @container">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                      Elevate your event with Eventful Organizer Tools
                    </h1>
                    <p className="text-white text-base font-normal leading-normal max-w-[720px]">
                      Discover powerful solutions for event organizers to manage
                      and promote events, sell tickets, and gain valuable
                      insights.
                    </p>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                    <div className="flex flex-1 gap-3 rounded-lg border border-[#324f67] bg-[#192833] p-4 flex-col">
                      <div
                        className="text-white"
                        data-icon="Calendar"
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
                          <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-white text-base font-bold leading-tight">
                          Event Management Tools
                        </h2>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          Streamline your event planning with our comprehensive
                          management tools.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 gap-3 rounded-lg border border-[#324f67] bg-[#192833] p-4 flex-col">
                      <div
                        className="text-white"
                        data-icon="Ticket"
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
                          <path d="M227.19,104.48A16,16,0,0,0,240,88.81V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V88.81a16,16,0,0,0,12.81,15.67,24,24,0,0,1,0,47A16,16,0,0,0,16,167.19V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V167.19a16,16,0,0,0-12.81-15.67,24,24,0,0,1,0-47ZM32,167.2a40,40,0,0,0,0-78.39V64H88V192H32Zm192,0V192H104V64H224V88.8a40,40,0,0,0,0,78.39Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-white text-base font-bold leading-tight">
                          Ticketing Solutions
                        </h2>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          Sell tickets efficiently and manage attendee lists
                          with ease.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 gap-3 rounded-lg border border-[#324f67] bg-[#192833] p-4 flex-col">
                      <div
                        className="text-white"
                        data-icon="Megaphone"
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
                          <path d="M240,120a48.05,48.05,0,0,0-48-48H152.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,24,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,151.12,214l11,7.33A16,16,0,0,0,186.5,212l11.77-44.36A48.07,48.07,0,0,0,240,120ZM40,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C126.65,155,82.84,164.07,40,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM192,152H160V88h32a32,32,0,1,1,0,64Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-white text-base font-bold leading-tight">
                          Marketing and Promotion
                        </h2>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          Reach a wider audience with our integrated marketing
                          and promotional features.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 gap-3 rounded-lg border border-[#324f67] bg-[#192833] p-4 flex-col">
                      <div
                        className="text-white"
                        data-icon="ChartLine"
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
                          <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-white text-base font-bold leading-tight">
                          Analytics and Reporting
                        </h2>
                        <p className="text-[#92b0c9] text-sm font-normal leading-normal">
                          Gain insights into your event's performance with
                          detailed analytics and reporting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  <div className="flex flex-wrap justify-center gap-4">
                    <a href="#">
                      <div
                        className="text-[#92b0c9]"
                        data-icon="TwitterLogo"
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
                          <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"></path>
                        </svg>
                      </div>
                    </a>
                    <a href="#">
                      <div
                        className="text-[#92b0c9]"
                        data-icon="InstagramLogo"
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
                          <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
                        </svg>
                      </div>
                    </a>
                    <a href="#">
                      <div
                        className="text-[#92b0c9]"
                        data-icon="FacebookLogo"
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
                          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path>
                        </svg>
                      </div>
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
