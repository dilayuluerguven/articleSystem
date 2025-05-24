import { useState, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
  {
    code: "G",
    description: "G. Atıflar",
    subcategories: [
      {
        code: "G-1",
        description:
          "Q kategorisindeki dergilerde yer alan yayınlarda ve uluslararası nitelikte bilimsel kitaplarda geçen her atıf için.Mimarlık, Planlama ve Tasarım Temel Alanı / Sosyal, Beşeri ve İdari Bilimler Temel Alanı için A-1g kategorisinde tanımlanan  Alan indeksleri kapsamındaki dergilerde yayımlanmış makale ve  “Books Acquisition Index” kapsamına giren kitap ya da kitap bölümünde geçen her atıf için",
        subcategories: [],
      },
      {
        code: "G-2",
        description:
          "Diğer uluslararası alan indeks listelerindeki dergilerde yer alan yayınlardaki her atıf için",
        subcategories: [],
      },
      {
        code: "G-3",
        description:
          "Diğer yurtdışı, yurtiçi dergi, kitap ve proceedings de bulunan her atıf için",
        subcategories: [],
      },
      {
        code: "G-4",
        description: "Patentlere yapılan her atıf için",
        subcategories: [],
      },
    ],
  },
];

export default function G_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
  const allowedCategoryCodes = ["G-1", "G-2", "G-3", "G-4"];

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
        G.Atıflar
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
