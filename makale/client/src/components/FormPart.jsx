import React, { useState } from "react";
import { Checkbox } from "antd";
import A_part from "./workOptions/A_part";
import B_part from "./workOptions/B_part";
import C_part from "./workOptions/C_part";
import D_part from "./workOptions/D_part";
import E_part from "./workOptions/E_part";
import F_part from "./workOptions/F_part";
import G_part from "./workOptions/G_part";
import H_part from "./workOptions/H_part";
import I_part from "./workOptions/I_part";
import J_part from "./workOptions/J_part";
import K_part from "./workOptions/K_part";
import L_part from "./workOptions/L_part";
import M_part from "./workOptions/M_part";
import N_part from "./workOptions/N_part";

import P_part from "./workOptions/P_part";
import R_part from "./workOptions/R_part";
import S_part from "./workOptions/S_part";













const data = [
  { key: "A", activity: "Uluslararası Çalışmalar",component: A_part },
  { key: "B", activity: "Uluslararası Bildiriler",component: B_part  },
  { key: "C", activity: "Uluslararası Kitap",component:C_part },
  { key: "D", activity: "Ulusal Çalışmalar",component:D_part },
  { key: "E", activity: "Ulusal Bildiriler",component:E_part },
  { key: "F", activity: "Ulusal Kitap",component:F_part },
  { key: "G", activity: "Atıflar",component:G_part },
  { key: "H", activity: "Ön Lisans, Lisans ve Lisansüstü Eğitim-Öğretim",component:H_part },
  { key: "I", activity: "Bilim İnsanı Yetiştirmeye Yönelik Çabalar",component:I_part },
  { key: "J", activity: "Burslar",component:J_part },
  { key: "K", activity: "AR-GE Projeleri ve Araştırma",component:K_part },
  { key: "L", activity: "Patentler / Tesciller" ,component:L_part},
  { key: "M", activity: "Yarışmalar, Sergileme vb. (Uluslararası / Ulusal)",component:M_part },
  {
    key: "N",
    activity:
      "Danışmanlık (Mesleki) veya Üniversite-Sanayi İşbirliği Faaliyetleri", component:N_part
  },
  { key: "O", activity: "Bilimsel / Sanatsal Faaliyetlere Katkı" },
  {
    key: "P",
    activity: "Bilimsel/Sanatsal Kuruluşlarda Görev (Uluslararası/Ulusal)", component:P_part
  },
  { key: "R", activity: "Ödüller",component:R_part },
  { key: "S", activity: "Üniversite Yönetimine ve İşleyişine Katkılar",component:S_part },
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
        İlgili kutucuğun alt seçimlerine eklemek istediğiniz belge türünü seçerek ilerleyiniz.        </p>
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