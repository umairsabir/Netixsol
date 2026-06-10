import gsap from 'gsap';

export const fadeIn = (target, delay = 0) =>
  gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 0.6, delay, ease: 'power2.out' });

export const slideUp = (target, delay = 0) =>
  gsap.fromTo(target, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' });

export const staggerIn = (targets, delay = 0) =>
  gsap.fromTo(targets, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, delay, ease: 'power2.out' });

export const scaleIn = (target, delay = 0) =>
  gsap.fromTo(target, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4, delay, ease: 'back.out(1.7)' });

export const countUp = (target, endVal, duration = 1.5) => {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: endVal,
    duration,
    ease: 'power1.out',
    onUpdate: () => { target.textContent = Math.round(obj.val); },
  });
};
