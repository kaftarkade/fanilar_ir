
/* =================================
   Theme + Navigation
================================= */

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

/* تنظیم تم اولیه */

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    if (themeIcon) {
        themeIcon.textContent = isDark ? "☀️" : "🌙";
    }

    if (themeToggle) {
        const label = isDark
            ? "فعال کردن تم روشن"
            : "فعال کردن تم تاریک";

        themeToggle.setAttribute("aria-label", label);
        themeToggle.setAttribute("title", label);
    }
}

/* تم روشن پیش‌فرض است */

let savedTheme = "light";

try {
    const storedTheme = localStorage.getItem("site-theme");

    if (storedTheme === "light" || storedTheme === "dark") {
        savedTheme = storedTheme;
    }
} catch (error) {
    // در صورت محدودیت مرورگر، تم روشن استفاده می‌شود.
}

applyTheme(savedTheme);

/* تغییر تم با لمس دکمه */

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark-mode")
            ? "light"
            : "dark";
            themeToggle.classList.remove("theme-change");
void themeToggle.offsetWidth;
themeToggle.classList.add("theme-change");

        applyTheme(nextTheme);

        try {
            localStorage.setItem("site-theme", nextTheme);
        } catch (error) {
            // تغییر تم تا زمان باز بودن صفحه فعال می‌ماند.
        }
    });
}

/* منوی همبرگری */

if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "بستن منو" : "باز کردن منو"
        );
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            siteNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "باز کردن منو");
        });
    });
}