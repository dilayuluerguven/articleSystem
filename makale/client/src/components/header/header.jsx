import { Input } from "antd";
import { SearchOutlined, HomeOutlined } from "@ant-design/icons";

export const Header = () => {
  return (
        <div className="border-b mb-6">
        <header className="py-4 px-6 flex justify-between items-center gap-10 bg-black">
            <div className="header-search flex-1 flex justify-center items-center">
            <Input
                size="large"
                placeholder="Form ara..."
                prefix={<SearchOutlined />}
                className="rounded-full max-w-[800px] m-2  "
            />
            </div>
        </header>       
        </div>
  );
};
