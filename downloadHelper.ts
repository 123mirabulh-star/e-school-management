/**
 * Robust cross-browser and iframe-safe file downloader utilities for HTML documents, CSV, and JSON
 */

export function downloadFile(filename: string, content: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Keep object URL alive for 60 seconds so browser download stream never gets aborted
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    }, 60000);
  } catch (err) {
    console.warn('Blob URL download failed, trying data-uri fallback:', err);
    try {
      const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
      const a = document.createElement('a');
      a.href = dataUri;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (fallbackErr) {
      console.error('All download methods failed:', fallbackErr);
    }
  }
}

export function downloadHtmlDocument(filename: string, title: string, bodyContent: string): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #0F172A;
      background: #FFFFFF;
      font-size: 13px;
    }
    .sheet-card {
      max-width: 860px;
      margin: 0 auto;
      padding: 35px;
      border: 2px solid #CBD5E1;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
      background: #FFFFFF;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 20px;
      font-size: 12.5px;
    }
    th, td {
      border: 1px solid #CBD5E1;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background-color: #F8FAFC;
      font-weight: 700;
      color: #0F172A;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }
    .badge-pass { background-color: #DCFCE7; color: #166534; }
    .badge-fail { background-color: #FEE2E2; color: #991B1B; }
    @media print {
      body { padding: 0; background: white; }
      .sheet-card { border: none; box-shadow: none; width: 100%; max-width: 100%; padding: 15px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet-card">
    ${bodyContent}
  </div>
  <div class="no-print" style="text-align: center; margin-top: 25px; padding-bottom: 20px;">
    <button onclick="window.print()" style="padding: 10px 24px; font-weight: bold; background: #2563EB; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;

  const safeFilename = filename.endsWith('.html') ? filename : `${filename}.html`;
  downloadFile(safeFilename, fullHtml, 'text/html');
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvLines = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ];
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(safeFilename, csvLines.join('\n'), 'text/csv');
}

/**
 * Cross-browser & iframe-safe print function that works reliably even inside sandboxes
 */
export function printDocument(title: string, htmlContent: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '10px';
    iframe.style.height = '10px';
    iframe.style.opacity = '0.01';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 15px; font-size: 13px; color: #111; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
    th, td { border: 1px solid #CBD5E1; padding: 7px 10px; text-align: left; }
    th { background: #F1F5F9; font-weight: bold; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    @media print {
      body { margin: 0; padding: 0; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print failed, falling back to window.print():', e);
          window.print();
        }
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {
            // ignore
          }
        }, 4000);
      }, 350);
      return;
    }
  } catch (err) {
    console.warn('Iframe print initiation failed, calling window.print() fallback:', err);
  }
  window.print();
}
