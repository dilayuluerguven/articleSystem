import React, { useState } from "react";
import { Checkbox, Tree } from "antd";

const treeData = [
  {
    title: "A-Uluslararası Çalışmalar",
    key: "A",
    children: [
      { title: "A-1", key: "A-1" },
      { title: "A-2", key: "A-2" },
      { title: "A-3", key: "A-3" },
    ],
  },
  {
    title: "B-Uluslararası Bildiriler",
    key: "B",
    children: [
      { title: "B-1", key: "B-1" },
      { title: "B-2", key: "B-2" },
      { title: "B-3", key: "B-3" },
    ],
  },
  {
    title: "C-Uluslararası Kitap",
    key: "C",
    children: [
      { title: "C-1", key: "C-1" },
      { title: "C-2", key: "C-2" },
      { title: "C-3", key: "C-3" },
    ],
  },
  {
    title: "D-Ulusal Çalışmalar",
    key: "D",
    children: [
      { title: "D-1", key: "D-1" },
      { title: "D-2", key: "D-2" },
      { title: "D-3", key: "D-3" },
    ],
  },
  {
    title: "E-Ulusal Bildiriler",
    key: "E",
    children: [
      { title: "E-1", key: "E-1" },
      { title: "E-2", key: "E-2" },
      { title: "E-3", key: "E-3" },
    ],
  },
  {
    title: "F-Ulusal Kitap",
    key: "F",
    children: [
      { title: "F-1", key: "F-1" },
      { title: "F-2", key: "F-2" },
      { title: "F-3", key: "F-3" },
    ],
  },
  {
    title: "G-Atıflar",
    key: "G",
    children: [
      { title: "G-1", key: "G-1" },
      { title: "G-2", key: "G-2" },
      { title: "G-3", key: "G-3" },
    ],
  },
  {
    title: "H-Ön Lisans, Lisans ve Lisansüstü Eğitim-Öğretim",
    key: "H",
    children: [
      { title: "H-1", key: "H-1" },
      { title: "H-2", key: "H-2" },
      { title: "H-3", key: "H-3" },
    ],
  },
  {
    title: "I-Bilim İnsanı Yetiştirmeye Yönelik Çabalar",
    key: "I",
    children: [
      { title: "I-1", key: "I-1" },
      { title: "I-2", key: "I-2" },
      { title: "I-3", key: "I-3" },
    ],
  },
  {
    title: "J-Burslar",
    key: "J",
    children: [
      { title: "J-1", key: "J-1" },
      { title: "J-2", key: "J-2" },
      { title: "J-3", key: "J-3" },
    ],
  },
  {
    title: "K-AR-GE Projeleri ve Araştırma",
    key: "K",
    children: [
      { title: "K-1", key: "K-1" },
      { title: "K-2", key: "K-2" },
      { title: "K-3", key: "K-3" },
    ],
  },
  {
    title: "L-Patentler / Tesciller",
    key: "L",
    children: [
      { title: "L-1", key: "L-1" },
      { title: "L-2", key: "L-2" },
      { title: "L-3", key: "L-3" },
    ],
  },
  {
    title: "M-Yarışmalar, Sergileme vb. (Uluslararası / Ulusal)",
    key: "M",
    children: [
      { title: "M-1", key: "M-1" },
      { title: "M-2", key: "M-2" },
      { title: "M-3", key: "M-3" },
    ],
  },
  {
    title:
      "N-Danışmanlık (Mesleki) veya Üniversite-Sanayi İşbirliği Faaliyetleri",
    key: "N",
    children: [
      { title: "N-1", key: "N-1" },
      { title: "N-2", key: "N-2" },
      { title: "N-3", key: "N-3" },
    ],
  },
  {
    title: "O-Bilimsel / Sanatsal Faaliyetlere Katkı",
    key: "O",
    children: [
      { title: "O-1", key: "O-1" },
      { title: "O-2", key: "O-2" },
      { title: "O-3", key: "O-3" },
    ],
  },
  {
    title: "P-Bilimsel/Sanatsal Kuruluşlarda Görev (Uluslararası/Ulusal)",
    key: "P",
    children: [
      { title: "P-1", key: "P-1" },
      { title: "P-2", key: "P-2" },
      { title: "P-3", key: "P-3" },
    ],
  },
  {
    title: "R-Ödüller",
    key: "R",
    children: [
      { title: "R-1", key: "R-1" },
      { title: "R-2", key: "R-2" },
      { title: "R-3", key: "R-3" },
    ],
  },
  {
    title: "S-Üniversite Yönetimine ve İşleyişine Katkılar",
    key: "S",
    children: [
      { title: "S-1", key: "S-1" },
      { title: "S-2", key: "S-2" },
      { title: "S-3", key: "S-3" },
    ],
  },
];

const FormPart = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (checkedKeys) => {
    setSelectedItems(checkedKeys);
  };

  const handleToggleAll = (e) => {
    setSelectedItems(
      e.target.checked
        ? treeData
            .map((item) => item.key)
            .concat(
              treeData.flatMap((item) =>
                item.children.map((child) => child.key)
              )
            )
        : []
    );
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl mb-6 border border-gray-200">
      {/* Başlık */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Çalışmanızın kod numarasını seçmek için kutucuğu işaretleyebilirsiniz
        </p>
        <p className="text-gray-600 text-sm">
          Seçtiğiniz kodun hangi çalışmasını da işaretleyebilirsiniz..
        </p>
      </div>

      {/* Tümünü Seç Kutucuğu */}
      <div className="flex items-center space-x-2 mt-3">
        <Checkbox
          onChange={handleToggleAll}
          checked={
            selectedItems.length ===
            treeData.flatMap((item) => [
              item.key,
              ...item.children.map((child) => child.key),
            ]).length
          }
          className="text-lg"
        />
        <span className="text-gray-900 font-medium text-lg">Tümünü Seç</span>
      </div>

      {/* Ağaç Görünümü */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
        <Tree
          checkable
          checkedKeys={selectedItems}
          onCheck={handleCheckboxChange}
          treeData={treeData}
          fieldNames={{ title: "title", key: "key", children: "children" }}
          className="text-lg"
        />
      </div>
    </div>
  );
};

export default FormPart;
