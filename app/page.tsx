"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import type { Campaign, Contact } from "@/domain/campaign";

export default function HomePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dailyLimit, setDailyLimit] = useState(200);
  const [messagesPerCycle, setMessagesPerCycle] = useState(20);
  const [cooldown, setCooldown] = useState(5); // segundos
  const [rest, setRest] = useState(15); // minutos
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [status, setStatus] = useState<Campaign | null>(null);

  // 👉 Generar dinámicamente 15 instancias
  const AVAILABLE_INSTANCES = Array.from(
    { length: 15 },
    (_, i) => `instancia${i + 1}`,
  );

  // 📂 Cargar CSV (Celular, Mensaje)
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    type CsvRow = { Celular?: string; Mensaje?: string };

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";", // importante para CSVs de Excel en español
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const parsed: Contact[] = results.data
          .map((row) => ({
            phone: row.Celular?.toString().trim() || "",
            message: row.Mensaje?.toString().trim() || "",
          }))
          .filter((c) => c.phone && c.message);

        setContacts(parsed);
      },
    });
  };

  // 🚀 Iniciar campaña
  const startCampaign = async () => {
    if (contacts.length === 0) {
      alert("Primero carga un CSV con contactos.");
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
        contacts,
        params: {
          dailyLimit,
          messagesPerCycle,
          cooldownBetweenMessagesMs: cooldown * 1000,
          restAfterCycleMs: rest * 60 * 1000,
        },
        instances: selectedInstances,
      }),
    });

    alert("🚀 Campaña iniciada!");
  };

  // 🔄 Polling del estado
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
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">
          WhatsApp Orquestador
        </h1>

        {/* CSV */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Cargar CSV (Celular, Mensaje):
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="w-full cursor-pointer border border-dashed border-gray-400 p-3 rounded-md bg-gray-50 hover:bg-green-50"
          />
          {contacts.length > 0 && (
            <p className="mt-2 text-sm text-green-600">
              ✅ {contacts.length} contactos cargados
            </p>
          )}
        </div>

        {/* Parámetros */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700">Mensajes por ciclo:</label>
            <input
              type="number"
              value={messagesPerCycle}
              onChange={(e) => setMessagesPerCycle(+e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700">
              Cooldown entre mensajes (segundos):
            </label>
            <input
              type="number"
              value={cooldown}
              onChange={(e) => setCooldown(+e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700">
              Descanso por ciclo (minutos):
            </label>
            <input
              type="number"
              value={rest}
              onChange={(e) => setRest(+e.target.value)}
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

        {/* Instancias */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-700 font-medium">
              Instancias:
            </label>
            <button
              type="button"
              onClick={() => {
                if (selectedInstances.length === AVAILABLE_INSTANCES.length) {
                  // Si ya están todas seleccionadas → deseleccionar todas
                  setSelectedInstances([]);
                } else {
                  // Si no → seleccionar todas
                  setSelectedInstances([...AVAILABLE_INSTANCES]);
                }
              }}
              className="text-sm px-3 py-1 rounded border border-green-600 text-green-600 hover:bg-green-50"
            >
              {selectedInstances.length === AVAILABLE_INSTANCES.length
                ? "Deseleccionar todas"
                : "Seleccionar todas"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {AVAILABLE_INSTANCES.map((id) => (
              <div
                key={id}
                onClick={() =>
                  setSelectedInstances((prev) =>
                    prev.includes(id)
                      ? prev.filter((v) => v !== id)
                      : [...prev, id],
                  )
                }
                className={`cursor-pointer border rounded p-3 text-center ${
                  selectedInstances.includes(id)
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-gray-50 hover:bg-green-100"
                }`}
              >
                {id}
              </div>
            ))}
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={startCampaign}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
        >
          🚀 Iniciar Campaña
        </button>

        {/* Estado */}
        {status && (
          <div className="mt-6 p-4 bg-gray-50 border rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Estado de campaña
            </h2>
            <p>
              <strong>Status:</strong> {status.status}
            </p>

            {"contacts" in status && (
              <>
                <p>
                  <strong>Contactos:</strong> {status.contacts.length}
                </p>

                <h3 className="mt-4 font-medium">Instancias:</h3>
                <ul className="list-disc ml-6">
                  {status.instances.map((inst) => (
                    <li key={inst.id}>
                      {inst.id} → {inst.sent}/{inst.queue.length} ({inst.status}
                      )
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
