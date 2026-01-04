import React, { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "../header/header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeftOutlined, 
  FilePdfOutlined, 
  InfoCircleFilled,
  SaveOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled
} from "@ant-design/icons";
import { Button, Badge, Spin, Typography } from "antd";

const { Text } = Typography;

const Form1 = () => {
  const navigate = useNavigate();
  const [formRecord, setFormRecord] = useState(null);
  const today = new Date().toLocaleDateString("sv-SE");
  const [tarih, setTarih] = useState(today);
  const [aItems, setAItems] = useState([]);
  const [loadingA, setLoadingA] = useState(true);
  const [saving, setSaving] = useState(false);

  const [doctorB, setDoctorB] = useState(null);
  const [loadingDoctorB, setLoadingDoctorB] = useState(false);

  const [doctorC, setDoctorC] = useState(null);
  const [loadingDoctorC, setLoadingDoctorC] = useState(false);

  const [dYayinKodlari, setDYayinKodlari] = useState("");
  const [dPuanlar, setDPuanlar] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const fetchDoctorB = async () => {
      try {
        setLoadingDoctorB(true);
        const res = await axios.get("http://localhost:5000/api/form1/doktor/b", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorB(res.data);
      } catch (err) {
        toast.error("B şartı alınırken hata oluştu.");
      } finally {
        setLoadingDoctorB(false);
      }
    };
    fetchDoctorB();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const fetchDoctorC = async () => {
      try {
        setLoadingDoctorC(true);
        const res = await axios.get("http://localhost:5000/api/form1/doktor/c", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctorC(res.data);
      } catch (err) {
        toast.error("C şartı alınırken hata oluştu.");
      } finally {
        setLoadingDoctorC(false);
      }
    };
    fetchDoctorC();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    axios.get("http://localhost:5000/api/form1", { headers })
      .then((res) => {
        if (res.data) {
          setFormRecord(res.data);
          setTarih(res.data.tarih ? res.data.tarih.substring(0, 10) : "");
        }
      });

    axios.get("http://localhost:5000/api/form1/doktor/a", { headers })
      .then((res) => {
        setAItems(res.data.items || []);
        setLoadingA(false);
      })
      .catch(() => setLoadingA(false));
  }, []);

  const downloadPdf = async (id) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/form1/${id}/pdf`,
        {
          a_yayin_kodlari: aItems.map((x) => x.yayin_kodu).join("\n"),
          a_puanlar: aItems.map((x) => Number(x.puan).toFixed(2)).join("\n"),
          b_yayin_kodlari: doctorB?.items.map((x) => x.yayin_kodu).join("\n") || "",
          b_puanlar: doctorB?.items.map((x) => Number(x.hamPuan).toFixed(2)).join("\n") || "",
          c_yayin_kodlari: [
            ...(doctorC?.dItems.map((x) => x.yayin_kodu) || []),
            ...(doctorC?.beItems.map((x) => x.yayin_kodu) || []),
          ].join("\n"),
          c_puanlar: [
            ...(doctorC?.dItems.map((x) => Number(x.hamPuan).toFixed(2)) || []),
            ...(doctorC?.beItems.map((x) => Number(x.hamPuan).toFixed(2)) || []),
          ].join("\n"),
          d_yayin_kodlari: dYayinKodlari,
          d_puanlar: dPuanlar,
        },
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `FORM-1-${id}.pdf`;
      link.click();
    } catch (err) {
      toast.error("PDF indirilirken hata oluştu.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token || !tarih) return toast.error("Eksik bilgi!");

    try {
      setSaving(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = formRecord 
        ? await axios.put(`http://localhost:5000/api/form1/${formRecord.id}`, { tarih }, { headers })
        : await axios.post("http://localhost:5000/api/form1", { tarih }, { headers });
      
      setFormRecord(res.data);
      toast.success("Form kaydedildi!");
      await downloadPdf(res.data.id);
    } catch (err) {
      toast.error("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans antialiased text-slate-900">
      <Header />
      
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all duration-300 font-bold uppercase tracking-widest text-xs mb-8"
        >
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-500/50 group-hover:bg-indigo-50 transition-all shadow-sm">
            <ArrowLeftOutlined className="text-base" />
          </div>
          <span>Geri Dön</span>
        </button>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-tight">
              KONYA TEKNİK ÜNİVERSİTESİ <br />
              <span className="text-indigo-600 text-lg tracking-normal font-bold uppercase text-center">AKADEMİK ATAMA - YÜKSELTME ÖLÇÜTLERİ</span>
            </h1>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full mt-6 shadow-lg shadow-indigo-200" />
          </div>

          <div className="bg-slate-800 text-white py-4 px-6 mb-10 text-center font-black rounded-2xl uppercase tracking-widest text-xs shadow-md">
            DOKTOR ÖĞRETİM ÜYELİĞİ ÖN DEĞERLENDİRME FORMU
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 mb-10 bg-slate-50/30">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-widest">
                  <th className="p-5 border-b border-slate-200 w-16 text-center">Madde</th>
                  <th className="p-5 border-b border-slate-200">Değerlendirme Koşulu</th>
                  <th className="p-5 border-b border-slate-200 w-32 text-center">Yayın Kodları</th>
                  <th className="p-5 border-b border-slate-200 w-32 text-center">Puan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 8-a */}
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="p-5 align-top text-center font-black text-indigo-600">a)</td>
                  <td className="p-5 align-top">
                    <Text className="text-slate-800 font-bold block mb-1">Başlıca Eser Şartı</Text>
                    <Text className="text-slate-500 text-xs leading-relaxed">Aday, başlıca eser niteliğinde en az 1 adet faaliyet yapmış olmalı.</Text>
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2 text-indigo-700">
                        <InfoCircleFilled className="text-xs" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Otomatik Önizleme</span>
                      </div>
                      {loadingA ? <Spin size="small" /> : (
                        <ul className="space-y-1">
                          {aItems.length > 0 ? aItems.map(item => (
                            <li key={item.basvuru_id} className="text-xs text-indigo-900 font-medium">
                              • {item.yayin_kodu} saptandı. ({Number(item.puan).toFixed(2)} Puan)
                            </li>
                          )) : <li className="text-rose-500 text-xs font-bold italic">Başlıca eser kaydı bulunamadı.</li>}
                        </ul>
                      )}
                    </div>
                  </td>
                  <td className="p-5 align-top text-center font-mono text-xs text-indigo-600 font-bold">{aItems.map(i => <div key={i.basvuru_id}>{i.yayin_kodu}</div>)}</td>
                  <td className="p-5 align-top text-center font-mono text-xs text-slate-800 font-black">{aItems.map(i => <div key={i.basvuru_id}>{Number(i.puan).toFixed(2)}</div>)}</td>
                </tr>

                {/* 8-b */}
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="p-5 align-top text-center font-black text-indigo-600">b)</td>
                  <td className="p-5 align-top">
                    <Text className="text-slate-800 font-bold block mb-1">Puan Barajı (60 Puan)</Text>
                    <Text className="text-slate-500 text-xs leading-relaxed">A-1a/b veya A-2a/b yayınlarından 60 puan.</Text>
                    <div className="mt-3 flex items-center justify-between p-4 rounded-2xl bg-slate-100 border border-slate-200">
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase">Toplam Birikim</div>
                        <div className="text-lg font-black text-slate-800">{Number(doctorB?.toplamPuan || 0).toFixed(2)}</div>
                      </div>
                      <Badge 
                        status={doctorB?.meetsCondition ? "success" : "error"} 
                        text={<span className={`font-black text-xs uppercase ${doctorB?.meetsCondition ? 'text-emerald-600' : 'text-rose-600'}`}>{doctorB?.meetsCondition ? "Uygun" : "Yetersiz"}</span>} 
                      />
                    </div>
                  </td>
                  <td className="p-5 align-top text-center font-mono text-xs text-indigo-600 font-bold">{doctorB?.items.map(i => <div key={i.basvuru_id}>{i.yayin_kodu}</div>)}</td>
                  <td className="p-5 align-top text-center font-mono text-xs text-slate-800 font-black">{doctorB?.items.map(i => <div key={i.basvuru_id}>{Number(i.hamPuan).toFixed(2)}</div>)}</td>
                </tr>

                {/* 8-c */}
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="p-5 align-top text-center font-black text-indigo-600">c)</td>
                  <td className="p-5 align-top">
                    <Text className="text-slate-800 font-bold block mb-1">Makale ve Bildiri Şartı</Text>
                    <Text className="text-slate-500 text-xs leading-relaxed">En az 1 adedi D-1 olmak üzere 2 adet D-1/D-2 makale ve 2 adet B-1/E-1 bildiri.</Text>
                    <div className="mt-3 p-4 rounded-2xl bg-slate-100 border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Makale: {doctorC?.dTotal} / 2</span>
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Bildiri: {doctorC?.beTotal} / 2</span>
                      </div>
                      <Badge 
                        status={doctorC?.meetsCondition ? "success" : "error"} 
                        text={<span className={`font-black text-[10px] uppercase ${doctorC?.meetsCondition ? 'text-emerald-600' : 'text-rose-600'}`}>{doctorC?.meetsCondition ? "Şart Sağlandı" : "Eksik Yayın"}</span>} 
                      />
                    </div>
                  </td>
                  <td className="p-5 align-top text-center font-mono text-[10px] text-indigo-600 font-bold">
                    {doctorC?.dItems.map(i => <div key={i.basvuru_id}>{i.yayin_kodu}</div>)}
                    {doctorC?.beItems.map(i => <div key={i.basvuru_id}>{i.yayin_kodu}</div>)}
                  </td>
                  <td className="p-5 align-top text-center font-mono text-[10px] text-slate-800 font-black">
                    {doctorC?.dItems.map(i => <div key={i.basvuru_id}>{Number(i.hamPuan).toFixed(2)}</div>)}
                    {doctorC?.beItems.map(i => <div key={i.basvuru_id}>{Number(i.hamPuan).toFixed(2)}</div>)}
                  </td>
                </tr>

                {/* 8-d */}
                <tr className="bg-slate-50/50">
                  <td className="p-5 align-top text-center font-black text-indigo-600">d)</td>
                  <td className="p-5 align-top">
                    <Text className="text-slate-800 font-bold block mb-2">Lisansüstü Tez Çıktıları (Manuel)</Text>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <textarea 
                        className="bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 shadow-sm h-20" 
                        rows={3} value={dYayinKodlari} onChange={e => setDYayinKodlari(e.target.value)} placeholder="Yayın Kodları"
                      />
                      <textarea 
                        className="bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 shadow-sm h-20" 
                        rows={3} value={dPuanlar} onChange={e => setDPuanlar(e.target.value)} placeholder="Puanlar"
                      />
                    </div>
                  </td>
                  <td className="p-5 align-top text-center font-mono text-xs text-indigo-600 whitespace-pre-line font-bold">{dYayinKodlari || "-"}</td>
                  <td className="p-5 align-top text-center font-mono text-xs text-slate-800 whitespace-pre-line font-black">{dPuanlar || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Belge Tarihi</label>
              <input
                type="date"
                className="bg-white border border-slate-200 px-5 py-3 rounded-2xl outline-none focus:border-indigo-500 text-slate-700 font-bold shadow-sm"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              disabled={saving}
              className="h-16 px-12 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 border-none font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 w-full md:w-auto justify-center"
            >
              {saving ? <Spin size="small" /> : <><SaveOutlined /> Kaydet ve PDF Oluştur</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form1;