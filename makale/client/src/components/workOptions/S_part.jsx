import { useState, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
  {
    code: "S",
    description: "S.Üniversite Yönetimine ve İşleyişine Katkılar",
    subcategories: [
      {
        code: "S-1",
        description: "Akademik yükseltilme ve atama jüri üyelikleri (x sayı)",
        subcategories: [],
      },
      {
        code: "S-2",
        description:
          "Rektör, Rektör Yardımcısı, Dekan, Enstitü / Yüksekokul / Meslek Yüksekokulu Müdürü (x yıl)",
        subcategories: [],
      },
      {
        code: "S-3",
        description: "Dekan Yardımcısı, Müdür Yardımcısı (x yıl)",
        subcategories: [],
      },
      {
        code: "S-4",
        description:
          "Bölüm / Anabilim Dalı Başkanı / Uygulama Araştırma Merkezi Müdürü (x yıl)",
        subcategories: [],
      },
      {
        code: "S-5",
        description:
          "Üniversite Yönetim Kurulu / Senato / Komisyon Üyeliği ve Koordinatörlük (x yıl)",
        subcategories: [],
      },
      {
        code: "S-6",
        description:
          "Fakülte / Enstitü / Yüksekokul Yönetim Kurul Üyeliği (x yıl) ",
        subcategories: [],
      },
      {
        code: "S-7",
        description: "Bölüm Komisyon Üyeliği ve Koordinatörlük (x yıl)",
        subcategories: [],
      },
    ],
  },
];

export default function S_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
  const allowedCategoryCodes = [
    "S-1",
    "S-2",
    "S-3",
    "S-4",
    "S-5",
    "S-6",
    "S-7",
  ];

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
  // useEffect(() => {
  //   if (isModalOpen) {
  //     formRef.current.resetFields();
  //   }
  // }, [isModalOpen]);
  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-lg m-5">
      <h1 className="text-xl font-semibold mb-6 text-center select-none">
        S.Üniversite Yönetimine ve İşleyişine Katkılar
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
