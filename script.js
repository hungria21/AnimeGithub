document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const bookContent = document.getElementById('book-content');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageNum = document.getElementById('page-num');
    
    let currentPage = 1;
    let pdfDoc = null;

    // Inicializa o PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type === 'application/pdf') {
            // Manipula arquivo PDF
            const reader = new FileReader();
            reader.onload = async function(e) {
                const typedarray = new Uint8Array(e.target.result);
                loadPDF(typedarray);
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'text/plain') {
            // Manipula arquivo TXT
            const reader = new FileReader();
            reader.onload = function(e) {
                bookContent.innerHTML = `<pre>${e.target.result}</pre>`;
            };
            reader.readAsText(file);
        }
    });

    async function loadPDF(data) {
        try {
            pdfDoc = await pdfjsLib.getDocument({data: data}).promise;
            currentPage = 1;
            renderPage(currentPage);
            updatePageNum();
        } catch (error) {
            console.error('Erro ao carregar PDF:', error);
            bookContent.innerHTML = 'Erro ao carregar o PDF';
        }
    }

    async function renderPage(num) {
        try {
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({scale: 1.5});
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            bookContent.innerHTML = '';
            bookContent.appendChild(canvas);

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
        } catch (error) {
            console.error('Erro ao renderizar página:', error);
        }
    }

    function updatePageNum() {
        if (pdfDoc) {
            pageNum.textContent = `Página ${currentPage} de ${pdfDoc.numPages}`;
        }
    }

    prevButton.addEventListener('click', () => {
        if (pdfDoc && currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
            updatePageNum();
        }
    });

    nextButton.addEventListener('click', () => {
        if (pdfDoc && currentPage < pdfDoc.numPages) {
            currentPage++;
            renderPage(currentPage);
            updatePageNum();
        }
    });
});