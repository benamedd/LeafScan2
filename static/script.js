document.addEventListener("DOMContentLoaded", () => {
    // Fonction sécurisée pour récupérer les éléments
    const getElement = (id, required = true) => {
        const el = document.getElementById(id);
        if (!el && required) {
            console.error(`Element #${id} not found`);
            showError(`Critical element #${id} missing`);
        }
        return el;
    };

    // Fonction pour afficher les erreurs
    const showError = (message, technical = '') => {
        const errorHtml = `
            <div class="error-alert">
                <p>${message}</p>
                ${technical ? `<small>${technical}</small>` : ''}
            </div>
        `;
        elements.resultSection.innerHTML = errorHtml;
    };

    // Récupération des éléments
    const elements = {
        fileInput: getElement('file'),
        analyzeBtn: getElement('analyze-btn'),
        refreshBtn: getElement('refresh-btn'),
        resultSection: getElement('result')
    };

    // Vérification finale des éléments
    if (Object.values(elements).some(el => !el)) {
        showError("Application initialization failed", "Required elements missing");
        return;
    }

    // Création du bouton Export PDF
    const exportBtn = createExportButton();
    let selectedFile = null;

    // Gestion des événements
    setupEventListeners();

    function createExportButton() {
        const btn = document.createElement("button");
        btn.textContent = "Export PDF";
        btn.classList.add("primary-btn", "export-btn");
        btn.style.display = "none";
        document.body.appendChild(btn);
        return btn;
    }

    function setupEventListeners() {
        // Sélection de fichier avec prévisualisation
        elements.fileInput.addEventListener("change", handleFileSelect);

        // Bouton d'analyse
        elements.analyzeBtn.addEventListener("click", analyzeImage);

        // Bouton de rafraîchissement
        elements.refreshBtn.addEventListener("click", resetForm);

        // Bouton d'export PDF
        exportBtn.addEventListener("click", exportToPDF);
    }

    async function analyzeImage() {
        if (!selectedFile) return;

        // UI Loading state
        setLoadingState(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            console.error("Analysis failed:", error);
            showError(
                "Failed to analyze the image",
                error.message || "Please check your connection and try again"
            );
        } finally {
            setLoadingState(false);
        }
    }

    function handleFileSelect(event) {
        selectedFile = event.target.files[0];
        elements.analyzeBtn.disabled = !selectedFile;

        if (selectedFile) {
            showFilePreview(selectedFile);
        } else {
            elements.resultSection.innerHTML = "";
        }
    }

    function showFilePreview(file) {
        const previewUrl = URL.createObjectURL(file);
        elements.resultSection.innerHTML = `
            <div class="file-preview">
                <p><strong>Selected File:</strong> ${file.name}</p>
                <img src="${previewUrl}" alt="Preview">
            </div>
        `;
        
        // Clean up object URL when done
        setTimeout(() => URL.revokeObjectURL(previewUrl), 1000);
    }

    function displayResults(data) {
        if (data.error) {
            showError(data.error);
            return;
        }

        // Formatage des résultats
        const formattedResult = formatResultText(data.result);
        
        elements.resultSection.innerHTML = `
            <div class="analysis-results">
                <h2>Analysis Result</h2>
                <div class="result-content">${formattedResult}</div>
                ${data.image ? `<img src="${data.image}" alt="Processed result" class="result-image">` : ''}
            </div>
        `;
        
        exportBtn.style.display = "block";
    }

    function formatResultText(resultText) {
        return resultText
            .replace(/\n/g, '<br>')
            .replace("Total Leaf Area:", "<span class='bold-text'>Total Leaf Area:</span>")
            .replace("Lesion Area:", "<span class='bold-text'>Lesion Area:</span>")
            .replace("Disease Severity:", "<span class='bold-text'>Disease Severity:</span>")
            .replace(/(\d+) pixels²/g, "<span class='green-value'>$1<span class='unit'> pixels²</span></span>")
            .replace(/(\d+\.\d+)%/g, "<span class='red-value'>$1<span class='unit'>%</span></span>");
    }

    function resetForm() {
        elements.fileInput.value = "";
        selectedFile = null;
        elements.analyzeBtn.disabled = true;
        elements.resultSection.innerHTML = "";
        exportBtn.style.display = "none";
    }

    function exportToPDF() {
        if (!window.jspdf) {
            showError("PDF export unavailable", "Required library not loaded");
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.text("LeafScan Analysis Report", 10, 10);
            
            doc.setFontSize(12);
            const lines = elements.resultSection.innerText.split('\n');
            
            lines.forEach((line, index) => {
                if (index < 20) { // Prevent overflow
                    doc.text(line, 10, 20 + (index * 7));
                }
            });
            
            doc.save("LeafScan_Report.pdf");
        } catch (error) {
            console.error("PDF export failed:", error);
            showError("Failed to generate PDF", error.message);
        }
    }

    function setLoadingState(isLoading) {
        elements.analyzeBtn.disabled = isLoading;
        elements.analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze";
        elements.fileInput.disabled = isLoading;
    }

    // Enregistrement du Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
            .then(registration => {
                console.log("ServiceWorker registered:", registration.scope);
            })
            .catch(error => {
                console.error("ServiceWorker registration failed:", error);
            });
    }
});
