import React, { useState } from "react";
import { Checkbox, Select } from "antd";
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
import O_part from "./workOptions/O_part";
import P_part from "./workOptions/P_part";
import R_part from "./workOptions/R_part";
import S_part from "./workOptions/S_part";

const data = [
  { key: "A", activity: "Uluslararası Çalışmalar", component: A_part },
  { key: "B", activity: "Uluslararası Bildiriler", component: B_part },
  { key: "C", activity: "Uluslararası Kitap", component: C_part },
  { key: "D", activity: "Ulusal Çalışmalar", component: D_part },
  { key: "E", activity: "Ulusal Bildiriler", component: E_part },
  { key: "F", activity: "Ulusal Kitap", component: F_part },
  { key: "G", activity: "Atıflar", component: G_part },
  {
    key: "H",
    activity: "Ön Lisans, Lisans ve Lisansüstü Eğitim-Öğretim",
    component: H_part,
  },
  {
    key: "I",
    activity: "Bilim İnsanı Yetiştirmeye Yönelik Çabalar",
    component: I_part,
  },
  { key: "J", activity: "Burslar", component: J_part },
  { key: "K", activity: "AR-GE Projeleri ve Araştırma", component: K_part },
  { key: "L", activity: "Patentler / Tesciller", component: L_part },
  {
    key: "M",
    activity: "Yarışmalar, Sergileme vb. (Uluslararası / Ulusal)",
    component: M_part,
  },
  {
    key: "N",
    activity:
      "Danışmanlık (Mesleki) veya Üniversite-Sanayi İşbirliği Faaliyetleri",
    component: N_part,
  },
  { key: "O", activity: "Bilimsel / Sanatsal Faaliyetlere Katkı",component:O_part },
  {
    key: "P",
    activity: "Bilimsel/Sanatsal Kuruluşlarda Görev (Uluslararası/Ulusal)",
    component: P_part,
  },
  { key: "R", activity: "Ödüller", component: R_part },
  {
    key: "S",
    activity: "Üniversite Yönetimine ve İşleyişine Katkılar",
    component: S_part,
  },
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

  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Form Seçimi Bölümü */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <p className="text-xl font-semibold text-gray-800 mt-5 mb-5 text-center select-none">
          Otomatik doldurmak istediğiniz Form Türünü seçiniz.
        </p>
        <Select
          className="w-full"
          showSearch
          placeholder="Form Seçiniz"
          optionFilterProp="children"
          onChange={onChange}
          onSearch={onSearch}
          options={[
            { value: "seciniz", label: "Seçiniz" },
            { value: "form1", label: "Form-1" },
            { value: "form2", label: "Form-2" },
            { value: "form3", label: "Form-3" },
            { value: "form4", label: "Form-4" },
            { value: "form5", label: "Form-5" },
            { value: "form6", label: "Form-6" },
            { value: "form8", label: "Form-8" },
          ]}
        />
      </div>
  
      {/* Açıklama Metni */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-6 w-full max-w-8xl text-center select-none">
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Çalışmanızın kod numarasını seçmek için kutucuğu işaretleyebilirsiniz
        </p>
        <p className="text-gray-600 text-sm">
          İlgili kutucuğun alt seçimlerine eklemek istediğiniz belge türünü
          seçerek ilerleyiniz.
        </p>
      </div>
  
      {/* Checkbox Seçenekleri */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-8xl">
        <div className="flex items-center mb-4">
          <Checkbox
            onChange={handleToggleAll}
            checked={selectedItems.length === data.length}
            className="mr-3"
          />
          <span className="text-gray-800 font-medium px-2">Tümünü seç</span>
        </div>
  
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>
  
      {/* Seçili Form Bileşenleri */}
      <div className="mt-6 w-full max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map(
            (item) =>
              selectedItems.includes(item.key) &&
              item.component && <item.component key={item.key} />
          )}
        </div>
      </div>
    </div>
  );
  
};

export default FormPart;
