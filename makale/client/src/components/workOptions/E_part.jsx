import { Modal } from "antd";
import { useState } from "react";

const initialCategories = [
  {
    code: "E",
    description: "E. Ulusal Bildiriler",
    subcategories: [
      {
        code: "E-1",
        description:
          "Tam metinli bildiriler/Davetli konuşmacı bildirileri (Sözlü sunulan ve tam metin yayınlananlar)",
        subcategories: [
          {
            code: "E-1.1",
            description: "Özet (Sözlü sunulan ve özeti yayınlananlar)",
            subcategories: [],
          },
        ],
      },
      {
        code: "E-2",
        description:
          "Poster olarak sunulan ve tam metin / poster olarak yayınlananlar",
        subcategories: [
          {
            code: "E-2.1",
            description: "Poster olarak sunulan ve özeti yayınlananlar",
            subcategories: [],
          },
        ],
      },
    ],
  },
];

function CategoryItem({ category, onAddWork }) {
  const [isOpen, setIsOpen] = useState(false);

  // Özel olarak çalışmaya izin verilen kodlar
  const allowedCategoryCodes = ["E-1", "E-2"];

  const shouldAllowWorkAddition =
    (!category.subcategories || category.subcategories.length === 0) ||
    allowedCategoryCodes.includes(category.code);

  return (
    <div className="border-b border-gray-300 mb-2">
      <div
        className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium">{category.code}</span>
        <button className="px-2 py-1 bg-blue-500 text-white rounded-lg">
          {isOpen ? "-" : "+"}
        </button>
      </div>
      {isOpen && (
        <div className="pl-4 mt-2">
          <div className="text-gray-600 text-sm italic mb-2">
            {category.description}
          </div>

          {/* Çalışmaları listele */}
          {category.works &&
            category.works.map((work, idx) => (
              <div key={idx} className="mt-2 text-sm text-blue-700">
                {work.code}: {work.fileName}
              </div>
            ))}

          {/* Çalışma ekleme butonu sadece istenilen durumlarda */}
          {shouldAllowWorkAddition && (
            <button
              className="w-full bg-gray-200 p-2 rounded hover:bg-gray-300 mt-2"
              onClick={() => onAddWork(category)}
            >
              + Çalışma Ekle
            </button>
          )}

          {/* Alt kategorileri varsa alt alta göster */}
          {category.subcategories &&
            category.subcategories.length > 0 &&
            category.subcategories.map((sub) => (
              <CategoryItem
                key={sub.code}
                category={sub}
                onAddWork={onAddWork}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function E_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [count, setCount] = useState(1);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const addWork = (parentCategory) => {
    setSelectedCategory(parentCategory);
    setIsModalOpen(true);
    setCount(1);
    setFile(null);
    setFileName("");
  };

  const handleOk = () => {
    setIsModalOpen(false);

    setCategories((prevCategories) => {
      const newCategories = JSON.parse(JSON.stringify(prevCategories));

      const findAndAddWork = (categories) => {
        for (let cat of categories) {
          if (cat.code === selectedCategory.code) {
            const nextNumber = (cat.works ? cat.works.length : 0) + 1;
            const newWorkCode = `${cat.code}:${nextNumber}`;

            if (!cat.works) cat.works = [];
            cat.works.push({
              code: newWorkCode,
              description: `Çalışma-${nextNumber}`,
              count: count,
              fileName: fileName,
            });

            return;
          }
          if (cat.subcategories) {
            findAndAddWork(cat.subcategories);
          }
        }
      };

      findAndAddWork(newCategories);
      return newCategories;
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        E. Ulusal Bildiriler
      </h1>
      <div>
        {categories.map((category) => (
          <CategoryItem
            key={category.code}
            category={category}
            onAddWork={addWork}
          />
        ))}
      </div>
      <Modal
        title={selectedCategory ? selectedCategory.description : ""}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedCategory && (
          <>
            <label className="block text-sm font-medium mb-2">
              Künyeyi giriniz:
            </label>
            <textarea
              className="w-full border p-2 rounded mb-3"
              placeholder="Künyenizi buraya giriniz"
            />

            <label className="block text-sm font-medium mb-2">
              Yazar sayısını giriniz
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded mb-3"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              min="1"
            />

            <label className="block text-sm font-medium mb-2">
              Belge Yükleyin:
            </label>
            <input
              type="file"
              className="w-full border p-2 rounded mb-3"
              onChange={handleFileChange}
            />

            {file && (
              <div className="mt-3 text-sm text-blue-600">
                {selectedCategory.code}:{count} - {fileName}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
