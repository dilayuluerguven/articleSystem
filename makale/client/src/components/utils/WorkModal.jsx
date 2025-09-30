import { Modal, Form, Input, Radio, Upload } from "antd";
import {  useState } from "react";
import { InboxOutlined } from "@ant-design/icons";

export default function WorkModal({
  isModalOpen,
  handleOk,
  handleCancel,
  formRef,
  selectedCategory,
  count,
  handleFileChange,
  onFinish,
  onFinishFailed,
}) {
  const [mainSelection, setMainSelection] = useState(null);
  const [subSelection, setSubSelection] = useState(null);
  const [childSelection, setChildSelection] = useState(null);

  // useEffect(() => {
  //   if (!isModalOpen) {
  //     setMainSelection(null);
  //     setSubSelection(null);
  //     setChildSelection(null);
  //     formRef?.current?.resetFields();
  //   }
  // }, [isModalOpen]);

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
  

  return (
    <Modal
      title={selectedCategory ? selectedCategory.description : ""}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      closable={false}
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
            label="Yazar sayısı"
            name="authorCount"
            rules={[{ required: true, message: "Yazar sayısını giriniz!" }]}
          >
            <Input type="number" value={count} min="1" />
          </Form.Item>

          <Form.Item
            label="Belge Yükleyin"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Lütfen bir belge yükleyin!" }]}
          >
            <Upload.Dragger
              name="file"
              multiple={false}
              beforeUpload={(file) => {
                handleFileChange({ target: { files: [file] } });
                return false;
              }}
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

          <Form.Item label="Ana Başlıklar">
            <Radio.Group onChange={handleMainChange} value={mainSelection}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Radio value="baslicaEser">BAŞLICA ESER</Radio>
                <Radio value="digerFaaliyet">DİĞER FAALİYET</Radio>
                <Radio value="docentlikSonrasi">DOÇENTLİK SONRASI</Radio>
                <Radio value="doktoraSonrasi">DOKTORA SONRASI</Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          {mainSelection === "baslicaEser" && (
            <Form.Item label="Başlıca Eserler">
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
                    Yürütücülüğünü yaptığı projelerden üretilmiş makale
                  </Radio>

                  <Radio value="kitap">Kitap Yazarlığı</Radio>
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          {subSelection === "ogrenciyle" && (
            <Form.Item label="Makale Türü" style={{ paddingLeft: 40 }}>
              <Radio.Group onChange={handleChildChange} value={childSelection}>
                <Radio value="tezden">Tezden</Radio>
                <Radio value="tezHarici">
                  Tez Harici (Öğrencilik devam ederken)
                </Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {subSelection === "adayTez" && (
            <Form.Item label="Tez Türü" style={{ paddingLeft: 40 }}>
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
