import React from "react";

const MaddeRow = ({ label, text, field, updateField }) => {
  return (
    <tr>
      <td className="border border-black p-2 w-10 text-center align-top">
        {label}
      </td>

      <td className="border border-black p-2 align-top text-justify">
        {text}

        <div className="mt-2 p-2 bg-gray-50 border border-gray-300 text-xs">
          <strong>Siz Doldurun:</strong>

          <div className="mt-2">
            <label className="block font-medium">
              Tablo 1’deki Yayın Kodları
            </label>
            <textarea
              rows={3}
              className="w-full border px-2 py-1 mt-1 resize-none"
              value={field.kodlar}
              onChange={(e) =>
                updateField(label, "kodlar", e.target.value)
              }
            />
          </div>

          <div className="mt-2">
            <label className="block font-medium">
              Her Faaliyetin Puanı
            </label>
            <textarea
              rows={3}
              className="w-full border px-2 py-1 mt-1 resize-none"
              value={field.puanlar}
              onChange={(e) =>
                updateField(label, "puanlar", e.target.value)
              }
            />
          </div>
        </div>
      </td>

      <td className="border border-black p-2 text-xs whitespace-pre-line align-top">
        {field.kodlar || "-"}
      </td>

      <td className="border border-black p-2 text-xs whitespace-pre-line align-top">
        {field.puanlar || "-"}
      </td>
    </tr>
  );
};

export default React.memo(MaddeRow);
