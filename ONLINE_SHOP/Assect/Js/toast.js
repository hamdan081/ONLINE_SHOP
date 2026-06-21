(function () {
    const titles = {
        success: "Berhasil",
        error: "Gagal",
        warning: "Perhatian",
        info: "Info"
    };

    function getToastContainer() {
        let container = document.getElementById("toast-container");

        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        return container;
    }

    function removeToast(toast) {
        toast.classList.remove("show");
        setTimeout(function () {
            toast.remove();
        }, 250);
    }

    window.showToast = function (message, type = "info") {
        const safeType = titles[type] ? type : "info";
        const container = getToastContainer();
        const toast = document.createElement("div");

        toast.className = `toast-notification toast-${safeType}`;
        toast.innerHTML = `
            <div class="toast-accent"></div>
            <div class="toast-content">
                <strong class="toast-title">${titles[safeType]}</strong>
                <span class="toast-message"></span>
            </div>
            <button type="button" class="toast-close" aria-label="Tutup toast">&times;</button>
        `;

        toast.querySelector(".toast-message").textContent = message;
        toast.querySelector(".toast-close").addEventListener("click", function () {
            removeToast(toast);
        });

        container.appendChild(toast);
        requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        setTimeout(function () {
            removeToast(toast);
        }, 3500);
    };

    window.AppToastShow = window.showToast;
})();
