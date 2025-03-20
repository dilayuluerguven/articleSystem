import { Modal } from "antd";
import { useState } from "react";

// Kategoriler
const categories = [
  {
    code: "A",
    description: "A. Uluslararası Çalışmalar",
    subcategories: [
      {
        code: "A-1",
        description:
          "Q1 veya Q2 çeyreklik dilimi kategorisine giren dergilerde yer alan makaleler ve diğer çalışmalar.",
        subcategories: [
          {
            code: "A-1a",
            description:
              "Q1 kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi",
            subcategories: [
              { code: "A-1a:1", description: "Çalışma-1" },
              { code: "A-1a:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-1b",
            description:
              "Q2 kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi",
            subcategories: [
              { code: "A-1b:1", description: "Çalışma-1" },
              { code: "A-1b:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-1c",
            description: "Q1/Q2 kategorisindeki dergilerde yayımlanmış Derleme",
            subcategories: [
              { code: "A-1c:1", description: "Çalışma-1" },
              { code: "A-1c:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-1d",
            description:
              "Q1/Q2 kategorisindeki dergilerde yayımlanmış ‘Short Communication= Brief Communication’",
            subcategories: [
              { code: "A-1d:1", description: "Çalışma-1" },
              { code: "A-1d:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-1e",
            description:
              "Q1/Q2 kategorisindeki dergilerde yayımlanmış kongreye ait (tam metin / bildiri özeti) makale",
            subcategories: [
              { code: "A-1e:1", description: "Çalışma-1" },
              { code: "A-1e:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-1f",
            description:
              "Q1/Q2 kategorisindeki dergilerde yayımlanmış Vaka-Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma ",
            subcategories: [
              { code: "A-1f:1", description: "Çalışma-1" },
              { code: "A-1f:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-1g",
            description:
              "Mimarlık, Planlama ve Tasarım Temel Alanı / Sosyal, Beşeri ve İdari Bilimler Temel Alanı için; Alan indeksleri kapsamındaki dergilerde yayımlanmış makale",
            subcategories: [
              { code: "A-1g:1", description: "Çalışma-1" },
              { code: "A-1g:2", description: "Çalışma-2" },
            ],
          },
        ],
      },
      {
        code: "A-2",
        description:
          "Q3 veya Q4 çeyreklik dilimi kategorisine giren dergilerde yer alan makaleler ve diğer çalışmalar",
        subcategories: [
          {
            code: "A-2a",
            description:
              "Q3 kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi",
            subcategories: [
              { code: "A-2a:1", description: "Çalışma-1" },
              { code: "A-2a:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-2b",
            description:
              "Q4 kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi",
            subcategories: [
              { code: "A-2b:1", description: "Çalışma-1" },
              { code: "A-2b:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-2c",
            description:
              "Q3 / Q4 kategorisindeki dergilerde yayımlanmış Derleme",
            subcategories: [
              { code: "A-2c:1", description: "Çalışma-1" },
              { code: "A-2c:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-2d",
            description:
              "Q3 / Q4 kategorisindeki dergilerde yayımlanmış ‘Short Communication= Brief Communication’",
            subcategories: [
              { code: "A-2d:1", description: "Çalışma-1" },
              { code: "A-2d:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-2e",
            description:
              "Q3/Q4 kategorisindeki dergilerde yayımlanmış kongrede basılmış (tam metin / bildiri özeti) makale",
            subcategories: [
              { code: "A-2e:1", description: "Çalışma-1" },
              { code: "A-2e:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-2f",
            description:
              "Q3 / Q4 kategorisindeki dergilerde yayımlanmış Vaka-Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma ",
            subcategories: [
              { code: "A-2f:1", description: "Çalışma-1" },
              { code: "A-2f:2", description: "Çalışma-2" },
            ],
          },
        ],
      },
      {
        code: "A-3",
        description:
          "Emerging Sources Citation Index (ESCI) kapsamındaki makaleler ve diğer çalışmalar",
        subcategories: [
          {
            code: "A-3a",
            description:
              "ESCI kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi ",
            subcategories: [
              { code: "A-3a:1", description: "Çalışma-1" },
              { code: "A-3a:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-3b",
            description:
              "ESCI kategorisindeki dergilerde yayımlanmış Derleme, Short Communication=Brief Communication, Vaka/Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma, Kongreye ait tam metin bildiri  ",
            subcategories: [
              { code: "A-3b:1", description: "Çalışma-1" },
              { code: "A-3b:2", description: "Çalışma-2" },
            ],
          },
        ],
      },
      {
        code: "A-4",
        description:
          "Diğer uluslararası alan indeksleri kapsamındaki makaleler ve diğer çalışmalar ",
        subcategories: [
          {
            code: "A-4a",
            description:
              "ESCI kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi ",
            subcategories: [
              { code: "A-4a:1", description: "Çalışma-1" },
              { code: "A-4a:2", description: "Çalışma-2" },
            ],
          },
          {
            code: "A-4b",
            description:
              "ESCI kategorisindeki dergilerde yayımlanmış Derleme, Short Communication=Brief Communication, Vaka/Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma, Kongreye ait tam metin bildiri  ",
            subcategories: [
              { code: "A-4b:1", description: "Çalışma-1" },
              { code: "A-4b:2", description: "Çalışma-2" },
            ],
          },
        ],
      },
      {
        code: "A-5",
        description:
          "Diğer uluslararası alan indeksleri kategorisine girmeyen uluslararası dergiler ile Mesleki ve Kurumsal dergilerde yayımlanan makaleler",
      },
      {
        code: "A-6",
        description:
          "Başvurulan bilim alanında Uluslararası özgün tasarım çalışmaları ve sanat eserleri ile jürili olarak fuar, festival, çalıştay (workshop), gösteri, bienal, trienal gibi etkinliğe bir çalışma ile katılmak",
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

export default function A_part() {
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
        A. Uluslararası Çalışmalar
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
