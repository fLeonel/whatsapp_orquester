"use client";

import { useEffect, useState } from "react";
import { Campaign } from "@/domain/campaign";

export default function FSudo() {
  const [status, setStatus] = useState<Campaign | null>(null);

  const fetchStatus = async () => {
    const res = await fetch("/api/campaign");
    if (res.ok) {
      const data = await res.json();
      setStatus(data);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const stopCampaign = async () => {
    await fetch("/api/campaign", { method: "DELETE" });
    setStatus(null);
    alert("Campaña detenida");
  };

  if (!status || !("instances" in status)) {
    return (
      <main className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">FSudo Dashboard</h1>
        </div>
        <p className="text-center text-gray-500 mt-4">
          No hay campañas activas
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-600">FSudo Dashboard</h1>
        <button
          onClick={stopCampaign}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Kill All
        </button>
      </div>

      {/* Estado global */}
      <div className="mb-6">
        <p>
          <strong>Estado:</strong> {status.status}
        </p>
        <p>
          <strong>Contactos totales:</strong> {status.contacts.length}
        </p>
        <p>
          <strong>Inicio:</strong>{" "}
          {status.startedAt ? new Date(status.startedAt).toLocaleString() : "—"}
        </p>
        {status.finishedAt && (
          <p>
            <strong>Finalización:</strong>{" "}
            {new Date(status.finishedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Instancias */}
      <h2 className="text-xl font-semibold mb-2">Instancias</h2>
      <div className="grid grid-cols-3 gap-4">
        {status.instances.map((inst) => (
          <div key={inst.id} className="p-4 border rounded bg-white shadow">
            <h3 className="font-bold">{inst.id}</h3>
            <p>
              <strong>Status:</strong> {inst.status}
            </p>
            <p>
              <strong>Enviados:</strong> {inst.sent}
            </p>
            <p>
              <strong>Pendientes:</strong> {inst.queue.length - inst.sent}
            </p>
            <div className="w-full bg-gray-200 rounded h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded"
                style={{
                  width: `${Math.min(
                    (inst.sent / inst.queue.length) * 100,
                    100,
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
