import React from "react";

export default function Form7Table({ data }) {
  const allItems = data.flatMap((g) => g.items || []);

  const prepared = allItems.map((item) => {
    const total = item.toplamPuan ?? item.hamPuan * item.yazarpuani;
    const baseKod = item.alt_kod || item.aktivite_kod;

    return {
      kod: item.aktivite_kod,
      base: baseKod,
      tanim: item.workDescription,
      ham: item.hamPuan,
      yazar: item.yazarpuani,
      toplam: Number(total || 0),
    };
  });

  prepared.sort((a, b) => (a.kod || "").localeCompare(b.kod || ""));

  const uniqueBases = [...new Set(prepared.map((i) => i.base))].filter(Boolean);

  const genelToplam = prepared.reduce((s, r) => s + r.toplam, 0);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-2 border-black border-collapse text-xs">
        <tbody>
          <tr className="bg-gray-200 font-bold text-center">
            <td className="border border-black p-2 w-[8%]">Kod</td>
            <td className="border border-black p-2 w-[52%]">TANIM</td>
            <td className="border border-black p-2 w-[10%]">Ham Puan</td>
            <td className="border border-black p-2 w-[10%]">
              Doktora sonrası puan
            </td>
            <td className="border border-black p-2 w-[10%]">
              Doçentlik sonrası puan
            </td>
            <td className="border border-black p-2 w-[10%]">Toplam Puan</td>
          </tr>

          {data.map((group) => {
            const groupTotal = prepared
              .filter((r) => r.kod?.startsWith(group.ust_kod))
              .reduce((s, r) => s + r.toplam, 0);

            return (
              <React.Fragment key={group.ust_kod}>
                <tr>
                  <td className="border border-black p-2 font-bold text-center">
                    {group.ust_kod}
                  </td>
                  <td
                    className="border border-black p-2 font-bold underline"
                    colSpan={5}
                  >
                    {group.ust_tanim}
                  </td>
                </tr>

                {uniqueBases
                  .filter((b) => b.startsWith(group.ust_kod))
                  .map((baseKod) => {
                    const baseItem = group.items.find(
                      (i) => (i.alt_kod || i.aktivite_kod) === baseKod
                    );

                    const tanim =
                      baseItem?.alt_tanim ||
                      baseItem?.aktivite_tanim ||
                      baseItem?.workDescription ||
                      "";

                    return (
                      <React.Fragment key={baseKod}>
                        <tr className="bg-gray-100">
                          <td className="border border-black p-2 text-center font-semibold">
                            {baseKod}
                          </td>
                          <td className="border border-black p-2">
                            {tanim}
                          </td>
                          <td className="border border-black p-2 text-center">
                            {baseItem?.hamPuan || ""}
                          </td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                        </tr>

                        {prepared
                          .filter((r) => r.base === baseKod)
                          .map((r) => (
                            <tr key={r.kod}>
                              <td className="border border-black p-2 text-center">
                                {r.kod}
                              </td>
                              <td className="border border-black p-2 italic">
                                {r.tanim}
                              </td>
                              <td className="border border-black p-2 text-center">
                                {r.ham} × {r.yazar}
                              </td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2 text-center font-bold">
                                {r.toplam.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}

                <tr className="font-bold">
                  <td
                    className="border border-black p-2 text-right"
                    colSpan={5}
                  >
                    TOPLAM
                  </td>
                  <td className="border border-black p-2 text-center">
                    {groupTotal.toFixed(2)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}

          <tr className="font-bold bg-gray-200">
            <td
              className="border border-black p-2 text-right"
              colSpan={5}
            >
              GENEL TOPLAM
            </td>
            <td className="border border-black p-2 text-center">
              {genelToplam.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
