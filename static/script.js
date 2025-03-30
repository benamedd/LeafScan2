document.addEventListener("DOMContentLoaded", () => {
    // Récupération des éléments avec vérification
    const getElement = (id) => {
        const el = document.getElementById(id);
        if (!el) console.error(`Élément #${id} introuvable`);
        return el;
    };

    const elements = {
        fileInput: getElement('file'),
        analyzeBtn: getElement('analyze-btn'),
        refreshBtn: getElement('refresh-btn'),
        resultSection: getElement('result')
    };

    // Vérification des éléments critiques
    if (Object.values(elements).some(el => !el)) {
        console.error("Éléments manquants - arrêt de l'initialisation");
        return;
    }

    // Création du bouton Export PDF
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export PDF";
    exportBtn.classList.add("primary-btn");
    exportBtn.style.display = "none";
    document.body.appendChild(exportBtn);

    let selectedFile = null;

    // Gestion de la sélection de fichier avec prévisualisation
    elements.fileInput.addEventListener("change", (e) => {
        selectedFile = e.target.files[0];
        elements.analyzeBtn.disabled = !selectedFile;

        if (selectedFile) {
            const previewUrl = URL.createObjectURL(selectedFile);
            elements.resultSection.innerHTML = `
                <p><strong>Selected File:</strong> ${selectedFile.name}</p>
                <img src="${previewUrl}" alt="Preview" style="max-width: 200px;">
            `;
        } else {
            elements.resultSection.innerHTML = "";
        }
    });

    // Gestion de l'analyse
    elements.analyzeBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);
        elements.resultSection.innerHTML = "<p>Processing...</p>";
        exportBtn.style.display = "none";

        try {
            // Utilisation d'un chemin relatif pour la production
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                elements.resultSection.innerHTML = `<p class='error'>${data.error}</p>`;
            } else {
                const resultText = data.result.replace(/\n/g, '<br>');
                const highlightedText = resultText
                    .replace("Total Leaf Area:", "<span class='bold-text'>Total Leaf Area:</span>")
                    .replace("Lesion Area:", "<span class='bold-text'>Lesion Area:</span>")
                    .replace("Disease Severity:", "<span class='bold-text'>Disease Severity:</span>")
                    .replace(/(\d+) pixels²/g, "<span class='green-value'>$1<span class='red-separator'> pixels²</span></span>")
                    .replace(/(\d+\.\d+)%/g, "<span class='red-value'>$1<span class='red-separator'>%</span></span>");

                elements.resultSection.innerHTML = `
                    <h2>Analysis Result</h2>
                    <div class="result-content">${highlightedText}</div>
                    ${data.image ? `<img src="${data.image}" alt="Processed Leaf Image" class="result-image">` : ''}
                `;
                exportBtn.style.display = "block";
            }
        } catch (error) {
            console.error("Error:", error);
            elements.resultSection.innerHTML = `
                <p class='error'>Failed to analyze the image. ${error.message}</p>
                <p>Please ensure the server is running and try again.</p>
            `;
        }
    });

    // Gestion du rafraîchissement
    elements.refreshBtn.addEventListener("click", () => {
        elements.fileInput.value = "";
        selectedFile = null;
        elements.analyzeBtn.disabled = true;
        elements.resultSection.innerHTML = "";
        exportBtn.style.display = "none";
    });

    // Gestion de l'export PDF
    exportBtn.addEventListener("click", () => {
        if (window.jspdf) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Titre
            doc.setFontSize(16);
            doc.text("LeafScan Analysis Report", 10, 10);
            
            // Contenu avec formatage basique
            doc.setFontSize(12);
            const lines = elements.resultSection.innerText.split('\n');
            lines.forEach((line, index) => {
                doc.text(line, 10, 20 + (index * 7));
            });
            
            doc.save("LeafScan_Report.pdf");
        } else {
            alert("PDF export feature is not available");
            console.error("jsPDF library not loaded");
        }
    });

    // Enregistrement du Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
            .then(registration => console.log("SW registered:", registration.scope))
            .catch(error => console.log("SW registration failed:", error));
    }
});
