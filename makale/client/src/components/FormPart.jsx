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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 ">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <p className="text-2xl font-bold text-gray-800 text-center select-none mb-6">
            Otomatik doldurmak istediğiniz Form Türünü seçiniz.
          </p>
          <Select
            className="w-full max-w-md mx-auto  "
            showSearch
            placeholder="Form Seçiniz"
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            size="large"
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

        {/* Bilgi Kutucuğu */}
        <div className="bg-gradient-to-r from-green-300 to-green-400 text-white p-6 rounded-2xl shadow-lg text-center select-none">
          <p className="text-xl font-semibold mb-3">
            Çalışmanızın kod numarasını seçmek için kutucuğu işaretleyebilirsiniz
          </p>
          <p className="text-amber-50 text-sm opacity-90">
            İlgili kutucuğun alt seçimlerine eklemek istediğiniz belge türünü
            seçerek ilerleyiniz.
          </p>
        </div>

        {/* Checkbox Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              onChange={handleToggleAll}
              checked={selectedItems.length === data.length}
              className="mr-3 transform scale-125"
            />
            <span className="text-lg font-bold text-gray-800 px-2">
              Tümünü seç
            </span>
            <span className="ml-auto text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              {selectedItems.length} / {data.length} seçili
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data.map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedItems.includes(item.key)
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <Checkbox
                  checked={selectedItems.includes(item.key)}
                  onChange={() => handleCheckboxChange(item.key)}
                  className="w-full"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-sm">
                      {item.key}
                    </div>
                    <span className="text-gray-700 text-sm leading-tight flex-1">
                      {item.activity}
                    </span>
                  </div>
                </Checkbox>
              </div>
            ))}
          </div>
        </div>

        {/* Seçili Form Bileşenleri */}
        {selectedItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Seçili Kategoriler
              </h2>
              <span className="ml-auto bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {selectedItems.length} kategori seçildi
              </span>
            </div>

            <div className="space-y-6">
              {data.map(
                (item) =>
                  selectedItems.includes(item.key) &&
                  item.component && (
                    <div 
                      key={item.key} 
                      className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm">
                            {item.key}
                          </span>
                          {item.activity}
                        </h3>
                      </div>
                      <div className="p-6">
                        <item.component />
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPart;