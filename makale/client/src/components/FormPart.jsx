import { useEffect, useState, useRef } from "react";
import {
  Button,
  Spin,
  Card,
  Checkbox,
  Typography,
  Row,
  Col,
  Tooltip,
  Space,
  Badge,
} from "antd";
import {
  PlusCircleOutlined,
  DownOutlined,
  RightOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  InfoCircleFilled,
  AppstoreOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import WorkModal from "./utils/WorkModal";

const { Title, Text } = Typography;

export default function FormPart() {
  const [categories, setCategories] = useState([]);
  const [selectedUst, setSelectedUst] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userRole, setUserRole] = useState("");
  const formRef = useRef(null);

  const disallowedCodes = [
    "A",
    "A-1",
    "A-2",
    "A-3",
    "A-4",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "O-1",
    "O-2",
    "O-6",
    "O-7",
    "R",
    "S",
  ];

  const formList = [
    { id: 1, label: "Form-1", path: "/form1" },
    { id: 2, label: "Form-3", path: "/form3" },
    { id: 3, label: "Form-4", path: "/form4" },
    { id: 4, label: "Form-5", path: "/form5" },
    { id: 5, label: "Form-6", path: "/form6" },
  ];

  useEffect(() => {
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    if (role) {
      setUserRole(role.trim().toLowerCase());
    }

    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => toast.error("Kategoriler yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  const toggleUst = (kod, id) => {
    setSelectedUst((prev) =>
      prev.includes(kod) ? prev.filter((k) => k !== kod) : [...prev, kod]
    );
    setExpanded((prev) => ({ ...prev, [id]: true }));
  };

  const toggleAll = () => {
    if (selectedUst.length === categories.length) {
      setSelectedUst([]);
      setExpanded({});
    } else {
      setSelectedUst(categories.map((c) => c.kod));
      const openAll = {};
      categories.forEach((c) => (openAll[c.id] = true));
      setExpanded(openAll);
    }
  };
  const handleAddBasvuru = async (payload) => {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const formData = new FormData();
      formData.append("ust_aktivite_id", payload.ust_aktivite_id);

      if (payload.alt_aktivite_id)
        formData.append("alt_aktivite_id", payload.alt_aktivite_id);

      if (payload.aktivite_id)
        formData.append("aktivite_id", payload.aktivite_id);

      formData.append("yazar_sayisi", payload.yazarSayisi);
      formData.append("main_selection", payload.mainSelection);
      formData.append("sub_selection", payload.subSelection || "");
      formData.append("child_selection", payload.childSelection || "");
      formData.append("workDescription", payload.workDescription);
      formData.append("authorPosition", payload.authorPosition);
      formData.append("file", payload.file);

      await axios.post("http://localhost:5000/api/basvuru", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Başvuru başarıyla eklendi");
      setModalOpen(false);
    } catch (err) {
      toast.error("Başvuru eklenemedi");
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isAltAktivite = (kod) => /^[A-Z]-\d+$/.test(kod);
  const isAktivite = (kod) =>
    /^[A-Z]-\d+[a-z]+$/i.test(kod) || /^[A-Z]-\d+\.\d+$/.test(kod);

  const openModal = ({ ust, alt, node }) => {
    if (userRole === "admin") {
      toast.warning("Admin kullanıcılar çalışma ekleyemez.");
      return;
    }
    setSelectedCategory({
      ust_aktivite_id: ust.id,
      alt_aktivite_id: isAktivite(node.kod) ? alt?.id : node.id,
      aktivite_id: isAktivite(node.kod) ? node.id : null,
      kod: node.kod,
      tanim: node.tanim,
    });
    setModalOpen(true);
  };

  const renderNode = (node, level = 0, ust, currentAlt = null) => {
    const hasChildren = node.subcategories?.length > 0;
    const isExpanded = expanded[node.id];
    const isDisallowed = disallowedCodes.includes(node.kod);
    const nextAlt = isAltAktivite(node.kod) ? node : currentAlt;

    return (
      <div key={node.id} className="relative transition-all duration-300">
        <div
          className={`
          group flex justify-between items-center transition-all duration-300 mb-4
          ${
            level === 0
              ? "p-6 bg-indigo-600 rounded-[2.5rem] shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] border-b-4 border-indigo-800 text-white translate-y-0 hover:-translate-y-1"
              : "p-4 ml-10 md:ml-16 bg-white rounded-2xl border border-slate-200 text-white hover:border-indigo-300 hover:shadow-md"
          }
        `}
        >
          {level > 0 && (
            <div className="absolute left-[-2.5rem] md:left-[-3.5rem] top-[-1.5rem] bottom-1/2 w-10 border-l-2 border-b-2 border-slate-300 rounded-bl-2xl" />
          )}

          <div className="flex items-center gap-5 flex-1 overflow-hidden">
            {hasChildren ? (
              <Button
                type="primary"
                shape="circle"
                className={`flex items-center justify-center border-none shadow-md transition-transform ${
                  level === 0
                    ? "bg-white text-indigo-600 w-10 h-10 scale-110"
                    : "bg-indigo-100 text-indigo-600"
                }`}
                icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                onClick={() => toggleExpand(node.id)}
              />
            ) : (
              <div
                className={`w-6 flex justify-center ${
                  level === 0 ? "hidden" : ""
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-400" />
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className={`font-black tracking-tighter ${
                    level === 0
                      ? "text-2xl opacity-90"
                      : "text-indigo-600 text-sm"
                  }`}
                >
                  {node.kod}
                </span>
                <span
                  className={`
                    font-bold truncate 
                    ${
                      level === 0
                        ? "text-xl text-white tracking-tight"
                        : "text-base text-slate-700"
                    }
                  `}
                >
                  {node.tanim}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4">
            {!isDisallowed && (
              <Button
                type="primary"
                size={level === 0 ? "large" : "middle"}
                shape="round"
                icon={<PlusCircleOutlined />}
                onClick={() => openModal({ ust, alt: nextAlt, node })}
                className={`
                font-black transition-all hover:scale-105 shadow-lg border-none
                ${
                  level === 0
                    ? "bg-white text-indigo-600 hover:bg-indigo-50 px-8"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }
              `}
              >
                Ekle
              </Button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div
              className={`absolute left-[1.8rem] top-0 bottom-6 w-1 rounded-full ${
                level === 0 ? "bg-indigo-100" : "bg-slate-200"
              }`}
              style={{ marginLeft: level * 64 }}
            />
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 pb-4">
              {node.subcategories.map((child) =>
                renderNode(child, level + 1, ust, nextAlt)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  <div className="bg-slate-50/50 rounded-[4rem] p-4 md:p-10 border border-slate-100 shadow-inner">
    {categories
      .filter((u) => selectedUst.includes(u.kod))
      .map((u) => (
        <div key={u.id} className="mb-20 last:mb-0 relative">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500/10 rounded-full -ml-4" />

          {renderNode(u, 0, u, null)}
        </div>
      ))}
  </div>;

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans antialiased text-slate-900">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-2xl shadow-sm shadow-indigo-100">
              <AppstoreOutlined className="text-indigo-600 text-xl" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-1">
                Akademik Teşvik Paneli
              </h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Doldurmak istediğiniz formu seçiniz
              </p>
            </div>
          </div>

          <div className="bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 flex items-center flex-wrap gap-1 shadow-inner">
            {formList.map((form) => (
              <Button
                key={form.id}
                type="text"
                icon={<FileTextOutlined style={{ fontSize: 13 }} />}
                onClick={() => (window.location.href = form.path)}
                className={`
                  flex items-center h-10 px-5 rounded-xl text-xs font-bold transition-all duration-300
                  hover:bg-white hover:text-indigo-600 hover:shadow-md
                  ${
                    window.location.pathname === form.path
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50 font-black"
                      : "text-slate-500"
                  }
                `}
              >
                {form.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center lg:items-start gap-4 min-w-[280px]">
            <Checkbox
              className="text-slate-700 font-bold text-lg"
              checked={selectedUst.length === categories.length}
              onChange={toggleAll}
            >
              Tümünü Seç
            </Checkbox>
            <div className="flex items-center gap-2">
              <Badge count={selectedUst.length} showZero color="#4f46e5" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">
                Kategori Seçildi
              </span>
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-center text-center lg:text-left">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10">
              <FilePdfOutlined style={{ fontSize: "200px" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3 relative z-10">
              Kategori Rehberi
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-xl relative z-10 opacity-90 font-medium italic mx-auto lg:mx-0">
              Kod numarasını seçmek için kutucuğu işaretleyiniz. Alt
              faaliyetlerde "Ekle" butonunu kullanarak belgelerinizi
              yükleyebilirsiniz.
            </p>
          </div>
        </div>

        <Row gutter={[20, 20]}>
          {categories.map((ust) => {
            const isSelected = selectedUst.includes(ust.kod);
            return (
              <Col key={ust.id} xs={12} sm={8} md={6} lg={4}>
                <Tooltip title={ust.tanim} mouseEnterDelay={0.5}>
                  <div
                    onClick={() => toggleUst(ust.kod, ust.id)}
                    className={`
                      relative group p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 h-full flex flex-col items-center justify-center text-center
                      ${
                        isSelected
                          ? "border-indigo-500 bg-white shadow-2xl shadow-indigo-100 scale-[1.05] ring-4 ring-indigo-50"
                          : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl shadow-sm"
                      }
                    `}
                  >
                    <div
                      className={`text-3xl font-black mb-3 transition-all duration-300 ${
                        isSelected
                          ? "text-indigo-600 scale-110"
                          : "text-slate-300 group-hover:text-indigo-400"
                      }`}
                    >
                      {ust.kod}
                    </div>
                    <div
                      className={`text-[11px] font-bold tracking-tight px-2 leading-tight transition-colors ${
                        isSelected
                          ? "text-slate-800"
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    >
                      {ust.tanim}
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </Tooltip>
              </Col>
            );
          })}
        </Row>

        {selectedUst.length > 0 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
              <Title level={3} className="!mb-0 text-slate-800 tracking-tight">
                Faaliyet Listesi
              </Title>
            </div>

            {userRole === "admin" && (
              <div className="relative overflow-hidden bg-indigo-50 border border-indigo-200 rounded-[2rem] p-5 shadow-sm flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-md">
                  <CrownOutlined className="text-indigo-600 text-xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-indigo-900 font-bold text-sm">
                    Yönetici Modu Aktif
                  </p>
                  <p className="text-indigo-700 text-xs leading-relaxed">
                    Şu anda{" "}
                    <span className="font-semibold">
                      kullanıcı görünümündesiniz
                    </span>
                    . Bu alanda veri ekleme yetkiniz yoktur; yalnızca kullanıcı
                    deneyimini görüntüleyebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-16 border border-slate-100">
              {categories
                .filter((u) => selectedUst.includes(u.kod))
                .map((u) => (
                  <div key={u.id} className="mb-12 last:mb-0">
                    {renderNode(u, 0, u, null)}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <WorkModal
        isModalOpen={modalOpen}
        handleCancel={() => setModalOpen(false)}
        handleOk={handleAddBasvuru}
        selectedCategory={selectedCategory}
        formRef={formRef}
      />
    </div>
  );
}
