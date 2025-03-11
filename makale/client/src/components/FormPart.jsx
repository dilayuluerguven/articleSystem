import React, { useState } from "react";
import { Checkbox } from "antd";
import A_part from "./workOptions/A_part";
import B_part from "./workOptions/B_part";
import C_part from "./workOptions/C_part";

const data = [
  { key: "A", activity: "Uluslararası Çalışmalar",component: A_part },
  { key: "B", activity: "Uluslararası Bildiriler",component: B_part  },
  { key: "C", activity: "Uluslararası Kitap",component:C_part },
  { key: "D", activity: "Ulusal Çalışmalar" },
  { key: "E", activity: "Ulusal Bildiriler" },
  { key: "F", activity: "Ulusal Kitap" },
  { key: "G", activity: "Atıflar" },
  { key: "H", activity: "Ön Lisans, Lisans ve Lisansüstü Eğitim-Öğretim" },
  { key: "I", activity: "Bilim İnsanı Yetiştirmeye Yönelik Çabalar" },
  { key: "J", activity: "Burslar" },
  { key: "K", activity: "AR-GE Projeleri ve Araştırma" },
  { key: "L", activity: "Patentler / Tesciller" },
  { key: "M", activity: "Yarışmalar, Sergileme vb. (Uluslararası / Ulusal)" },
  {
    key: "N",
    activity:
      "Danışmanlık (Mesleki) veya Üniversite-Sanayi İşbirliği Faaliyetleri",
  },
  { key: "O", activity: "Bilimsel / Sanatsal Faaliyetlere Katkı" },
  {
    key: "P",
    activity: "Bilimsel/Sanatsal Kuruluşlarda Görev (Uluslararası/Ulusal)",
  },
  { key: "R", activity: "Ödüller" },
  { key: "S", activity: "Üniversite Yönetimine ve İşleyişine Katkılar" },
];

const FormPart = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (key) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleToggleAll = (e) => {
    setSelectedItems(e.target.checked ? data.map((item) => item.key) : []);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mb-4">
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Çalışmanızın kod numarasını seçmek için kutucuğu işaretleyebilirsiniz
        </p>
        <p className="text-gray-600 text-sm">
          Seçtiğiniz kodun hangi çalışmasını da işaretleyebilirsiniz..
        </p>
      </div>

      <div className="flex items-center mb-4 mt-3">
        <Checkbox
          onChange={handleToggleAll}
          checked={selectedItems.length === data.length}
          className="mr-3"
        />
        <span className="text-gray-800 font-medium px-2">Tümünü seç</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <div
            key={item.key}
            className="p-3 rounded-md border border-gray-300 hover:bg-gray-100 transition duration-200"
          >
            <Checkbox
              checked={selectedItems.includes(item.key)}
              onChange={() => handleCheckboxChange(item.key)}
              className="text-gray-700"
            >
              <span className="font-medium">{item.key}.</span> {item.activity}
            </Checkbox>
          </div>
        ))}
      </div>

      {/* Seçili checkboxlara göre ilgili bileşenleri göster */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
        {data.map(
          (item) =>
            selectedItems.includes(item.key) &&
            item.component && <item.component key={item.key} />
        )}
      </div>
    </div>
  );
};

export default FormPart;