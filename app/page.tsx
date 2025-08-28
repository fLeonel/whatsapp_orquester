"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import type { Campaign } from "@/domain/campain";

export default function Home() {
  const [batchSize, setBatchSize] = useState(15);
  const [cooldown, setCooldown] = useState(60);
  const [dailyLimit, setDailyLimit] = useState(200);
  const [message, setMessage] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [status, setStatus] = useState<Campaign | null>(null);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // espera columna "phones"
      complete: (results) => {
        const numbers = results.data
          .map((row: any) => row.phones)
          .filter(Boolean);
        setPhones(numbers);
        console.log("✅ Números cargados:", numbers);
      },
    });
  };

  const startCampaign = async () => {
    if (phones.length === 0) {
      alert("Primero carga un CSV con números.");
      return;
    }
    if (selectedInstances.length === 0) {
      alert("Selecciona al menos una instancia.");
      return;
    }

    await fetch("/api/campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phones,
        params: {
          batchSize,
          cooldownMs: cooldown * 1000,
          dailyLimit,
          message,
        },
        instances: selectedInstances,
      }),
    });

    alert("Campaña iniciada!");
  };

  // Polling cada 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/campaign");
        if (res.ok) {
          const data = (await res.json()) as Campaign;
          setStatus(data);
        }
      } catch (err) {
        console.error("Error en polling:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">
          WhatsApp Orquestador
        </h1>

        {/* Cargar CSV */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Cargar CSV:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="w-full cursor-pointer border border-dashed border-gray-400 p-3 rounded-md bg-gray-50 hover:bg-green-50 hover:border-green-400 transition"
          />
          {phones.length > 0 && (
            <p className="mt-2 text-sm text-green-600">
              ✅ {phones.length} números cargados
            </p>
          )}
        </div>

        {/* Selección de instancias */}
        <div className="mb-4">
          <label className="block text-gray-700">Instancias:</label>
          <div className="flex flex-col gap-2">
            <label>
              <input
                type="checkbox"
                value="instancia1"
                checked={selectedInstances.includes("instancia1")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedInstances((prev) =>
                    prev.includes(value)
                      ? prev.filter((v) => v !== value)
                      : [...prev, value],
                  );
                }}
              />
              <span className="ml-2">Instancia 1</span>
            </label>
            <label>
              <input
                type="checkbox"
                value="instancia2"
                checked={selectedInstances.includes("instancia2")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedInstances((prev) =>
                    prev.includes(value)
                      ? prev.filter((v) => v !== value)
                      : [...prev, value],
                  );
                }}
              />
              <span className="ml-2">Instancia 2</span>
            </label>
          </div>
        </div>

        {/* Parámetros */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-gray-700">Batch Size:</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(+e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700">Cooldown (segundos):</label>
            <input
              type="number"
              value={cooldown}
              onChange={(e) => setCooldown(+e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700">Límite Diario:</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(+e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {/* Mensaje */}
        <div className="mb-6">
          <label className="block text-gray-700">Mensaje:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 h-24 resize-none"
          />
        </div>

        {/* Botón */}
        <button
          onClick={startCampaign}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
        >
          Iniciar Campaña
        </button>

        {/* Polling */}
        {status && (
          <div className="mt-6 p-4 bg-gray-50 border rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Estado de campaña
            </h2>
            <p>
              <strong>Status:</strong> {status.status}
            </p>
            <p>
              <strong>Enviados:</strong> {status.sent} / {status.phones?.length}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
