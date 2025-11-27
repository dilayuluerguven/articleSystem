import React from "react";

export default function Form7Table({ data }) {

  const allItems = data.flatMap((g) => g.items || []);

  const prepared = allItems.map((item) => ({
    kod: item.aktivite_kod, 
    tanim: item.workDescription,
    ham: item.hamPuan,
    yazar: item.yazarpuani,
    toplam: Number(item.toplamPuan ?? 0).toFixed(2)
  }));

  prepared.sort((a, b) => (a.kod || "").localeCompare(b.kod || ""));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border border-black text-sm">
        <thead>
          <tr>
            <th className="border border-black p-2 w-24">Kod</th>
            <th className="border border-black p-2">TANIM</th>
            <th className="border border-black p-2">Ham Puan</th>
            <th className="border border-black p-2">Toplam Puan</th>
          </tr>
        </thead>

        <tbody>
          {prepared.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                Hiç yayın eklenmedi
              </td>
            </tr>
          ) : (
            prepared.map((row, idx) => (
              <tr key={idx}>
                <td className="border border-black p-2">{row.kod}</td>
                <td className="border border-black p-2">{row.tanim}</td>
                <td className="border border-black p-2 text-center">
                  {row.ham} × {row.yazar}
                </td>
                <td className="border border-black p-2 text-center">
                  {row.toplam}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
