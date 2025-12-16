import React from "react";

export default function Form7Table({ data }) {
  let genelToplam = 0;

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
            let grupToplam = 0;

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

                {group.items.map((item) => (
                  <React.Fragment key={item.kod}>
                    <tr className="bg-gray-100">
                      <td className="border border-black p-2 font-semibold text-center">
                        {item.kod}
                      </td>
                      <td className="border border-black p-2">
                        {item.tanim}
                      </td>
                      <td className="border border-black p-2 text-center">
                        {item.hamPuan}
                      </td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                    </tr>

                    {item.belgeler.map((b) => {
                      grupToplam += b.toplam;
                      genelToplam += b.toplam;

                      return (
                        <tr key={b.kod}>
                          <td className="border border-black p-2 text-center">
                            {b.kod}
                          </td>
                          <td className="border border-black p-2 italic">
                            {b.eser}
                          </td>
                          <td className="border border-black p-2 text-center">
                            {b.hesap}
                          </td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2 text-center font-bold">
                            {b.toplam.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* GRUP TOPLAM */}
                <tr className="font-bold">
                  <td
                    className="border border-black p-2 text-right"
                    colSpan={5}
                  >
                    TOPLAM
                  </td>
                  <td className="border border-black p-2 text-center">
                    {grupToplam.toFixed(2)}
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
