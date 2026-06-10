document.addEventListener("DOMContentLoaded", () => {

            // THEME TOGGLE
            const toggleBtn = document.getElementById("themeToggle");
            const html = document.documentElement;
            const circle = document.getElementById("toggleCircle");
            const icon = document.getElementById("icon");

            if (!html.classList.contains("dark")) {
                circle.style.transform = "translateX(24px)";
                icon.textContent = "☀️";
            }

            toggleBtn.addEventListener("click", () => {
                html.classList.toggle("dark");

                if (html.classList.contains("dark")) {
                    circle.style.transform = "translateX(0)";
                    icon.textContent = "🌙";
                } else {
                    circle.style.transform = "translateX(24px)";
                    icon.textContent = "☀️";
                }
            });

            // MOBILE MENU
            const menuBtn = document.getElementById("menuBtn");
            const mobileMenu = document.getElementById("mobileMenu");
            const closeMenu = document.getElementById("closeMenu");
            const overlay = document.getElementById("overlay");

            menuBtn.addEventListener("click", () => {
                mobileMenu.style.right = "0";
                overlay.classList.remove("hidden");
            });

            closeMenu.addEventListener("click", () => {
                mobileMenu.style.right = "-100%";
                overlay.classList.add("hidden");
            });

            overlay.addEventListener("click", () => {
                mobileMenu.style.right = "-100%";
                overlay.classList.add("hidden");
            });

        });