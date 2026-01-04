import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

const MaddeRow = ({ label, text, field, updateField }) => {
  return (
    <tr className="bg-slate-50/50">
      <td className="p-5 align-top text-center font-black text-indigo-600">
        {label})
      </td>

      <td className="p-5 align-top">
        <Text className="text-slate-800 font-bold block mb-2">
          {text}
        </Text>

        <div className="mt-3 p-4 rounded-2xl bg-slate-100 border border-slate-200">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
            Siz Doldurun
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Tablo 1’deki Yayın Kodları
              </label>
              <textarea
                rows={3}
                value={field.kodlar}
                onChange={(e) =>
                  updateField(label, "kodlar", e.target.value)
                }
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs 
                           outline-none focus:border-indigo-500 shadow-sm resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Her Faaliyetin Puanı
              </label>
              <textarea
                rows={3}
                value={field.puanlar}
                onChange={(e) =>
                  updateField(label, "puanlar", e.target.value)
                }
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs 
                           outline-none focus:border-indigo-500 shadow-sm resize-none h-20"
              />
            </div>
          </div>
        </div>
      </td>

      <td className="p-5 align-top text-center font-mono text-xs text-indigo-600 whitespace-pre-line font-bold">
        {field.kodlar || "-"}
      </td>

      <td className="p-5 align-top text-center font-mono text-xs text-slate-800 whitespace-pre-line font-black">
        {field.puanlar || "-"}
      </td>
    </tr>
  );
};

export default React.memo(MaddeRow);
