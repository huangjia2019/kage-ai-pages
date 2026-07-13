/* ========================================
   KAGE-AI Site - main.js
   Minimal interactions
   ======================================== */

(function () {
    "use strict";

    // --- Mobile Menu Toggle ---
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            navToggle.classList.toggle("active");
            navMenu.classList.toggle("open");
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", function () {
                navToggle.classList.remove("active");
                navMenu.classList.remove("open");
            });
        });
    }

    // --- Navbar scroll shadow ---
    const navbar = document.getElementById("navbar");

    function updateNavbar() {
        if (window.scrollY > 10) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", updateNavbar, { passive: true });
    updateNavbar();

    // --- Active section highlighting ---
    const sections = document.querySelectorAll(".section, .hero");
    const navLinks = document.querySelectorAll(".nav-menu .nav-link[href^='#']");

    function updateActiveLink() {
        var scrollPos = window.scrollY + 100;

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute("id");

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(function (link) {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === "#" + id) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }

    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
})();
