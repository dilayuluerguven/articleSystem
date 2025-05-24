import { useState, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
  {
    code: "D",
    description: "D. Ulusal Çalışmalar",
    subcategories: [
      {
        code: "D-1",
        description: "Araştırma makalesi (TR Dizinlerde yer alan)",
        subcategories: [
          {
            code: "D-1.1",
            description:
              "Derleme, Vaka takdimi, Teknik Not, Kısa Makale, Kitap veya Makale Tahlili, Editöre Mektup, Özet, Tartışma, TR dizinlerinde yeralan dergilerde yayımlanmış kongreye ait tam metin bildiriler",
            subcategories: [],
          },
        ],
      },
      {
        code: "D-2",
        description: "Araştırma makalesi (hakemli)",
        subcategories: [
          {
            code: "D-2.1",
            description:
              "Derleme, Vaka takdimi, Teknik Not, Kısa Makale, Kitap veya Makale Tahlili, Editöre Mektup, Özet, Tartışma",
            subcategories: [],
          },
        ],
      },
      {
        code: "D-3",
        description: "Mesleki veya Kurumsal dergilerde makale",
        subcategories: [],
      },
      {
        code: "D-4",
        description:
          "Başvurulan bilim alanında Ulusal özgün tasarım çalışmaları ve sanat eserleri ile jürili olarak fuar, festival, çalıştay (workshop), gösteri, bienal, trienal gibi etkinliğe bir çalışma ile katılmak",
        subcategories: [],
      },
    ],
  },
];

export default function D_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
  const allowedCategoryCodes = ["D-1", "D-2", "D-3", "D-4"];

  const addWork = (parentCategory) => {
    setSelectedCategory(parentCategory);
    setSelectedWork(null);
    setIsModalOpen(true);
    setCount(1);
    setFileName("");
  };

  const editWork = (work, category) => {
    setSelectedCategory(category);
    setSelectedWork(work);
    setIsModalOpen(true);
    setCount(work.count);
    setFileName(work.fileName);
  };

  const handleOk = async () => {
    try {
      // validasyon kısmı
      await formRef.current.validateFields();

      // Validasyon tamamsa ekle
      setIsModalOpen(false);

      setCategories((prevCategories) => {
        const newCategories = JSON.parse(JSON.stringify(prevCategories));

        const findAndAddOrUpdateWork = (categories) => {
          for (let cat of categories) {
            if (cat.code === selectedCategory.code) {
              const nextNumber = (cat.works ? cat.works.length : 0) + 1;
              const newWorkCode = `${cat.code}:${nextNumber}`;

              if (!cat.works) cat.works = [];

              if (selectedWork) {
                selectedWork.description = fileName;
                selectedWork.count = count;
                selectedWork.fileName = fileName;
              } else {
                cat.works.push({
                  code: newWorkCode,
                  description: `Çalışma-${nextNumber}`,
                  count: count,
                  fileName: fileName,
                });
              }
              return;
            }
            if (cat.subcategories) {
              findAndAddOrUpdateWork(cat.subcategories);
            }
          }
        };

        findAndAddOrUpdateWork(newCategories);
        return newCategories;
      });
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    formRef.current.resetFields(); // Formu sıfırlayın
    setIsModalOpen(false); // Modal'ı kapatın
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
    }
  };

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        D.Ulusal Çalışmalar
      </h1>
      <div>
        {categories.map((category) => (
          <CategoryItem
            key={category.code}
            category={category}
            onAddWork={addWork}
            onEditWork={editWork}
            setCategories={setCategories}
            allowedCategoryCodes={allowedCategoryCodes}
          />
        ))}
      </div>
      <WorkModal
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        formRef={formRef}
        selectedCategory={selectedCategory}
        count={count}
        handleFileChange={handleFileChange}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      />
    </div>
  );
}
