import React from "react";
import {
  FileTextOutlined,
  ProfileOutlined,
  FormOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

const UpperPart = () => {
  return (
    <div className="bg-green-200 flex justify-between h-auto w-full p-10 relative">
      <div className="flex items-center px-5 lg:px-20 gap-10 md:gap-16">
        {/* Sol taraftaki form resmi */}
        <div>
          <img
            src="/images/formImage.png"
            alt="Form"
            className="w-full max-w-xs md:max-w-md"
          />
        </div>

        {/* Metin Alanı */}
        <div className="text-center px-5 md:px-10">
          <h2 className="text-4xl md:text-5xl font-semibold italic">
            Formunuzu Biz Hazırlayalım
          </h2>
          <p className="text-gray-700 text-lg md:text-xl mt-2">
            Bilgilerinizi girin, formunuzu PDF olarak alın...
          </p>
        </div>

        <div>
          <img
            src="/images/sekil.png"
            alt="Form"
            className="w-full max-w-xs md:max-w-md"
          />
        </div>
      </div>

      {/* İkonlar */}
      <FileTextOutlined className="absolute top-6 right-8 text-gray-600 text-xl md:text-2xl rotate-12" />
      <ProfileOutlined className="absolute bottom-4 right-6 text-gray-600 text-2xl md:text-3xl -rotate-6" />
      <FormOutlined className="absolute top-16 left-10 text-gray-600 text-xl md:text-2xl" />
      <FileDoneOutlined className="absolute bottom-10 left-8 text-gray-600 text-xl md:text-2xl rotate-6" />
    </div>
  );
};

export default UpperPart;
