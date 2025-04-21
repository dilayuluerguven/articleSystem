import { Modal, Form, Input, Button } from "antd";
import { useState, useRef } from "react";
import { DeleteOutlined } from "@ant-design/icons";

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

const handleDeleteWork = (workToDelete, category, setCategories) => {
  setCategories((prevCategories) => {
    const newCategories = JSON.parse(JSON.stringify(prevCategories)); // Deep clone

    const findAndDeleteWork = (categories) => {
      for (let cat of categories) {
        if (cat.code === category.code) {
          // `works` dizisinden ilgili çalışmayı sil
          cat.works = cat.works.filter((work) => work.code !== workToDelete.code);
          return true; // Çalışma silindi
        }
        // Eğer alt kategoriler varsa, onları da kontrol et
        if (cat.subcategories) {
          if (findAndDeleteWork(cat.subcategories)) {
            return true; // Alt kategoride çalışma silindi
          }
        }
      }
      return false; // Çalışma bulunamadı
    };

    findAndDeleteWork(newCategories); // Çalışmayı sil
    return newCategories;
  });
};

function CategoryItem({ category, onAddWork, setCategories }) {
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

          {category.works &&
  category.works.map((work, idx) => (
    <div
      key={idx}
      className="mt-3 text-sm text-blue-700 flex items-center space-x-4 "
    >
      <span className="w-1/4">{work.code}:</span>
      <a
        href={work.fileName ? URL.createObjectURL(new Blob([work.fileName])) : "#"}
        download={work.fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline flex-grow"
      >
        {work.fileName}
      </a>
      {/* Çöp kutusu ikonu */}
      <DeleteOutlined
        className="ml-4 text-red-600 cursor-pointer"
        onClick={() => handleDeleteWork(work, category, setCategories)} // Silme işlevi
      />
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
                setCategories={setCategories}
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
  const [fileName, setFileName] = useState("");
  const formRef = useRef(null); // Form referansı

  const addWork = (parentCategory) => {
    setSelectedCategory(parentCategory);
    setIsModalOpen(true);
    setCount(1);
    setFileName("");
  };

  const handleOk = async () => {
    try {
      // Formu validate et
      await formRef.current.validateFields();

      // Validasyon başarılı ise, çalışma ekle
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
    } catch (error) {
      // Eğer validation hatası varsa, burada bir şey yapabilirsiniz
      console.log("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      //setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const onFinish = (values) => {
    console.log("Success:", values);
    // Burada form submit işlemleri yapılabilir.
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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
            setCategories={setCategories}
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
          <Form
            ref={formRef}
            name="workForm"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Künyeyi giriniz"
              name="workDescription"
              rules={[{ required: true, message: "Lütfen künyenizi giriniz!" }]}
            >
              <Input.TextArea placeholder="Künyenizi buraya giriniz" />
            </Form.Item>

            <Form.Item
              label="Yazar sayısını giriniz"
              name="authorCount"
              rules={[{ required: true, message: "Lütfen yazar sayısını giriniz!" }]}
            >
              <Input
                type="number"
                value={count}
                min="1"
              />
            </Form.Item>

            <Form.Item
              label="Belge Yükleyin"
              name="file"
              rules={[{ required: true, message: "Lütfen bir belge yükleyin!" }]}
            >
              <Input
                type="file"
                onChange={handleFileChange}
                className="w-full border p-2 rounded mb-3"
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
