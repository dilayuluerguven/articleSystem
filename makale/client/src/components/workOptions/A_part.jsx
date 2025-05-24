import { Modal, Form, Input, Button } from "antd";
import { useState, useRef } from "react";
//import { useEffect} from "react";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Icons from "../utils/Icon";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
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
            subcategories: [],
          },
          {
            code: "A-1b",
            description:
              "Q2 kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi",
            subcategories: [],
          },
          {
            code: "A-1c",
            description: "Q1/Q2 kategorisindeki dergilerde yayımlanmış Derleme",
            subcategories: [],
          },
          {
            code: "A-1d",
            description:
              "Q1/Q2 kategorisindeki dergilerde yayımlanmış ‘Short Communication= Brief Communication’",
            subcategories: [],
          },
          {
            code: "A-1e",
            description:
              "Q1/Q2 kategorisindeki dergilerde yayımlanmış kongreye ait (tam metin / bildiri özeti) makale",
            subcategories: [],
          },
          {
            code: "A-1f",
            description:
              "Q1/Q2 kategorisindeki dergilerde yayımlanmış Vaka-Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma ",
            subcategories: [],
          },
          {
            code: "A-1g",
            description:
              "Mimarlık, Planlama ve Tasarım Temel Alanı / Sosyal, Beşeri ve İdari Bilimler Temel Alanı için; Alan indeksleri kapsamındaki dergilerde yayımlanmış makale",
            subcategories: [],
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
            subcategories: [],
          },
          {
            code: "A-2b",
            description:
              "Q4 kategorisindeki dergilerde yayımlanmış özgün araştırma makalesi",
            subcategories: [],
          },
          {
            code: "A-2c",
            description:
              "Q3 / Q4 kategorisindeki dergilerde yayımlanmış Derleme",
            subcategories: [],
          },
          {
            code: "A-2d",
            description:
              "Q3 / Q4 kategorisindeki dergilerde yayımlanmış ‘Short Communication= Brief Communication’",
            subcategories: [],
          },
          {
            code: "A-2e",
            description:
              "Q3/Q4 kategorisindeki dergilerde yayımlanmış kongrede basılmış (tam metin / bildiri özeti) makale",
            subcategories: [],
          },
          {
            code: "A-2f",
            description:
              "Q3 / Q4 kategorisindeki dergilerde yayımlanmış Vaka-Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma ",
            subcategories: [],
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
            subcategories: [],
          },
          {
            code: "A-3b",
            description:
              "ESCI kategorisindeki dergilerde yayımlanmış Derleme, Short Communication=Brief Communication, Vaka/Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma, Kongreye ait tam metin bildiri  ",
            subcategories: [],
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
            subcategories: [],
          },
          {
            code: "A-4b",
            description:
              "ESCI kategorisindeki dergilerde yayımlanmış Derleme, Short Communication=Brief Communication, Vaka/Vaka Serisi Raporu, Teknik Not, Editöre Mektup, Kitap veya Makale Tahlili, Tartışma, Kongreye ait tam metin bildiri  ",
            subcategories: [],
          },
        ],
      },
      {
        code: "A-5",
        description:
          "Diğer uluslararası alan indeksleri kategorisine girmeyen uluslararası dergiler ile Mesleki ve Kurumsal dergilerde yayımlanan makaleler",
        subcategories: [],
      },
      {
        code: "A-6",
        description:
          "Başvurulan bilim alanında Uluslararası özgün tasarım çalışmaları ve sanat eserleri ile jürili olarak fuar, festival, çalıştay (workshop), gösteri, bienal, trienal gibi etkinliğe bir çalışma ile katılmak",
        subcategories: [],
      },
    ],
  },
];





export default function A_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
   const allowedCategoryCodes = ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6"];

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
        A.Uluslararası Çalışmalar
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