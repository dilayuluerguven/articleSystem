import React from "react";

export default function Form7Table({ data }) {
  let genelToplam = 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border border-black border-collapse text-[11px]">
        <thead>
          <tr className="bg-gray-200 text-center font-bold">
            <th className="border px-1 py-1 w-[7%]">Kod</th>
            <th className="border px-1 py-1 w-[45%]">TANIM</th>
            <th className="border px-1 py-1 w-[14%]">Ham Puan</th>
            <th className="border px-1 py-1 w-[12%]">Doktora sonrası puan</th>
            <th className="border px-1 py-1 w-[12%]">Doçentlik sonrası puan</th>
            <th className="border px-1 py-1 w-[10%]">Toplam Puan</th>
          </tr>
        </thead>

        <tbody>
          {data.map((group) => {
            let grupToplam = 0;

            return (
              <React.Fragment key={group.ust_kod}>
                <tr className="font-bold">
                  <td className="border px-1 py-1 text-center">
                    {group.ust_kod}
                  </td>
                  <td className="border px-1 py-1 underline" colSpan={5}>
                    {group.ust_tanim}
                  </td>
                </tr>

                {group.items.map((item) => {
                  const itemToplam = item.belgeler.reduce(
                    (s, x) => s + x.toplam,
                    0
                  );

                  grupToplam += itemToplam;
                  genelToplam += itemToplam;

                  return (
                    <React.Fragment key={item.kod}>
                      <tr className="bg-gray-100">
                        <td className="border px-1 py-1 text-center">
                          {item.kod}
                        </td>
                        <td className="border px-1 py-1 font-bold">
                          {item.tanim}
                        </td>
                        <td className="border px-1 py-1 text-center font-bold">
                          {item.hamPuan}
                        </td>
                        <td className="border px-1 py-1"></td>
                        <td className="border px-1 py-1"></td>
                        <td className="border px-1 py-1"></td>
                      </tr>

                      {item.belgeler.map((b, idx) => (
                        <tr key={b.kod}>
                          <td className="border px-1 py-1 text-center">
                            {b.kod}
                          </td>
                          <td className="border px-1 py-1 italic">{b.eser}</td>
                          <td className="border px-1 py-1 text-center ham-puan">
                            {b.hesap}
                          </td>

                          <td className="border px-1 py-1 text-center">
                            {b.main_selection === "doktoraSonrasi"
                              ? b.toplam.toFixed(2)
                              : ""}
                          </td>
                          <td className="border px-1 py-1 text-center">
                            {b.main_selection === "docentlikSonrasi"
                              ? b.toplam.toFixed(2)
                              : ""}
                          </td>

                          {idx === 0 && (
                            <td
                              className="border px-1 py-1 text-center font-bold align-middle"
                              rowSpan={item.belgeler.length}
                            >
                              {itemToplam.toFixed(2)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                <tr className="font-bold">
                  <td className="border px-1 py-1 text-right" colSpan={5}>
                    TOPLAM
                  </td>
                  <td className="border px-1 py-1 text-center">
                    {grupToplam.toFixed(2)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}

          <tr className="bg-gray-200 font-bold">
            <td className="border px-1 py-1 text-right" colSpan={5}>
              GENEL TOPLAM
            </td>
            <td className="border px-1 py-1 text-center">
              {genelToplam.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
