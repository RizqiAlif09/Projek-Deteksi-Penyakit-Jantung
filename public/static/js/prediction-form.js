(() => {
    const form = document.getElementById("predictionForm");
    const submitButton = document.getElementById("submitButton");
    const formStatus = document.getElementById("formStatus");

    if (!form || !submitButton || !formStatus) {
        return;
    }

    form.addEventListener("submit", () => {
        if (!form.reportValidity()) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sedang memproses...";
        formStatus.hidden = false;
        form.setAttribute("aria-busy", "true");
    });
})();
