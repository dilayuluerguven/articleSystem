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
      toplam: Number(total).toFixed(2),
    };
  });

  prepared.sort((a, b) => (a.kod || "").localeCompare(b.kod || ""));
  const uniqueBases = [...new Set(prepared.map((i) => i.base))].filter(
    (b) => b !== null
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border border-black border-collapse text-xs">
        <tbody>
          <tr className="bg-gray-100 font-bold text-center">
            <td className="border border-black p-2 w-[8%]">Kod</td>
            <td className="border border-black p-2 w-[50%]">TANIM</td>
            <td className="border border-black p-2">Ham Puan</td>
            <td className="border border-black p-2">Doktora sonrası puan</td>
            <td className="border border-black p-2">Doçentlik sonrası puan</td>
            <td className="border border-black p-2">Toplam Puan</td>
          </tr>

          
          {data.map((group) => (
            <React.Fragment key={group.ust_kod}>
              <tr className="bg-gray-200">
                <td className="border border-black p-2 font-bold text-center">
                  {group.ust_kod}
                </td>
                <td className="border border-black p-2 font-bold" colSpan={5}>
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
                        <td className="border border-black p-2 italic">
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
                        .filter((row) => row.base === baseKod)
                        .map((row) => (
                          <tr key={row.kod}>
                            <td className="border border-black p-2 text-center">
                              {row.kod}
                            </td>

                            <td className="border border-black p-2 italic">
                              {row.tanim}
                            </td>

                            <td className="border border-black p-2 text-center">
                              {`${row.ham} × ${row.yazar}`}
                            </td>

                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>

                            <td className="border border-black p-2 text-center font-bold">
                              {row.toplam}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
