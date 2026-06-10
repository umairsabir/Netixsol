"use client";
import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/lib/axios";

const schema = yup.object().shape({
    fullName: yup.string().required("Full Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().required("Phone number is required"),
    username: yup.string().required("Username is required"),
    password: yup.string().min(8, "Minimum 8 characters").required("Password is required"),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
    agreed: yup.boolean().oneOf([true], 'You must agree to terms'),
    notRobot: yup.boolean().oneOf([true], 'Please confirm you are not a robot'),
});

export default function RegisterForm() {
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [countryCode, setCountryCode] = useState("+92");
    const [localPhone, setLocalPhone] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const countries = [
        { code: "+92", flag: "🇵🇰", name: "Pakistan" },
        { code: "+91", flag: "🇮🇳", name: "India" },
        { code: "+971", flag: "🇦🇪", name: "UAE" },
        { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
        { code: "+1", flag: "🇺🇸", name: "USA" },
        { code: "+44", flag: "🇬🇧", name: "UK" },
    ];

    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

    const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    const checkUsernameAvailability = async () => {
        const usernameVal = watch("username");
        if (!usernameVal) {
            setUsernameStatus("Please enter a username first.");
            return;
        }
        setIsCheckingUsername(true);
        setUsernameStatus(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setUsernameStatus("Username is available!");
        } catch (e) {
            setUsernameStatus("Failed to check username.");
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const dispatch = useAppDispatch();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            username: "",
            password: "",
            confirmPassword: "",
            agreed: false,
            notRobot: false,
        }
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const nameParts = data.fullName.split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : " ";

            const payload = {
                firstName,
                lastName,
                email: data.email,
                password: data.password,
            };

            const response = await api.post("/auth/register", payload);
            dispatch(setCredentials(response.data));
            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const agreedValue = watch("agreed");
    const notRobotValue = watch("notRobot");

    return (
        <div className="w-full max-w-[592px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.12)] rounded-[5px] px-9 py-10 max-sm:px-5 max-sm:py-7">
            {/* Card header */}
            <div className="mb-6 text-center">
                <h2 className="text-[20px] font-bold text-[#2e3d83]">Register</h2>
                <p className="text-[16px] font-normal text-[#afafaf] mt-1">
                    Do you already have an account?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="font-semibold underline text-[#2e3d83]"
                    >
                        Login Here
                    </button>
                </p>
            </div>

            {error && (
                <div className="mb-5 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Personal Information */}
                <p className="text-[16px] font-semibold text-[#2e3d83] border-b-2 border-[#f9c146] inline-block pb-0.5 mb-4">
                    Personal Information
                </p>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[14px] font-normal text-[#2e3d83]">Enter Your Full Name*</label>
                    <input
                        {...register("fullName")}
                        type="text"
                        placeholder="John Doe"
                        className={`w-full h-10 px-3 border ${errors.fullName ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] text-[14px] text-[#2e3d83] outline-none focus:border-[#2e3d83] placeholder:text-gray-300 transition-colors`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Email + Mobile */}
                <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-normal text-[#2e3d83]">Enter Your Email*</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="john@example.com"
                            className={`w-full h-10 px-3 border ${errors.email ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] text-[14px] text-[#2e3d83] outline-none focus:border-[#2e3d83] placeholder:text-gray-300 transition-colors`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-normal text-[#2e3d83]">Enter Mobile Number*</label>
                        <div className={`relative flex items-center w-full h-10 border ${errors.phone ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] text-[14px] text-[#2e3d83] outline-none focus-within:border-[#2e3d83] transition-colors`}>
                            {/* Dropdown Button */}
                            <div className="relative h-full flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    className="flex items-center gap-1.5 h-full px-3 border-r border-[#eaecf3] hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-[18px]">{selectedCountry.flag}</span>
                                    <ChevronDown size={14} className="text-[#545677]" />
                                    <span className="font-medium">{selectedCountry.code}</span>
                                </button>

                                {/* Dropdown List */}
                                {showCountryDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={() => setShowCountryDropdown(false)} />
                                        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#eaecf3] shadow-lg rounded-[5px] py-1 z-30 max-h-60 overflow-y-auto">
                                            {countries.map((c) => (
                                                <button
                                                    key={c.code}
                                                    type="button"
                                                    onClick={() => {
                                                        setCountryCode(c.code);
                                                        setShowCountryDropdown(false);
                                                        const val = c.code + localPhone;
                                                        setValue("phone", val, { shouldValidate: true });
                                                    }}
                                                    className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-[14px] text-[#2e3d83]"
                                                >
                                                    <span className="text-[18px]">{c.flag}</span>
                                                    <span>{c.name} ({c.code})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Local Phone Input */}
                            <input
                                type="tel"
                                placeholder="3001234567"
                                value={localPhone}
                                onChange={(e) => {
                                    const cleanVal = e.target.value.replace(/\D/g, ""); // Allow only digits
                                    setLocalPhone(cleanVal);
                                    setValue("phone", countryCode + cleanVal, { shouldValidate: true });
                                }}
                                className="flex-1 h-full px-3 bg-transparent outline-none text-[14px] text-[#2e3d83] placeholder:text-gray-300"
                            />
                            <input type="hidden" {...register("phone")} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                </div>

                {/* Account Information */}
                <p className="text-[16px] font-semibold text-[#2e3d83] border-b-2 border-[#f9c146] inline-block pb-0.5 mb-4 mt-6">
                    Account Information
                </p>

                {/* Username */}
                <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[14px] font-normal text-[#2e3d83]">Username*</label>
                    <div className={`relative flex items-center w-full h-10 border ${errors.username ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] text-[14px] text-[#2e3d83] outline-none focus-within:border-[#2e3d83] transition-colors`}>
                        <input
                            {...register("username")}
                            type="text"
                            placeholder="johndoe123"
                            className="flex-1 h-full px-3 bg-transparent outline-none text-[14px] text-[#2e3d83] placeholder:text-gray-300 pr-36"
                        />
                        <button
                            type="button"
                            onClick={checkUsernameAvailability}
                            disabled={isCheckingUsername}
                            className="absolute right-3 text-[14px] font-normal text-[#2e3d83] underline hover:text-[#f9c146] transition-colors cursor-pointer"
                        >
                            {isCheckingUsername ? "Checking..." : "Check Availability"}
                        </button>
                    </div>
                    {usernameStatus && (
                        <p className={`text-xs mt-1 ${usernameStatus.includes("available") ? "text-green-600" : "text-red-500"}`}>
                            {usernameStatus}
                        </p>
                    )}
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-normal text-[#2e3d83]">Password*</label>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPw ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full h-10 px-3 pr-10 border ${errors.password ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] text-[14px] text-[#2e3d83] outline-none focus:border-[#2e3d83] placeholder:text-gray-300 transition-colors`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#545677]"
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-normal text-[#2e3d83]">Confirm Password*</label>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full h-10 px-3 pr-10 border ${errors.confirmPassword ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] text-[14px] text-[#2e3d83] outline-none focus:border-[#2e3d83] placeholder:text-gray-300 transition-colors`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#545677]"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                {/* CAPTCHA */}
                <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[14px] font-medium text-[#2e3d83]">Prove You Are Human</label>
                    <div className={`border ${errors.notRobot ? "border-red-500" : "border-[#eaecf3]"} rounded-[5px] h-12 flex items-center justify-between px-4`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notRobotValue}
                                onChange={(e) => setValue("notRobot", e.target.checked, { shouldValidate: true })}
                                className="w-[22px] h-[22px] border border-[#eaecf3] rounded-[2px] accent-[#2e3d83] cursor-pointer"
                            />
                            <span className="text-[13px] font-semibold text-[#2e3d83]">
                                I&apos;m not a robot
                            </span>
                        </label>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-col gap-[3px]">
                                <span className="block w-6 h-[3px] bg-[#f9c146] rounded" />
                                <span className="block w-6 h-[3px] bg-[#f9c146] rounded" />
                            </div>
                            <span className="text-[9px] text-[#545677] tracking-wide">reCAPTCHA</span>
                        </div>
                    </div>
                    {errors.notRobot && <p className="text-red-500 text-xs mt-1">{errors.notRobot.message}</p>}
                </div>

                {/* Terms */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer mb-1">
                        <input
                            type="checkbox"
                            checked={agreedValue}
                            onChange={(e) => setValue("agreed", e.target.checked, { shouldValidate: true })}
                            className="w-5 h-5 border border-[#2e3d83] rounded-[3px] accent-[#2e3d83] cursor-pointer shrink-0"
                        />
                        <span className="text-[12px] font-semibold text-[#2e3d83]">
                            I agree to the Terms &amp; Conditions
                        </span>
                    </label>
                    {errors.agreed && <p className="text-red-500 text-xs">{errors.agreed.message}</p>}
                </div>

                {/* Submit */}
                <button
                    disabled={isLoading}
                    className="w-full h-10 bg-[#2e3d83] text-white text-[16px] font-bold rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? "Creating Account..." : "Create Account"}
                </button>
            </form>

            {/* Social */}
            <p className="text-center text-[16px] font-normal text-[#2e3d83] capitalize mt-5 mb-3">
                Or Register with
            </p>
            <div className="flex justify-center gap-3.5">
                {/* Google */}
                <button className="w-[50px] h-[50px] rounded-full border-2 border-[#eaecf3] bg-white flex items-center justify-center hover:border-[#2e3d83] transition-colors">
                    <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.90168 0.643478C5.04392 1.62308 2.60883 3.76553 1.25249 6.47682C0.77937 7.41219 0.438703 8.40443 0.230518 9.43457C-0.286774 11.9878 0.0728112 14.7118 1.24619 17.0375C2.00953 18.5543 3.1072 19.9068 4.43201 20.9622C5.68739 21.9608 7.14465 22.7066 8.69656 23.1174C10.6522 23.6419 12.734 23.6293 14.7023 23.1806C16.4813 22.7698 18.1656 21.9166 19.5094 20.6778C20.9288 19.3696 21.9445 17.6506 22.4807 15.7988C23.0673 13.7827 23.143 11.6276 22.7773 9.55467C19.0993 9.55467 15.4151 9.55467 11.7373 9.55467C11.7373 11.0841 11.7373 12.6135 11.7373 14.143C13.8695 14.143 16.0018 14.143 18.1341 14.143C17.8881 15.6092 17.0175 16.9491 15.7873 17.777C15.0114 18.3015 14.1219 18.6365 13.2008 18.8008C12.2798 18.9588 11.3209 18.9778 10.3999 18.7945C9.4599 18.6049 8.57038 18.213 7.78812 17.6632C6.53904 16.7847 5.58646 15.5018 5.1007 14.0545C4.60233 12.5819 4.59602 10.945 5.1007 9.47882C5.45398 8.44235 6.03436 7.48801 6.80401 6.70433C7.75028 5.73107 8.98044 5.03585 10.3116 4.75147C11.4471 4.51131 12.6457 4.55554 13.756 4.89049C14.7023 5.17491 15.5729 5.69945 16.2857 6.38202C17.0049 5.66156 17.7241 4.94106 18.4432 4.22059C18.8217 3.83507 19.2192 3.46217 19.5851 3.06401C18.4937 2.05282 17.2068 1.23753 15.8063 0.719296C13.2829 -0.216045 10.444 -0.235021 7.90168 0.643478Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.9031 0.643475C10.4391 -0.235024 13.2843 -0.216047 15.8077 0.712987C17.2081 1.23122 18.4888 2.04018 19.5865 3.0577C19.2206 3.45586 18.8231 3.82874 18.4446 4.21425C17.7254 4.93475 17.0063 5.65522 16.2871 6.37569C15.5742 5.69314 14.7037 5.17491 13.7574 4.88419C12.6471 4.54923 11.4485 4.49867 10.3129 4.74513C8.98816 5.02955 7.758 5.72473 6.8054 6.69802C6.03578 7.47539 5.45537 8.43602 5.10212 9.47249C3.82148 8.47394 2.54085 7.4817 1.25391 6.48315C2.61024 3.76553 5.04533 1.62308 7.9031 0.643475Z" fill="#EA4335" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.234091 9.42821C0.442275 8.40438 0.782942 7.4058 1.25609 6.47046C2.5367 7.46901 3.81733 8.46125 5.10427 9.45979C4.59959 10.9324 4.59959 12.5692 5.10427 14.0355C3.82364 15.034 2.54303 16.0326 1.2624 17.0248C0.0763836 14.7054 -0.283202 11.9815 0.234091 9.42821Z" fill="#FBBC05" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.7368 9.54834C15.4146 9.54834 19.0988 9.54834 22.7768 9.54834C23.1425 11.615 23.0606 13.7701 22.4802 15.7925C21.944 17.6442 20.9283 19.3633 19.5089 20.6715C18.2661 19.7046 17.0233 18.7376 15.7805 17.7707C17.0107 16.9427 17.8813 15.6029 18.1273 14.1366C15.995 14.1366 13.8627 14.1366 11.7305 14.1366C11.7368 12.6072 11.7368 11.0778 11.7368 9.54834Z" fill="#4285F4" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.25391 17.0314C2.53454 16.0391 3.81518 15.0406 5.09578 14.042C5.58785 15.4893 6.53412 16.7722 7.78323 17.6507C8.56549 18.2005 9.46128 18.5924 10.3949 18.782C11.316 18.9716 12.2686 18.9463 13.1959 18.7883C14.117 18.624 15.0065 18.289 15.7824 17.7645C17.0252 18.7314 18.268 19.6984 19.5108 20.6653C18.1671 21.9104 16.4827 22.7573 14.7037 23.1681C12.7354 23.6168 10.6536 23.6294 8.69797 23.1049C7.14606 22.6941 5.6888 21.9546 4.43339 20.9498C3.11492 19.9006 2.01725 18.5482 1.25391 17.0314Z" fill="#34A853" />
                    </svg>


                </button>
                {/* Facebook */}
                <button className="w-[50px] h-[50px] rounded-full border-2 border-[#eaecf3] bg-white flex items-center justify-center hover:border-[#2e3d83] transition-colors">
                    <svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.36213 21.8713V13.4799C3.36213 12.5515 2.60949 11.7988 1.68107 11.7988C0.752639 11.7988 0 11.0462 0 10.1178V9.85776C0 8.92933 0.752639 8.17669 1.68107 8.17669C2.60949 8.17669 3.36213 7.42406 3.36213 6.49563V5.52072C3.36213 5.52072 3.12027 0 8.02915 0H10.1548C11.1739 0 12 0.826129 12 1.84521C12 2.86429 11.1739 3.69042 10.1548 3.69042H9.52572C9.52572 3.69042 7.70477 3.59425 7.68495 5.42338V6.33375C7.68495 7.35158 8.52743 8.17669 9.54526 8.17669C10.6592 8.17669 11.5291 9.17276 11.3538 10.2728C11.2136 11.1519 10.4554 11.7988 9.56526 11.7988H9.51513C8.48246 11.7988 7.64532 12.636 7.64532 13.6686V19.8584C7.64532 21.0412 6.68649 22 5.50372 22H3.49086C3.41976 22 3.36213 21.9424 3.36213 21.8713Z" fill="#5173BA" />
                    </svg>


                </button>
                {/* Twitter */}
                <button className="w-[50px] h-[50px] rounded-full border-2 border-[#eaecf3] bg-white flex items-center justify-center hover:border-[#2e3d83] transition-colors">
                    <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.00188243 3.30687C0.0367182 2.08948 1.60617 1.8543 2.54352 2.63188C3.24923 3.21729 4.14054 3.8611 5.19081 4.42843C7.55328 5.70457 10.2514 2.61962 12.3798 0.982616C12.5794 0.829112 12.7982 0.678797 13.0381 0.532877C13.0381 0.532877 15.6607 -1.00844 18.3551 1.15162C18.6999 1.42805 19.1264 1.60185 19.5527 1.48547C19.8773 1.39688 20.2996 1.24763 20.7785 0.996815C21.2427 0.753666 21.6844 1.00478 21.4284 1.4621C21.3231 1.65023 21.182 1.86109 20.9933 2.09271C20.6977 2.45551 20.4244 3.08316 20.8684 2.93535C21.2655 2.80316 22.1074 2.86591 21.8643 3.20656C21.6159 3.55474 21.2404 3.95438 20.6757 4.33408C20.28 4.60023 20.0125 5.03612 19.9955 5.51275C19.9017 8.14348 18.859 16.6138 9.43083 18.7296C9.43083 18.7296 6.3162 19.4328 3.01313 18.5711C1.86106 18.2706 1.2277 16.8468 2.39709 16.6229C3.47515 16.4165 4.02992 14.441 3.19928 13.7235C2.80088 13.3793 2.41256 12.9252 2.07262 12.3263C1.89508 12.0136 1.87943 11.6147 2.23844 11.6362C2.66945 11.662 2.92007 11.1994 2.53382 11.0064C1.69689 10.5883 0.658707 9.65979 0.151802 7.59801C0.061698 7.23153 0.152175 6.8059 0.50394 6.94263C0.909536 7.10027 1.40514 6.71542 1.12147 6.38542C0.558107 5.73005 -0.0380208 4.70135 0.00188243 3.30687Z" fill="#1DA1F2" />
                    </svg>

                </button>
            </div>
        </div>
    );
}