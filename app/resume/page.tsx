"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Campaign } from "@/domain/campaign";

export default function ResumePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/resume");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data);
        }
      } catch (err) {
        console.error("Error cargando campañas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando campañas...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-green-700">
          📑 Resumen de Campañas
        </h1>

        {campaigns.length === 0 ? (
          <p className="text-gray-500">No hay campañas finalizadas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-2 rounded-tl-lg">ID</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Contactos</th>
                  <th className="px-4 py-2">Instancias</th>
                  <th className="px-4 py-2">Inicio</th>
                  <th className="px-4 py-2">Finalización</th>
                  <th className="px-4 py-2 rounded-tr-lg">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-2 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          c.status === "Finished"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{c.contacts.length}</td>
                    <td className="px-4 py-2">{c.instances.length}</td>
                    <td className="px-4 py-2">
                      {c.startedAt
                        ? new Date(c.startedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2">
                      {c.finishedAt
                        ? new Date(c.finishedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/resume/${c.id}`}
                        className="text-green-600 hover:underline font-medium"
                      >
                        Ver Detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
