import {
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Select } from "antd";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { SuccessPopup, ErrorPopup } from "../popup/Popup";
import { useSignupMutation } from "../../redux/services/authSlice";

const { Option } = Select;

interface SignUpFormValues {
  fullName: string;
  email: string;
  gender: string;
  password: string;
  confirmPassword: string;
  agreeTerms?: boolean;
}

const SignUpForm: React.FC = () => {
  const [form] = Form.useForm<SignUpFormValues>();
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (values: SignUpFormValues) => {
    if (!values.agreeTerms) {
      form.setFields([{ name: "agreeTerms", errors: ["Please accept the terms"] }]);
      return;
    }
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("fullName", values.fullName);
    formData.append("gender", values.gender);
    formData.append("password", values.password);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    try {
      await signup(formData).unwrap();
      SuccessPopup("Account created. Please sign in.");
      navigate("/signin");
    } catch (err: any) {
      ErrorPopup(err?.data?.message || "Sign up failed.");
    }
  };

  return (
    <div className="md:w-4xl my-4">
    <div className="bg-white p-8 rounded-lg">
      

         <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
            Create Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Fill out this form to sign up
            </p>
          </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          className="auth-form"
        >
          <Form.Item
            name="fullName"
            label="Full Name*"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input placeholder="Enter Full Name" className="web-input" />
          </Form.Item>

          {/* Email + Gender */}
          <div className="form-row">
            <Form.Item
              name="email"
              label="Email Address*"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" }
              ]}
              className="form-col"
            >
              <Input placeholder="Enter Email Address" className="web-input" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender*"
              rules={[{ required: true, message: "Please select your gender" }]}
              className="form-col"
            >
              <Select placeholder="Select Gender"  className="web-input">
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
                <Option value="OTHER">Other</Option>
              </Select>
            </Form.Item>
          </div>

  

          {/* Password + Confirm Password */}
          <div className="form-row">
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
              className="form-col"
            >
              <Input.Password
                placeholder="••••••••"
                className="password-filed-login web-input"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
                
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match")
                    );
                  }
                })
              ]}
              className="form-col"
            >
              <Input.Password
                placeholder="••••••••"
                className="password-filed-login web-input"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </div>

          {/* Profile image (optional) */}
          <Form.Item label="Profile photo" className="mb-2">
            <Input
              type="file"
              accept="image/*"
              className="web-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setImageFile(file ?? null);
              }}
            />
          </Form.Item>

          {/* Terms */}
          <Form.Item
            name="agreeTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error("Please accept the terms")),
              },
            ]}
          >
            <Checkbox>
              By signing up, you are agreeing to our{" "}
              <Link
                to="/terms"
                className="terms-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("/terms", "_blank", "noopener,noreferrer");
                }}
              >
                Terms & Condition {" "}
              </Link> 
                and  {" "}
               <Link
                to="/privacy"
                className="terms-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("/privacy", "_blank", "noopener,noreferrer");
                }}
              >
                 Privacy Policy
              </Link>.
            </Checkbox>
          </Form.Item>

     
          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className="mt-4 web-btn"
            >
              Create account
            </Button>
          </Form.Item>

          {/* Already have account */}
          <div className="auth-prompt">
            <span>Already have an account? </span>
            <Button
              className="auth-link"
              onClick={() => navigate("/signin")}
            >
               SIGN IN
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignUpForm;
