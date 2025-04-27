import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const toastVariants: Record<ToastType, string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-black",
  info: "bg-blue-500 text-white",
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg ${toastVariants[type]} max-w-sm w-full flex items-center justify-between`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

const ToastProvider: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>

      {}
      <div className="fixed bottom-4 left-4 space-x-2">
        <button
          className="bg-green-500 text-white px-3 py-2 rounded"
          onClick={() => addToast("Compra exitosa", "success")}
        >
          Success
        </button>
        <button
          className="bg-red-500 text-white px-3 py-2 rounded"
          onClick={() => addToast("Error al procesar el pago", "error")}
        >
          Error
        </button>
        <button
          className="bg-yellow-500 text-black px-3 py-2 rounded"
          onClick={() => addToast("Advertencia: Revisar datos ingresados", "warning")}
        >
          Warning
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded"
          onClick={() => addToast("Información: Sesión guardada", "info")}
        >
          Info
        </button>
      </div>
    </div>
  );
};

export default ToastProvider;

