"use client";
import React, { useState } from "react";

interface Form {
  value: number;
  description: string;
  rewardType: "drink" | "snack" | "discount" | "other";
  expiresAt: string;
}

export default function AdminCouponsPage() {
  const [form, setForm] = useState<Form>({
    value: 0,
    description: "",
    rewardType: "drink",
    expiresAt: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "value" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear cupón");
      setMessage(`✅ Cupón creado: ${data.coupon.code}`);
      setForm({
        value: 0,
        description: "",
        rewardType: "drink",
        expiresAt: "",
      });
    } catch (err: any) {
      setMessage(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Generar Cupones</h1>
      {message && <p className="text-center">{message}</p>}
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Valor */}
        <label className="block">
          Valor (CLP)
          <input
            type="number"
            name="value"
            value={form.value}
            onChange={handleChange}
            required
            className="w-full p-2 bg-[#192734] rounded text-white"
          />
        </label>

        {/* Descripción */}
        <label className="block">
          Descripción
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-2 bg-[#192734] rounded text-white"
          />
        </label>

        {/* Tipo de recompensa */}
        <label className="block">
          Tipo de recompensa
          <select
            name="rewardType"
            value={form.rewardType}
            onChange={handleChange}
            required
            className="w-full p-2 bg-[#192734] rounded text-white"
          >
            <option value="drink">Bebida gratis</option>
            <option value="snack">Snack gratis</option>
            <option value="discount">Descuento %</option>
            <option value="other">Otro</option>
          </select>
        </label>

        {/* Fecha de vencimiento */}
        <label className="block">
          Vence el
          <input
            type="date"
            name="expiresAt"
            value={form.expiresAt}
            onChange={handleChange}
            required
            className="w-full p-2 bg-[#192734] rounded text-white"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear Cupón"}
        </button>
      </form>
    </div>
  );
}
