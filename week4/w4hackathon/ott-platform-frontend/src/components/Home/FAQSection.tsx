import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: "What is StreamVibe?", a: "StreamVibe is a streaming service that allows you to watch movies and shows on demand.", id: "01" },
  { q: "How much does StreamVibe cost?", a: "StreamVibe offers various subscription plans to fit your budget. See our pricing section.", id: "02" },
  { q: "What content is available on StreamVibe?", a: "We offer a wide variety of movies, TV shows, documentaries, and more.", id: "03" },
  { q: "How can I watch StreamVibe?", a: "You can watch on any internet-connected device, including TVs, phones, tablets, and computers.", id: "04" },
  { q: "How do I sign up for StreamVibe?", a: "Simply click the 'Start Free Trial' button and follow the secure checkout process.", id: "05" },
  { q: "What is the StreamVibe free trial?", a: "New users receive a 7-day free trial with full access to all premium features.", id: "06" },
  { q: "How do I contact StreamVibe customer support?", a: "You can reach us through our Support page, via email, or live chat 24/7.", id: "07" },
  { q: "What are the StreamVibe payment methods?", a: "We accept all major credit cards, PayPal, and regional payment methods.", id: "08" },
];

const FAQSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(['01']);

  const toggleFaq = (id: string) => {
    setOpenIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const leftColumn = faqs.slice(0, 4);
  const rightColumn = faqs.slice(4, 8);

  return (
    <section className="w-full mt-[100px] md:mt-[150px]">
      <div className="w-full max-w-[1920px] mx-auto px-[15px] laptop:px-[80px] desktop:px-[162px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-[80px]">
          <div className="flex flex-col max-w-[900px]">
            <h2 className="text-[28px] md:text-[38px] font-bold text-text-p mb-3">Frequently Asked Questions</h2>
            <p className="text-[14px] md:text-[18px] text-text-s font-normal">Got questions? We've got answers! Check out our FAQ section to find answers to the most common questions about StreamVibe.</p>
          </div>
          <button className="px-6 py-4 bg-primary text-text-p font-semibold text-[18px] rounded-[8px] hover:bg-red-700 transition-colors mt-6 md:mt-0 whitespace-nowrap">
            Ask a Question
          </button>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[30px] md:gap-x-10">
          {[leftColumn, rightColumn].map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-6">
              {column.map((faq) => {
                const isOpen = openIds.includes(faq.id);
                return (
                  <div key={faq.id} className="flex flex-col md:flex-row gap-5 pb-6 border-b border-border-custom cursor-pointer group" onClick={() => toggleFaq(faq.id)}>
                    <div className="w-[50px] md:w-[60px] h-[50px] md:h-[60px] bg-border-custom rounded-[10px] flex items-center justify-center shrink-0">
                      <span className="text-[20px] font-bold text-text-p">{faq.id}</span>
                    </div>
                    <div className="flex flex-col flex-1 mt-1 md:mt-3">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <h3 className="text-[18px] md:text-[22px] font-semibold text-text-p group-hover:text-primary transition-colors">{faq.q}</h3>
                        <button className="text-text-p hover:text-primary transition-colors mt-1 shrink-0">
                          {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                        </button>
                      </div>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-[14px] md:text-[18px] text-text-s font-normal leading-[150%]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
