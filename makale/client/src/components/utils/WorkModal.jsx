import { Modal, Form, Input, Radio, Upload, Select } from "antd";
import { useState, useEffect } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

export default function WorkModal({
  isModalOpen,
  handleOk,
  handleCancel,
  formRef,
  selectedCategory,
  initialCount = 1,
}) {
  const [mainSelection, setMainSelection] = useState(null);
  const [subSelection, setSubSelection] = useState(null);
  const [childSelection, setChildSelection] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [count, setCount] = useState(initialCount);
  const [workDescription, setWorkDescription] = useState("");
  const [authorPosition, setAuthorPosition] = useState("ilk");
  const [selectedPuanId, setSelectedPuanId] = useState(null);

  useEffect(() => {
    setCount(initialCount);
    setMainSelection(null);
    setSubSelection(null);
    setChildSelection(null);
    setSelectedFile(null);
    setWorkDescription("");
    setAuthorPosition("ilk");
    setSelectedPuanId(null);
  }, [isModalOpen, initialCount]);

  useEffect(() => {
    if (!isModalOpen) return;
    const isAdmin =
      sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin");
    if (isAdmin === "1") {
      toast.error("Admin kullanıcılar başvuru ekleyemez.");
      handleCancel();
    }
  }, [isModalOpen, handleCancel]);

  const handleMainChange = (e) => {
    setMainSelection(e.target.value);
    setSubSelection(null);
    setChildSelection(null);
  };

  const handleSubChange = (e) => {
    setSubSelection(e.target.value);
    setChildSelection(null);
  };

  const handleChildChange = (e) => {
    setChildSelection(e.target.value);
  };

  const handleModalOk = () => {
    const isAdmin =
      sessionStorage.getItem("is_admin") || localStorage.getItem("is_admin");
    if (isAdmin === "1") {
      toast.error("Admin kullanıcılar başvuru ekleyemez.");
      handleCancel();
      return;
    }

    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin!");
      return;
    }
    if (!workDescription.trim()) {
      toast.error("Lütfen künyenizi giriniz!");
      return;
    }

    handleOk({
      ust_aktivite_id: selectedCategory.ust_aktivite_id,
      alt_aktivite_id: selectedCategory.alt_aktivite_id,
      aktivite_id: selectedCategory.aktivite_id,
      akademik_puan_id: selectedPuanId,
      mainSelection,
      subSelection,
      childSelection,
      file: selectedFile,
      yazarSayisi: count,
      workDescription,
      authorPosition,
    });
  };

  return (
    <Modal
      title={selectedCategory ? selectedCategory.tanim : ""}
      open={isModalOpen}
      onOk={handleModalOk}
      onCancel={handleCancel}
      closable={false}
      destroyOnHidden
    >
      {selectedCategory && (
        <Form
          ref={formRef}
          name="workForm"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
        >
          <Form.Item
            label="Künyeyi giriniz"
            name="workDescription"
            rules={[{ required: true, message: "Lütfen künyenizi giriniz!" }]}
          >
            <Input.TextArea
              placeholder="Künyenizi buraya giriniz"
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Yazar sayısı"
            name="authorCount"
            rules={[{ required: true, message: "Yazar sayısını giriniz!" }]}
          >
            <Input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </Form.Item>

          <Form.Item
            label="Yazar Pozisyonu"
            name="authorPosition"
            rules={[{ required: true, message: "Yazar pozisyonunu seçiniz!" }]}
          >
            <Select
              value={authorPosition}
              onChange={(value) => setAuthorPosition(value)}
            >
              <Select.Option value="ilk">İlk Yazar</Select.Option>
              <Select.Option value="diger">Diğer Yazar</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Belge Yükleyin">
            <Upload.Dragger
              name="file"
              multiple={false}
              beforeUpload={(file) => {
                setSelectedFile(file);
                return false;
              }}
              fileList={selectedFile ? [selectedFile] : []}
              onRemove={() => setSelectedFile(null)}
              accept=".pdf,.doc,.docx,.jpg,.png"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Belgenizi buraya sürükleyin ya da tıklayarak seçin
              </p>
              <p className="ant-upload-hint">
                PDF, Word veya görsel dosya yükleyebilirsiniz.
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            label="Ana Başlıklar"
            name="mainSelection"
            rules={[
              { required: true, message: "Lütfen bir ana başlık seçiniz!" },
            ]}
          >
            <Radio.Group onChange={handleMainChange} value={mainSelection}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Radio value="baslicaEser">BAŞLICA ESER</Radio>
                <Radio value="digerFaaliyet">DİĞER FAALİYET</Radio>
                <Radio value="docentlikSonrasi">DOÇENTLİK SONRASI</Radio>
                <Radio value="doktoraSonrasi">DOKTORA SONRASI</Radio>
              </div>
            </Radio.Group>
          </Form.Item>
          {selectedCategory?.kod === "P" && (
            <Form.Item
              label="Kategori"
              name="pKategori"
              rules={[{ required: true, message: "Lütfen kategori seçiniz!" }]}
            >
              <Select
                placeholder="Uluslararası/Ulusal"
                onChange={(value) => setSelectedPuanId(value)}
                value={selectedPuanId}
              >
                <Select.Option value={163}>
                  Uluslararası (15 Puan)
                </Select.Option>
                <Select.Option value={164}>Ulusal (5 Puan)</Select.Option>
              </Select>
            </Form.Item>
          )}

          {mainSelection === "baslicaEser" && (
            <Form.Item
              label="Başlıca Eserler"
              name="subSelection"
              rules={[
                { required: true, message: "Lütfen bir alt başlık seçiniz!" },
              ]}
            >
              <Radio.Group onChange={handleSubChange} value={subSelection}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: 20,
                  }}
                >
                  <Radio value="tekYazarli">Tek Yazarlı Makale</Radio>
                  <Radio value="ogrenciyle">
                    Danışmanlığını yürüttüğü lisansüstü öğrenciler ile üretilen
                    makaleler
                  </Radio>
                  <Radio value="adayTez">
                    Adayın Kendi Lisansüstü Tezlerinden Ürettiği Makaleler
                  </Radio>
                  <Radio value="projedenMakale">
                    Projeden Üretilmiş Makale
                  </Radio>
                  <Radio value="kitap">Kitap Yazarlığı</Radio>
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          {subSelection === "ogrenciyle" && (
            <Form.Item
              label="Makale Türü"
              name="childSelection"
              rules={[
                { required: true, message: "Lütfen makale türünü seçiniz!" },
              ]}
              style={{ paddingLeft: 40 }}
            >
              <Radio.Group onChange={handleChildChange} value={childSelection}>
                <Radio value="tezden">Tezden</Radio>
                <Radio value="tezHarici">
                  Tez Harici (Öğrencilik devam ederken)
                </Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {subSelection === "adayTez" && (
            <Form.Item
              label="Tez Türü"
              name="childSelection"
              rules={[
                { required: true, message: "Lütfen tez türünü seçiniz!" },
              ]}
              style={{ paddingLeft: 40 }}
            >
              <Radio.Group onChange={handleChildChange} value={childSelection}>
                <Radio value="yuksekLisans">Yüksek Lisans Tezinden</Radio>
                <Radio value="doktora">
                  Doktora/Sanatta Yeterlilik Tezinden
                </Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>
      )}
    </Modal>
  );
}
