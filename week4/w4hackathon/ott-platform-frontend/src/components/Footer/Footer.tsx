import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0F0F0F] pt-[100px] border-t border-[#1F1F1F]">
      <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px] flex flex-col items-start justify-start w-full gap-[60px] pb-[40px]">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full gap-[30px]">
          <div className="flex flex-col items-start gap-4 text-[16px] md:text-[18px]">
            <h4 className="font-semibold text-text-p mb-2">Home</h4>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Categories</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Devices</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Pricing</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">FAQ</a>
          </div>
          <div className="flex flex-col items-start gap-4 text-[16px] md:text-[18px]">
            <h4 className="font-semibold text-text-p mb-2">Movies</h4>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Gernes</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Trending</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">New Release</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Popular</a>
          </div>
          <div className="flex flex-col items-start gap-4 text-[16px] md:text-[18px]">
            <h4 className="font-semibold text-text-p mb-2">Shows</h4>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Gernes</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Trending</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">New Release</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Popular</a>
          </div>
          <div className="flex flex-col items-start gap-4 text-[16px] md:text-[18px]">
            <h4 className="font-semibold text-text-p mb-2">Support</h4>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Contact Us</a>
          </div>
          <div className="flex flex-col items-start gap-4 text-[16px] md:text-[18px]">
            <h4 className="font-semibold text-text-p mb-2">Subscription</h4>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Plans</a>
            <a href="#" className="text-text-s font-normal hover:text-text-p transition-colors">Features</a>
          </div>
          <div className="flex flex-col items-start gap-[24px]">
            <h4 className="font-semibold text-[18px] text-text-p">Connect With Us</h4>
            <div className="flex items-center gap-[14px]">
              <a href="#" className="w-[44px] h-[44px] bg-[#1A1A1A] border-[#1F1F1F] border rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#1F1F1F] transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4687H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92187 17.3438 4.92187V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4687H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="white" />
              </svg>
              </a>
              <a href="#" className="w-[44px] h-[44px] bg-[#1A1A1A] border-[#1F1F1F] border rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#1F1F1F] transition-colors"><svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.55016 19.5007C16.6045 19.5007 21.5583 11.9974 21.5583 5.49259C21.5583 5.28166 21.5536 5.06603 21.5442 4.85509C22.5079 4.15819 23.3395 3.29499 24 2.30603C23.1025 2.70533 22.1496 2.96611 21.1739 3.07947C22.2013 2.46364 22.9705 1.4962 23.3391 0.356499C22.3726 0.92929 21.3156 1.33334 20.2134 1.55134C19.4708 0.762293 18.489 0.239849 17.4197 0.0647834C16.3504 -0.110282 15.2532 0.0717828 14.2977 0.582829C13.3423 1.09387 12.5818 1.90544 12.1338 2.89204C11.6859 3.87865 11.5754 4.98535 11.8195 6.04103C9.86249 5.94282 7.94794 5.43444 6.19998 4.54883C4.45203 3.66323 2.90969 2.42017 1.67297 0.900249C1.0444 1.98398 0.852057 3.26638 1.13503 4.48682C1.418 5.70727 2.15506 6.77418 3.19641 7.47072C2.41463 7.4459 1.64998 7.23541 0.965625 6.85666V6.91759C0.964925 8.05488 1.3581 9.15732 2.07831 10.0375C2.79852 10.9177 3.80132 11.5213 4.91625 11.7457C4.19206 11.9439 3.43198 11.9727 2.69484 11.8301C3.00945 12.8082 3.62157 13.6636 4.44577 14.2771C5.26997 14.8905 6.26512 15.2313 7.29234 15.252C5.54842 16.6218 3.39417 17.3649 1.17656 17.3613C0.783287 17.3607 0.390399 17.3366 0 17.2892C2.25286 18.7345 4.87353 19.5021 7.55016 19.5007Z" fill="white" />
              </svg>
              </a>
              <a href="#" className="w-[44px] h-[44px] bg-[#1A1A1A] border-[#1F1F1F] border rounded-[8px] flex items-center justify-center text-text-p hover:bg-[#1F1F1F] transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z" fill="white" />
              </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center py-[24px] border-t border-[#1F1F1F] gap-6">
          <p className="text-[14px] md:text-[16px] text-[#999999] font-normal">@2023 streamVibe, All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[14px] md:text-[16px] text-[#999999] hover:text-text-p transition-colors">Terms of Use</a>
            <a href="#" className="text-[14px] md:text-[16px] text-[#999999] hover:text-text-p transition-colors border-l border-r border-[#1F1F1F] px-6">Privacy Policy</a>
            <a href="#" className="text-[14px] md:text-[16px] text-[#999999] hover:text-text-p transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
