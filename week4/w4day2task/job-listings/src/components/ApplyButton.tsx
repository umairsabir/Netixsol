'use client';

export default function ApplyButton() {
  const handleApply = () => {
    alert('Apply Successfully');
  };

  return (
    <button className="apply-button" onClick={handleApply}>
      Apply Now
    </button>
  );
}
