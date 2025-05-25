import { useState, useRef } from "react";
import WorkModal from "../utils/WorkModal";
import CategoryItem from "../utils/CategoryItem";

const initialCategories = [
  {
    code: "O",
    description: "O.Bilimsel / Sanatsal Faaliyetlere Katkı",
    subcategories: [
      {
        code: "O-1",
        subcategories: [
          {
            code: "O-1.1",
            description:
              "Q kategorisindeki dergilerde yapılan hakemlik (değerlendirilen makale başına)",
            subcategories: [],
          },
          {
            code: "O-1.2",
            description:
              "Q kategorisi dışındaki diğer uluslararası dergilerde yapılan hakemlik (değerlendirilen makale başına)",
            subcategories: [],
          },
          {
            code: "O-1.3",
            description:
              "Uluslararası Sanat ve Tasarım Etkinliklerinde Hakemlik veya Jüri Üyeliği ",
            subcategories: [],
          },
          {
            code: "O-1.4",
            description:
              "AB gibi Uluslararası bilimsel / sanatsal projelerde hakemlik / jüri üyeliği (değerlendirilen proje başına)",
            subcategories: [],
          },
          {
            code: "O-1.5",
            description:
              "Uluslararası Kongre / Sempozyum bildirilerindeki hakemlik  ",
            subcategories: [],
          },
        ],
      },
      {
        code: "O-2",

        subcategories: [
          {
            code: "O-2.1",
            description:
              "Q kategorisindeki dergilerde yayın kurulu üyelikleri (x yıl)",
            subcategories: [],
          },
          {
            code: "O-2.2",
            description:
              "Q kategorisi dışındaki dergilerde yayın kurulu üyelikleri (x yıl)",
            subcategories: [],
          },
        ],
      },
      {
        code: "O-3",
        description: "Bilim - Sanat kurulu başkanlığı / üyeliği (x yıl)",
        subcategories: [],
      },
      {
        code: "O-4",
        description: "Uluslararası bir standartın hazırlanmasında görev almak ",
        subcategories: [],
      },
      {
        code: "O-5",
        description:
          "Bilimsel / Sanatsal toplantı düzenleme kurul başkanlığı / editörlüğü / kurul üyeliği ",
        subcategories: [],
      },
      {
        code: "O-6",

        subcategories: [
          {
            code: "O-6.1",
            description:
              "Q1 ve Q2 kategorisindeki dergilerde editör / editör yardımcılığı / editör kurulu üyeliği (x yıl)",
            subcategories: [],
          },
          {
            code: "O-6.2",
            description:
              "Q3 ve Q4 kategorisindeki dergilerde editör / editör yardımcılığı / editör kurulu üyeliği (x yıl)",
            subcategories: [],
          },
          {
            code: "O-6.3",
            description:
              "Q kategorisi dışındaki dergilerde editör / editör yardımcılığı / editör kurulu üyeliği  (x yıl)",
            subcategories: [],
          },
        ],
      },
      {
        code: "O-7",
        description: "Ulusal",
        subcategories: [
          {
            code: "O-7.1",
            description: "Hakemlikler / Jüri üyeliği / Proje panelistlik",
            subcategories: [],
          },
          {
            code: "O-7.2",
            description:
              "Ulusal Sanat ve Tasarım Etkinliklerinde Hakemlik veya Jüri Üyeliği ",
            subcategories: [],
          },
          {
            code: "O-7.3",
            description:
              "TÜBİTAK, Bakanlıklar, Ulusal ölçekte tanınmış en az 3 yıl periyodik olarak düzenlenen bilimsel yarışmalar için projelerde hakemlik veya jüri üyeliği (değerlendirilen proje başına) /dış danışmanlık görevi / proje izleyicilik görevi (her bir dönem için)",
            subcategories: [],
          },
          {
            code: "O-7.4",
            description:
              "Üniversite Bilimsel araştırma Projelerinde (BAP) hakemlik (değerlendirilen proje başına) ",
            subcategories: [],
          },
        ],
      },
      {
        code: "O-8",
        description: "Yayın kurulu üyelikleri (x yıl)",
        subcategories: [],
      },
      {
        code: "O-9",
        description: "Bilim / Sanat kurulu başkanlığı / üyeliği (x yıl) ",
        subcategories: [],
      },
      {
        code: "O-10",
        description: "Ulusal bir standartın hazırlanmasında görev almak ",
        subcategories: [],
      },
      {
        code: "O-11",
        description:
          "Bilimsel / Sanatsal toplantı düzenleme kurul başkanlığı / editörlüğü / kurul üyeliği ",
        subcategories: [],
      },
      {
        code: "O-12",
        description:
          "Dergilerde editörlük / editör yardımcılığı / editör kurul üyeliği (x yıl) ",
        subcategories: [],
      },
    ],
  },
];

export default function O_part() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [count, setCount] = useState(1);
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null);
  const allowedCategoryCodes = ["O-3", "O-4", "O-5", "O-8","O-9","O-10","O-11","O-12"];

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
      await formRef.current.validateFields();

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
    formRef.current.resetFields(); 
    setIsModalOpen(false); 
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
        O.Bilimsel / Sanatsal Faaliyetlere Katkı
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
