"use client";

export default function MyTickets() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#111a22] dark group/design-root overflow-x-hidden text-white">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="flex flex-wrap gap-2 p-4">
              <a className="text-[#92b0c9] text-base font-medium leading-normal" href="#">My Events</a>
              <span className="text-[#92b0c9] text-base font-medium leading-normal">/</span>
              <span className="text-white text-base font-medium leading-normal">Vouchers</span>
            </div>
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">My Vouchers</p>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  placeholder="Search Vouchers"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#324f67] bg-[#192833] focus:border-[#324f67] h-14 placeholder:text-[#92b0c9] p-[15px] text-base font-normal leading-normal"
                  value=""
                  onChange={() => {}}
                />
              </label>
            </div>
            <div className="pb-3">
              <div className="flex border-b border-[#324f67] px-4 gap-8">
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-[#117cd4] text-white pb-[13px] pt-4" href="#">
                  <p className="text-white text-sm font-bold leading-normal tracking-[0.015em]">Active</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#92b0c9] pb-[13px] pt-4" href="#">
                  <p className="text-[#92b0c9] text-sm font-bold leading-normal tracking-[0.015em]">Redeemed</p>
                </a>
              </div>
            </div>
            {/* El resto de tu contenido queda igual */}
            <div className="flex flex-col p-4">
              <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#324f67] px-6 py-14">
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">No vouchers yet</p>
                  <p className="text-white text-sm font-normal leading-normal max-w-[480px] text-center">
                    Browse through our featured events and grab those tickets to start receiving exclusive perks.
                  </p>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#233748] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Explore Events</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
