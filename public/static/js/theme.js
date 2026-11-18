(() => {
    const root = document.documentElement;
    const toggles = document.querySelectorAll("[data-theme-toggle]");
    const navigation = document.getElementById("mainNavigation");
    const navigationToggle = document.querySelector(".navbar-toggler");

    function updateToggle(theme) {
        toggles.forEach((toggle) => {
            const isDark = theme === "dark";
            const label = toggle.querySelector("[data-theme-label]");

            toggle.setAttribute("aria-pressed", String(isDark));
            toggle.setAttribute("aria-label", isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
            label.textContent = isDark ? "Tema terang" : "Tema gelap";
        });
    }

    function setTheme(theme) {
        root.dataset.theme = theme;
        root.dataset.bsTheme = theme;
        updateToggle(theme);

        try {
            localStorage.setItem("heal-m-theme", theme);
        } catch (error) {
            console.warn("Preferensi tema tidak dapat disimpan.", error);
        }
    }

    updateToggle(root.dataset.theme || "light");
    toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            setTheme(root.dataset.theme === "dark" ? "light" : "dark");
        });
    });

    if (navigation && navigationToggle) {
        navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", () => {
                if (navigationToggle.getAttribute("aria-expanded") === "true") {
                    navigationToggle.click();
                }
            });
        });

        navigation.addEventListener("shown.bs.collapse", () => {
            navigationToggle.setAttribute("aria-label", "Tutup navigasi");
        });
        navigation.addEventListener("hidden.bs.collapse", () => {
            navigationToggle.setAttribute("aria-label", "Buka navigasi");
        });
    }
})();
