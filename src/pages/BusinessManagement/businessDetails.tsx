import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { UPLOADS_URL } from "../../constants/api";

const BusinessDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const business = location.state?.user;
  console.log(business);

  // const images = [
  //   { src: "business-gallery-1.png" },
  //   { src: "business-gallery-2.png" },
  //   { src: "business-gallery-3.png" },
  //   { src: "business-gallery-4.png" },
  //   { src: "business-gallery-5.png" },
  //   { src: "business-gallery-6.png" },
  //   { src: "business-gallery-7.png" },
  //   { src: "business-gallery-8.png" },
  // ];

  return (
    <>
      {/* Back button */}
      <div className="flex items-center mb-6">
        <ArrowLeft
          onClick={() => navigate(-1)}
          className="cursor-pointer mr-2"
        />
        <h1 className="text-2xl font-bold">My Business Detail</h1>
      </div>

      {/* Banner */}
      <div className="p-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <img
          src={UPLOADS_URL + business?.image}
          alt="Business Banner"
          className="mx-auto mb-6 w-full max-h-[400px] object-cover rounded-lg"
        />

        {/* Heading */}
        <h2 className="text-[#1C003B] text-left text-[28px] font-normal leading-[25px] tracking-[-0.56px] uppercase mb-4">
          {business?.businessName}
        </h2>

        {/* Subheading */}
        <h3 className="text-[#1C003B] text-[20px] font-normal leading-[25px] tracking-[-0.4px] uppercase mb-3 text-left">
          Description
        </h3>

        {/* Paragraph */}
        <p className="text-[#4E4D60] text-[18px] font-normal leading-[29px] text-left mb-6">
          {business?.about}
        </p>

        <div>
          <ul className="job-card-social-icon">
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M9.00001 0C4.06018 0 0.040318 4.02 0.000319331 8.94C-0.01968 11.34 0.900289 13.62 2.60023 15.32C4.28017 17.04 6.5401 17.98 8.94001 18H9.00001C13.9398 18 17.9597 13.98 17.9997 9.06C18.0397 4.1 14.0198 0.04 9.00001 0ZM13.3599 12L12.9799 12.38L12.9599 12.4C12.2999 13.06 11.7399 13.22 10.8599 12.96C9.93998 12.68 9.12001 12.18 8.38003 11.58C7.32007 10.72 6.18011 9.6 5.44013 8.44C4.70016 7.24 4.46017 5.98 5.50013 4.94L5.52013 4.92L5.90012 4.54C6.18011 4.26 6.64009 4.26 6.94008 4.54L8.12004 5.72C8.40003 6 8.40003 6.46 8.12004 6.76L7.42007 7.46L7.44007 7.48C8.22004 8.66 9.24 9.68 10.42 10.46L10.44 10.48L11.1399 9.78C11.4199 9.5 11.8799 9.5 12.1799 9.78L13.3599 10.96C13.6599 11.26 13.6599 11.72 13.3599 12Z"
                  fill="#0FAAFA"
                />
              </svg>
              {business.phoneNumber}
            </li>
            {/* <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M17.6508 2.24811C17.2295 1.44428 16.3871 0.895874 15.4167 0.895874H2.58333C1.61285 0.895874 0.77046 1.44428 0.349152 2.24811L8.30664 7.5531C8.7265 7.83299 9.2735 7.83299 9.69336 7.5531L17.6508 2.24811ZM0.0625 3.85974V12.5834C0.0625 12.9678 0.148564 13.3322 0.302476 13.6582L5.62888 7.57066L0.0625 3.85974ZM6.88122 8.40556C6.86146 8.43625 6.83921 8.46589 6.81445 8.49418L1.32446 14.7679C1.69489 14.9818 2.12482 15.1042 2.58333 15.1042H15.4167C15.8752 15.1042 16.3051 14.9818 16.6755 14.7679L11.1855 8.49418C11.1608 8.46589 11.1385 8.43625 11.1188 8.40556L10.5254 8.80115C9.60168 9.41694 8.39832 9.41694 7.47461 8.80115L6.88122 8.40556ZM17.9375 12.5834C17.9375 12.9678 17.8514 13.3322 17.6975 13.6582L12.3711 7.57066L17.9375 3.85974V12.5834Z"
                  fill="#0FAAFA"
                />
              </svg>
              bussiness@emailaddress.com
            </li> */}
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="22"
                viewBox="0 0 13 22"
                fill="none"
              >
                <path
                  d="M5.44232 0.592569C0.606146 1.22793 -1.59218 6.95274 1.28604 10.7821C2.46124 12.342 5.10629 15.8678 6.5177 17.7426C6.64619 17.571 9.15959 14.2056 9.18439 14.1609C10.2785 12.6702 12.5411 10.0851 12.7891 8.57634C13.9376 4.35929 10.2421 -0.210494 5.44232 0.592569ZM3.73732 6.74615C3.75017 5.29714 4.97874 4.12891 6.48903 4.12891C7.99932 4.12891 9.22783 5.29721 9.24074 6.74615C9.22789 8.1961 7.99932 9.36338 6.48903 9.36338C4.97874 9.36338 3.75023 8.19603 3.73732 6.74615ZM11.9401 17.5775C11.9401 19.7472 9.50465 21.4996 6.49991 21.4996C1.76343 21.5452 -0.648202 17.3348 2.46711 14.945C2.96922 15.623 5.08344 18.4093 5.21882 18.6093C5.51633 19.0142 5.99866 19.257 6.5156 19.2617C7.02363 19.2617 7.50004 19.0275 7.79656 18.632C7.82029 18.6017 9.94732 15.772 10.4691 15.0284L10.477 15.036C10.5007 15.0057 10.5165 14.9753 10.5402 14.945C11.3942 15.5775 11.9082 16.5429 11.9398 17.5775L11.9401 17.5775Z"
                  fill="#03A2F4"
                />
              </svg>
              {business?.location?.address}
            </li>
          </ul>
        </div>

        {/* Subheading under paragraph */}
        <h3 className="text-[#1C003B] text-[20px] font-normal leading-[25px] tracking-[-0.4px] uppercase mb-6 text-left">
          GALLERY
        </h3>

        {/* Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {business?.gallery?.map((img: any, idx: any) => (
            <div
              key={idx}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <img
                src={UPLOADS_URL + img}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-40 object-cover transform transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BusinessDetails;
