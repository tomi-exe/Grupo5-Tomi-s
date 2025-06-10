import React from "react";
import { motion } from "framer-motion";
import { Check, XCircle } from "lucide-react";

interface CheckInResultProps {
  success: boolean;
  message: string;
  onReset: () => void;
}

function CheckInResultContent({
  success,
  message,
  onReset,
}: CheckInResultProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-sm w-full bg-[#192734] p-6 rounded-lg shadow-xl text-center"
    >
      {success ? (
        <Check className="mx-auto mb-4 w-12 h-12 text-green-400" />
      ) : (
        <XCircle className="mx-auto mb-4 w-12 h-12 text-red-400" />
      )}
      <p
        role="alert"
        aria-live="polite"
        className={`mb-6 ${success ? "text-green-200" : "text-red-200"}`}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
      >
        {success ? "Nuevo Check-In" : "Reintentar"}
      </button>
    </motion.div>
  );
}

export default CheckInResultContent;
