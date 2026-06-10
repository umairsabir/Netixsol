import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError("");
      await adminLogin(data.email, data.password);
      navigate("/admin");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid admin credentials",
      );
    }
  };

  return (
    <div className="min-h-screen bg-bg-custom flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-primary" />
          </div>
          <h1 className="text-text-p text-[28px] font-bold">Admin Portal</h1>
          <p className="text-text-s text-[14px] mt-2">
            StreamVibe Control Center
          </p>
        </div>

        <div className="bg-surface border border-border-darker rounded-[12px] p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {error && (
              <div className="bg-red-900/30 border border-primary text-primary text-sm rounded-[8px] px-4 py-3">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-text-p text-[14px] font-medium">
                Admin Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@streamvibe.com"
                className="bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
              />
              {errors.email && (
                <span className="text-primary text-[12px]">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-p text-[14px] font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 pr-12 text-text-p text-[14px] outline-none focus:border-primary transition-colors placeholder:text-text-s"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-s hover:text-text-p"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-primary text-[12px]">
                  {errors.password.message}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-text-p font-semibold text-[16px] rounded-[8px] py-4 hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Authenticating…" : "Sign In to Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
