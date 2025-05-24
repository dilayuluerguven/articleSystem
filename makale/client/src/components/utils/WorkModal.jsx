import { Modal, Form, Input } from 'antd';
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
            label="Yazar sayısını giriniz"
            name="authorCount"
            rules={[
              { required: true, message: "Lütfen yazar sayısını giriniz!" },
            ]}
          >
            <Input type="number" value={count} min="1" />
          </Form.Item>

          <Form.Item
            label="Belge Yükleyin"
            name="file"
            rules={[
              { required: true, message: "Lütfen bir belge yükleyin!" },
            ]}
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
  );
}