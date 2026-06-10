"use client";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/axios";
import Image from "next/image";

const schema = yup.object().shape({
    vin: yup.string().required("VIN is required"),
    year: yup.number().required("Year is required"),
    make: yup.string().required("Make is required"),
    model: yup.string().required("Model is required"),
    category: yup.string().required("Category is required"),
    mileage: yup.number().optional(),
    engineSize: yup.string().optional(),
    paint: yup.string().required("Paint is required"),
    hasGccSpecs: yup.string().optional(),
    description: yup.string().optional(),
    noteworthyFeatures: yup.string().optional(),
    accidentHistory: yup.string().optional(),
    fullServiceHistory: yup.string().optional(),
    hasBeenModified: yup.boolean().optional(),
    startingBid: yup.number().min(0, "Must be positive").required("Starting bid is required"),
    minIncrement: yup.number().min(1, "Min 1$").default(100),
    auctionDuration: yup.number().required("Duration is required").default(3),
});

export default function SellForm() {
    const [sellerType, setSellerType] = useState<"dealer" | "private">("dealer");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            hasBeenModified: false,
            auctionDuration: 3,
            minIncrement: 100
        }
    });

    const hasBeenModified = watch("hasBeenModified");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray]);
            
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });
            formData.append("title", `${data.year} ${data.make} ${data.model}`);
            images.forEach(image => {
                formData.append("images", image);
            });

            await api.post("/cars", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            router.push("/auction");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit listing. Please check all fields.");
        } finally {
            setIsLoading(false);
        }
    };

    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full max-w-[800px] mx-auto pb-40">
            {/* Header Text - Hidden or simplified to match the "Car Details" snippet focus */}
            
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {/* Car Details Form Matching Image */}
            <div className="bg-[#F1F2FF] rounded-[10px] p-8 md:p-12 flex flex-col shadow-sm">
                <div className="mb-10">
                    <h3 className="text-[28px] font-bold text-black font-[family-name:var(--font-sans)] leading-none inline-block relative pb-2 uppercase tracking-tight">
                        Car Details
                        <span className="absolute bottom-0 left-0 w-1/2 h-[4px] bg-[#F4C23D] rounded-full"></span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-8">
                    {/* VIN */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">VIN*</label>
                        <input {...register("vin")} type="text" className={`w-full h-[50px] bg-white border ${errors.vin ? "border-red-500" : "border-[#EAECF3]"} rounded-[5px] px-4 focus:outline-none focus:border-[#2E3D83] transition-all`} />
                    </div>

                    {/* Year */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Year*</label>
                        <div className="relative">
                            <select {...register("year")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Make */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Make*</label>
                        <div className="relative">
                            <select {...register("make")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select Make</option>
                                <option value="Toyota">Toyota</option>
                                <option value="Honda">Honda</option>
                                <option value="Ford">Ford</option>
                                <option value="BMW">BMW</option>
                                <option value="Mercedes">Mercedes</option>
                                <option value="Audi">Audi</option>
                                <option value="Tesla">Tesla</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Model */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Model*</label>
                        <div className="relative">
                            <select {...register("model")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">All Models</option>
                                <option value="Camry">Camry</option>
                                <option value="Civic">Civic</option>
                                <option value="F-150">F-150</option>
                                <option value="3 Series">3 Series</option>
                                <option value="C-Class">C-Class</option>
                                <option value="A4">A4</option>
                                <option value="Model 3">Model 3</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Category (Adding for Logic) */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Category*</label>
                        <div className="relative">
                            <select {...register("category")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select Category</option>
                                <option value="SUV">SUV</option>
                                <option value="Sedan">Sedan</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="Coupe">Coupe</option>
                                <option value="Truck">Truck</option>
                                <option value="Electric">Electric</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Mileage */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Mileage (in miles)</label>
                        <input {...register("mileage")} type="number" className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 focus:outline-none focus:border-[#2E3D83]" />
                    </div>

                    {/* Engine Size */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Engine size</label>
                        <div className="relative">
                            <select {...register("engineSize")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select</option>
                                <option value="1.0L - 1.5L">1.0L - 1.5L</option>
                                <option value="1.6L - 2.0L">1.6L - 2.0L</option>
                                <option value="2.1L - 3.0L">2.1L - 3.0L</option>
                                <option value="3.1L - 4.0L">3.1L - 4.0L</option>
                                <option value="4.1L+">4.1L+</option>
                                <option value="Electric">Electric</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Paint */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Paint*</label>
                        <div className="relative">
                            <select {...register("paint")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select</option>
                                <option value="White">White</option>
                                <option value="Black">Black</option>
                                <option value="Silver">Silver</option>
                                <option value="Grey">Grey</option>
                                <option value="Red">Red</option>
                                <option value="Blue">Blue</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Has GCC Specs */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Has GCC Specs</label>
                        <div className="relative">
                            <select {...register("hasGccSpecs")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Noteworthy Options */}
                <div className="flex flex-col gap-3 mb-8">
                    <label className="text-[20px] font-medium text-black">Noteworthy options/features</label>
                    <textarea {...register("noteworthyFeatures")} className="w-full h-[150px] bg-white border border-[#EAECF3] rounded-[5px] p-4 focus:outline-none focus:border-[#2E3D83] resize-none"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-8">
                    {/* Accident History */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Accident History</label>
                        <div className="relative">
                            <select {...register("accidentHistory")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select</option>
                                <option value="None">None</option>
                                <option value="Minor">Minor</option>
                                <option value="Major">Major</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Full Service History */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Full Service History</label>
                        <div className="relative">
                            <select {...register("fullServiceHistory")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="">Select</option>
                                <option value="Full Dealer History">Full Dealer History</option>
                                <option value="Partial History">Partial History</option>
                                <option value="No History">No History</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Modification Status Toggle */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Has the car been modified?</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setValue("hasBeenModified", false)}
                                className={`flex-1 h-[50px] rounded-[5px] border ${!hasBeenModified ? "bg-white border-[#2E3D83] text-[#2E3D83] shadow-sm" : "bg-white border-[#EAECF3] text-[#A0A0A0]"} text-[16px] font-bold transition-all`}
                            >
                                Completely stock
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue("hasBeenModified", true)}
                                className={`flex-1 h-[50px] rounded-[5px] border ${hasBeenModified ? "bg-white border-[#2E3D83] text-[#2E3D83] shadow-sm" : "bg-white border-[#EAECF3] text-[#A0A0A0]"} text-[16px] font-bold transition-all`}
                            >
                                Modified
                            </button>
                        </div>
                    </div>

                    {/* Starting Bid / Min Starting Bid */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Min Starting Bid*</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <span className="text-[#2E3D83] font-bold">$</span>
                            </div>
                            <input {...register("startingBid")} type="number" className={`w-full h-[50px] bg-white border ${errors.startingBid ? "border-red-500" : "border-[#EAECF3]"} rounded-[5px] pl-10 pr-4 focus:outline-none focus:border-[#2E3D83] transition-all`} />
                        </div>
                    </div>

                    {/* Auction Duration (Adding for Logic) */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Auction Duration (Days)*</label>
                        <div className="relative">
                            <select {...register("auctionDuration")} className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 appearance-none text-[#2E3D83] text-[16px] font-medium focus:outline-none focus:border-[#2E3D83] cursor-pointer">
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                            </select>
                            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E3D83] pointer-events-none" />
                        </div>
                    </div>

                    {/* Min Increment (Adding for Logic) */}
                    <div className="flex flex-col gap-3">
                        <label className="text-[20px] font-medium text-black">Min Increment ($)*</label>
                        <input {...register("minIncrement")} type="number" className="w-full h-[50px] bg-white border border-[#EAECF3] rounded-[5px] px-4 focus:outline-none focus:border-[#2E3D83]" />
                    </div>
                </div>

                {/* Upload Photos Section */}
                <div className="flex flex-col gap-6 mb-10 pt-4">
                    <label className="text-[24px] font-bold text-black uppercase tracking-tight">Upload Photos</label>
                    <div className="flex flex-wrap gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="relative w-32 h-32 rounded-[5px] overflow-hidden border border-[#EAECF3] shadow-md group">
                                <Image src={src} alt="Preview" fill className="object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <label className="w-40 h-[50px] border-2 border-[#EAECF3] rounded-[5px] flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-gray-50 transition-all shadow-sm">
                            <Plus size={20} className="text-[#2E3D83]" />
                            <span className="text-[16px] font-bold text-[#2E3D83]">Add Photos</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>
                
                <div className="pt-6">
                    <button 
                        disabled={isLoading}
                        type="submit" 
                        className="w-full h-[60px] bg-[#2E3D83] text-white text-[20px] font-bold rounded-[5px] hover:bg-opacity-95 active:scale-[0.99] transition-all uppercase tracking-[2px] shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </form>
    );
}
