"use client";

export default function Loading({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#111a22] text-white p-4">
      <div className="border-4 border-t-transparent border-blue-500 rounded-full animate-spin w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
      <p className="mt-4 text-base sm:text-lg md:text-xl font-medium">{text}</p>
    </div>
  );
}
