import { Modal } from "antd";
import { useState } from "react";

// Kategoriler
const categories = [
    {
      code: "D",
      description: "D. Ulusal Çalışmalar",
      subcategories: [
        {
          code: "D-1",
          description:
            "Araştırma makalesi (TR Dizinlerde yer alan)",
          subcategories: [
            { code: "D-1:1", description: "Çalışma-1" },
            { code: "D-1:2", description: "Çalışma-2" },
            {
                code: "D-1.1",
                description:
                  "Derleme, Vaka takdimi, Teknik Not, Kısa Makale, Kitap veya Makale Tahlili, Editöre Mektup, Özet, Tartışma, TR dizinlerinde yeralan dergilerde yayımlanmış kongreye ait tam metin bildiriler",
                subcategories: [
                  { code: "D-1.1:1", description: "Çalışma-1" },
                  { code: "D-1.1:2", description: "Çalışma-2" },
                ],
              },
          ],
        },
        {
          code: "D-2",
          description:
            "Araştırma makalesi (hakemli)",
          subcategories: [
            { code: "D-2:1", description: "Çalışma-1" },
            { code: "D-2:2", description: "Çalışma-2" },
            {
              code: "D-2.1",
              description:
                "Derleme, Vaka takdimi, Teknik Not, Kısa Makale, Kitap veya Makale Tahlili, Editöre Mektup, Özet, Tartışma",
              subcategories: [
                { code: "D-2.1:1", description: "Çalışma-1" },
                { code: "D-2.1:2", description: "Çalışma-2" },
              ],
            },
          ],
        },
        {
          code: "D-3",
          description:
            "Mesleki veya Kurumsal dergilerde makale",
          subcategories: [
            { code: "D-3:1", description: "Çalışma-1" },
            { code: "D-3:2", description: "Çalışma-2" },
          ],
        },
        {
          code: "D-4",
          description:
            "Başvurulan bilim alanında Ulusal özgün tasarım çalışmaları ve sanat eserleri ile jürili olarak fuar, festival, çalıştay (workshop), gösteri, bienal, trienal gibi etkinliğe bir çalışma ile katılmak",
          subcategories: [
            { code: "D-4:1", description: "Çalışma-1" },
            { code: "D-4:2", description: "Çalışma-2" },
          ],
        },
      ],
    },
  ];
// Kategori Elemanı
function CategoryItem({ category, onCategoryClick }) {
  const [isOpen, setIsOpen] = useState(false);

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
          {category.subcategories && category.subcategories.length > 0 ? (
            category.subcategories.map((sub) => (
              <CategoryItem
                key={sub.code}
                category={sub}
                onCategoryClick={onCategoryClick}
              />
            ))
          ) : (
            <button
              className="w-full bg-gray-200 p-2 rounded hover:bg-gray-300 mb-3 mr-8"
              onClick={() => onCategoryClick(category)}
            >
              {category.description} Ekle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function D_part() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [count, setCount] = useState(1);
  const [file, setFile] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    // Dosya ve yazar sayısını burada işleyebilirsiniz
    console.log("Yazar Sayısı:", count);
    console.log("Yüklenen Dosya:", file);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        D. Ulusal Çalışmalar
      </h1>
      <div>
        {categories.map((category) => (
          <CategoryItem
            key={category.code}
            category={category}
            onCategoryClick={handleCategoryClick}
          />
        ))}
      </div>
      <Modal
        title={selectedCategory ? selectedCategory.description : ""}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div>
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
                onChange={(e) => setCount(e.target.value)}
                min="1"
              />

              <label className="block text-sm font-medium mb-2">
                Belge Yükleyin:
              </label>
              <input
                type="file"
                className="w-full border p-2 rounded mb-3"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
