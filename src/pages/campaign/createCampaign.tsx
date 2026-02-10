import { useNavigate } from "react-router";
import { ArrowLeft, Upload } from "lucide-react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Upload as AntUpload,
  DatePicker,
  Checkbox,
} from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface CampaignFormValues {
  couponTitle: string;
  couponDescription: string;
  backgroundImage: any;
  maxCouponUser: number;
  availabilityDate: string;
  expirationDate: string;
  options: string[];
  mediaChannels: string[];
}

const CreateCampaign = () => {
  const [form] = Form.useForm<CampaignFormValues>();
  const navigate = useNavigate();

  const handleSubmit = (values: CampaignFormValues) => {
    console.log("Form Submitted:", values);
    navigate("/");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center mb-6">
        <ArrowLeft
          onClick={() => navigate(-1)}
          className="cursor-pointer mr-2"
        />
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto p-4">
          <Row>
            <Col xs={24} md={18} lg={16}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                requiredMark={false}
              >
                {/* 1 Coupon Title */}
                <Form.Item
                  name="couponTitle"
                  label="Coupon Title"
                  rules={[
                    { required: true, message: "Please enter Coupon Title" },
                  ]}
                >
                  <Input
                    placeholder="Enter Coupon Title"
                    className="web-input"
                  />
                </Form.Item>

                {/* 3 Background Image Upload */}
                <Form.Item name="backgroundImage" label="Background Image">
                  <AntUpload.Dragger
                    name="files"
                    listType="picture"
                    multiple={false}
                    className="h-[150px]"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-6 h-6 mb-2 text-gray-500" />
                      <p className="text-gray-500">Upload Images</p>
                    </div>
                  </AntUpload.Dragger>
                </Form.Item>

                {/* 4 Max Coupon User */}
                <Form.Item
                  name="maxCouponUser"
                  label="Max Coupon User"
                  rules={[
                    {
                      required: true,
                      message: "Please select Max Coupon User",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select max coupon user"
                    className="web-input"
                  >
                    <Option value={1}>1</Option>
                    <Option value={5}>5</Option>
                    <Option value={10}>10</Option>
                    <Option value={-1}>No Limit</Option>
                  </Select>
                </Form.Item>
                <p className="text-[#F6075A] text-sm mb-4">
                  (Limit only one coupon for each user by setting this value to
                  1, a specific customer will not receive more coupons than the
                  specific amount -1 is no limit)
                </p>

                {/* 5 Coupon Availability Date & Hours */}
                <Form.Item
                  name="availabilityDate"
                  label="Coupon Availability Date and Hours"
                  rules={[
                    {
                      required: true,
                      message: "Please select availability date & time",
                    },
                  ]}
                >
                  <DatePicker showTime className="web-input w-full" />
                </Form.Item>

                {/* 6 Expiration Date */}
                <Form.Item
                  name="expirationDate"
                  label="Expiration Date"
                  rules={[
                    {
                      required: true,
                      message: "Please select expiration date",
                    },
                  ]}
                >
                  <DatePicker className="web-input w-full" />
                </Form.Item>

                {/* 7 Advance Options */}
                <h3 className="font-semibold mt-6 mb-2">Advance Options</h3>
                <Form.Item name="options">
                  <Checkbox.Group>
                    <Row gutter={[12, 12]}>
                      <Col>
                        <Checkbox value="sharing">Enable Sharing</Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="referrals">
                          Share only for referrals
                        </Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="donating">Enable Donating</Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="online">
                          Online only (no scanning/store level)
                        </Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="store">
                          In store only (not available online)
                        </Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="original">
                          Original user can only share
                        </Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <hr className="my-4" />

                {/* 8 Media Channels */}
                <h3 className="font-semibold mt-6 mb-2">Media Channels</h3>
                <Form.Item name="mediaChannels">
                  <Checkbox.Group>
                    <Row gutter={[12, 12]}>
                      <Col>
                        <Checkbox value="email">Email</Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="sms">SMS / MMS Message</Checkbox>
                      </Col>
                      <Col>
                        <Checkbox value="push">Push Notification</Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                {/* Submit */}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mt-4 web-btn"
                  >
                    CREATE CAMPAIGN
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default CreateCampaign;
