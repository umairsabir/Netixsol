"use client";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import PageHero from "@/components/common/page-hero";
import toast from "react-hot-toast";

const contactSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    subject: yup.string().required("Subject is required"),
    message: yup.string().required("Message is required").min(10, "Message too short"),
});

type ContactFormData = yup.InferType<typeof contactSchema>;

export default function ContactPage() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ContactFormData>({
        resolver: yupResolver(contactSchema)
    });

    const onSubmit = async (data: ContactFormData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Contact Data:", data);
        toast.success("Message sent successfully! We'll get back to you soon.");
        reset();
    };

    const contactInfo = [
        { icon: MapPin, title: "Our Location", detail: "123 Auction Street, Dubai, UAE" },
        { icon: Phone, title: "Our Phone", detail: "+971 50 123 4567" },
        { icon: Mail, title: "Our Email", detail: "support@carauction.com" }
    ];

    return (
        <main className="min-h-screen bg-[#F1F2FF]">
            <PageHero
                title="Get In Touch"
                subtitle="We're here to help you find your dream car."
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
            />

            <section className="max-w-[1440px] mx-auto px-[118px]  pb-10 pt-5 max-lg:px-8 max-sm:px-5">
                <div className="flex gap-16 max-lg:flex-col">
                    {/* Left: Contact Info */}
                    <div className="flex-1 space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-[40px] font-bold text-[#2E3D83]">Let's Talk!</h2>
                            <p className="text-[#545677] text-[18px]">
                                Have questions about an auction or want to list your car? Our team is available 24/7 to assist you.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {contactInfo.map((info, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-[#F9C146] transition-all">
                                        <info.icon className="text-[#2E3D83]" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-[#2E3D83] uppercase tracking-wider">{info.title}</h4>
                                        <p className="text-[18px] text-[#545677] font-medium">{info.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>

                    {/* Right: Contact Form */}
                    <div className="flex-1 bg-white p-12 rounded-[20px] shadow-2xl border border-white/20">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#2E3D83] uppercase opacity-60">Full Name</label>
                                    <input
                                        {...register("name")}
                                        placeholder="John Doe"
                                        className="w-full h-[55px] bg-[#F8F9FF] border border-[#E0E0E0] rounded-[10px] px-5 focus:outline-none focus:border-[#F9C146] transition-all"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#2E3D83] uppercase opacity-60">Email Address</label>
                                    <input
                                        {...register("email")}
                                        placeholder="john@example.com"
                                        className="w-full h-[55px] bg-[#F8F9FF] border border-[#E0E0E0] rounded-[10px] px-5 focus:outline-none focus:border-[#F9C146] transition-all"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#2E3D83] uppercase opacity-60">Subject</label>
                                <input
                                    {...register("subject")}
                                    placeholder="I'm interested in..."
                                    className="w-full h-[55px] bg-[#F8F9FF] border border-[#E0E0E0] rounded-[10px] px-5 focus:outline-none focus:border-[#F9C146] transition-all"
                                />
                                {errors.subject && <p className="text-red-500 text-xs font-medium">{errors.subject.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#2E3D83] uppercase opacity-60">Message</label>
                                <textarea
                                    {...register("message")}
                                    placeholder="Tell us how we can help..."
                                    className="w-full h-[150px] bg-[#F8F9FF] border border-[#E0E0E0] rounded-[10px] px-5 py-4 focus:outline-none focus:border-[#F9C146] transition-all resize-none"
                                />
                                {errors.message && <p className="text-red-500 text-xs font-medium">{errors.message.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-[60px] bg-[#2E3D83] text-white rounded-[10px] font-bold text-[18px] uppercase tracking-wide flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                            >
                                {isSubmitting ? "Sending..." : (
                                    <>
                                        Send Message <Send size={20} className="mb-0.5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
