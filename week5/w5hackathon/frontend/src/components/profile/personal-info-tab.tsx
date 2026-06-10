"use client";
import { useState, useEffect, useRef } from "react";
import { Edit2, User, Mail, ShieldCheck, Phone, Globe, CreditCard, Image as ImageIcon, Camera, Loader2, Check, Upload } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { updateUser } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import Image from "next/image";

type ProfileFormData = {
    firstName: string;
    lastName: string;
    phone: string;
    nationality: string;
    idType: string;
};

export default function PersonalInfoTab() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>();

    useEffect(() => {
        setIsMounted(true);
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                nationality: user.nationality || "",
                idType: user.idType || "",
            });
        }
    }, [user, reset]);

    if (!isMounted || !user) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, (data as any)[key]);
            });
            
            if (selectedFile) {
                formData.append('profilePicture', selectedFile);
            }

            const response = await api.patch('/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            dispatch(updateUser(response.data));
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            setSelectedFile(null);
            setPreviewImage(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 w-full animate-in fade-in duration-500">
            {/* Account Details */}
            <div className="bg-[#F1F2FF] rounded-[5px] overflow-hidden shadow-sm">
                <div className="bg-[#2E3D83] h-10 flex items-center justify-between px-6">
                    <h3 className="text-white text-[18px] font-bold">Account Details</h3>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                            <Edit2 size={12} />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {isEditing ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                            {/* Edit Mode Header / Avatar Upload */}
                            <div className="flex flex-col items-center gap-4 pb-4 border-b border-[#EAECF3]">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {(previewImage || user.profilePicture) ? (
                                            <Image 
                                                src={previewImage || user.profilePicture} 
                                                alt="Preview" 
                                                width={128} 
                                                height={128} 
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <Camera size={32} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm font-bold text-[#2E3D83] hover:underline"
                                >
                                    Change Profile Photo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* First Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#2E3D83] uppercase tracking-wider opacity-60">First Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F9C146]" />
                                        <input 
                                            {...register("firstName", { required: true })}
                                            className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] pl-12 pr-4 text-[#2E3D83] focus:outline-none focus:border-[#2E3D83]"
                                        />
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#2E3D83] uppercase tracking-wider opacity-60">Last Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F9C146]" />
                                        <input 
                                            {...register("lastName", { required: true })}
                                            className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] pl-12 pr-4 text-[#2E3D83] focus:outline-none focus:border-[#2E3D83]"
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#2E3D83] uppercase tracking-wider opacity-60">Mobile Number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F9C146]" />
                                        <input 
                                            {...register("phone")}
                                            placeholder="Enter mobile number"
                                            className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] pl-12 pr-4 text-[#2E3D83] focus:outline-none focus:border-[#2E3D83]"
                                        />
                                    </div>
                                </div>

                                {/* Nationality */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#2E3D83] uppercase tracking-wider opacity-60">Nationality</label>
                                    <div className="relative">
                                        <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F9C146]" />
                                        <input 
                                            {...register("nationality")}
                                            placeholder="Enter nationality"
                                            className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] pl-12 pr-4 text-[#2E3D83] focus:outline-none focus:border-[#2E3D83]"
                                        />
                                    </div>
                                </div>

                                {/* ID Type */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#2E3D83] uppercase tracking-wider opacity-60">ID Type</label>
                                    <div className="relative">
                                        <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F9C146]" />
                                        <input 
                                            {...register("idType")}
                                            placeholder="Passport / Emirates ID"
                                            className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] pl-12 pr-4 text-[#2E3D83] focus:outline-none focus:border-[#2E3D83]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t border-[#EAECF3] pt-8">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setPreviewImage(null);
                                        setSelectedFile(null);
                                    }}
                                    className="h-[50px] px-8 border border-[#EAECF3] rounded-[5px] text-[#2E3D83] font-bold hover:bg-white/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="h-[50px] px-10 bg-[#2E3D83] text-white rounded-[5px] font-bold hover:bg-opacity-95 transition-all shadow-md flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                                    {user.profilePicture ? (
                                        <Image 
                                            src={user.profilePicture} 
                                            alt={user.firstName} 
                                            width={128} 
                                            height={128} 
                                            className="w-full h-full object-cover" 
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Camera size={32} />
                                            <span className="text-[10px] font-bold uppercase mt-1">No Photo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-[20px] font-bold text-[#2E3D83]">{user.firstName} {user.lastName}</span>
                                    <span className="text-[14px] text-[#A0A0A0]">{user.email}</span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-8 gap-x-12 pt-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-[#2E3D83] uppercase tracking-widest opacity-50">Mobile Number</label>
                                    <div className="flex items-center gap-3 text-[16px] text-[#2E3D83] font-semibold">
                                        <Phone size={16} className="text-[#F9C146]" />
                                        <span>{user.phone || "Not provided"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-[#2E3D83] uppercase tracking-widest opacity-50">Nationality</label>
                                    <div className="flex items-center gap-3 text-[16px] text-[#2E3D83] font-semibold">
                                        <Globe size={16} className="text-[#F9C146]" />
                                        <span>{user.nationality || "Not provided"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-[#2E3D83] uppercase tracking-widest opacity-50">ID Type</label>
                                    <div className="flex items-center gap-3 text-[16px] text-[#2E3D83] font-semibold">
                                        <CreditCard size={16} className="text-[#F9C146]" />
                                        <span>{user.idType || "Not provided"}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-[#2E3D83] uppercase tracking-widest opacity-50">Email Status</label>
                                    <div className="flex items-center gap-3 text-[16px] text-green-600 font-semibold">
                                        <Check size={16} className="text-[#F9C146]" />
                                        <span>Verified Account</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Security Section (Static for now) */}
            <div className="bg-[#F1F2FF] rounded-[5px] overflow-hidden shadow-sm">
                <div className="bg-[#2E3D83] h-10 flex items-center px-6">
                    <h3 className="text-white text-[18px] font-bold">Security & Preferences</h3>
                </div>
                <div className="p-8">
                    <div className="flex items-center justify-between bg-white/50 p-6 rounded-lg border border-[#EAECF3]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-[#2E3D83]">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500">Keep your account secure with 2FA protection</p>
                            </div>
                        </div>
                        <button className="h-10 px-6 bg-white border border-[#2E3D83] text-[#2E3D83] font-bold text-xs rounded-[5px] uppercase tracking-tighter hover:bg-[#F1F2FF] transition-colors">Enable 2FA</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
