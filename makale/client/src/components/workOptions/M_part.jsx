import { Modal } from "antd";
import { useState } from "react";

// Kategoriler
const categories = [
    {
      code: "M",
      description: "M.Yarışmalar, Sergileme vb. (Uluslararası / Ulusal)",
      subcategories: [
        {
          code: "M-1",
          description:
            "Derece (uluslararası / ulusal)",
          subcategories: [
            { code: "M-1:1", description: "Çalışma-1" },
            { code: "M-1:2", description: "Çalışma-2" }
          ],
        },
        {
          code: "M-2",
          description:
            "Jüri özel ödülü (uluslararası / ulusal)",
          subcategories: [
            { code: "M-2:1", description: "Çalışma-1" },
            { code: "M-2:2", description: "Çalışma-2" },
          ],
        },
        {
            code: "M-3",
            description:
              "Mansiyon (uluslararası / ulusal)",
            subcategories: [
              { code: "M-3:1", description: "Çalışma-1" },
              { code: "M-3:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "M-4",
            description:
              "Sergileme (uluslararası / ulusal)",
            subcategories: [
              { code: "M-4:1", description: "Çalışma-1" },
              { code: "M-4:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "M-5",
            description:
              "Satın alınmış proje (uluslararası / ulusal ",
            subcategories: [
              { code: "M-5:1", description: "Çalışma-1" },
              { code: "M-5:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "M-6",
            description:
              "Yarışma jüri üyelikleri (Uluslararası / ulusal) (x sayı) ",
            subcategories: [
              { code: "M-6:1", description: "Çalışma-1" },
              { code: "M-6:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "M-7",
            description:
              "Uluslararası / ulusal öğrenci etkinlikleri Koordinatörlüğü",
            subcategories: [
              { code: "M-7:1", description: "Çalışma-1" },
              { code: "M-7:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "M-8",
            description:
              "Özgün eser, proje ya da tasarım çalışmalarıyla kişisel tasarım ve sanat etkinliğinde bulunmak ve uygulamak (Uluslararası/Ulusal)",
            subcategories: [
              { code: "M-8:1", description: "Çalışma-1" },
              { code: "M-8:2", description: "Çalışma-2" },
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

export default function M_part() {
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
           M.Yarışmalar, Sergileme vb. (Uluslararası / Ulusal)
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
