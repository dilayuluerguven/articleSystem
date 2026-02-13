import React from "react";
import {
  FileTextOutlined,
  ProfileOutlined,
  FormOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

const UpperPart = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex justify-center items-center h-auto w-full py-16 px-6 relative overflow-hidden border-b border-slate-200">
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1 flex justify-center md:justify-start">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <img
              src="/images/formImage.png"
              alt="Form Önizleme"
              className="relative w-full max-w-xs md:max-w-sm select-none drop-shadow-2xl rounded-xl transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div className="flex-[1.5] text-center px-4 select-none">
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight">
            Formunuzu <span className="text-indigo-600">Biz</span> Hazırlayalım
          </h2>
          <p className="text-slate-500 text-lg md:text-2xl mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
            Bilgilerinizi dijital ortama girin, akademik teşvik formunuzu
            saniyeler içinde{" "}
            <span className="font-bold text-slate-700 underline decoration-indigo-300 underline-offset-4">
              PDF olarak
            </span>{" "}
            teslim alın.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
              <FileDoneOutlined className="text-green-500" /> Otomatik Hesaplama
              <span className="mx-2 opacity-30">|</span>
              <ProfileOutlined className="text-blue-500" /> Standart Format
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-end">
          <img
            src="/images/sekil.png"
            alt="Grafik Şekil"
            className="w-full max-w-[280px] opacity-80 select-none animate-pulse-slow"
          />
        </div>
      </div>

      <FileTextOutlined className="absolute top-12 right-12 text-indigo-200 text-4xl rotate-12 hidden md:block" />
      <ProfileOutlined className="absolute bottom-12 right-24 text-slate-200 text-5xl -rotate-12 hidden md:block" />
      <FormOutlined className="absolute top-24 left-16 text-blue-200 text-3xl hidden md:block" />
      <FileDoneOutlined className="absolute bottom-20 left-20 text-indigo-100 text-5xl rotate-6 hidden md:block" />
    </div>
  );
};

export default UpperPart;
