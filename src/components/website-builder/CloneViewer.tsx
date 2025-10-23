import { useEffect, useRef } from 'react';

interface CloneViewerProps {
  html: string;
  css: string;
  js: string;
}

/**
 * CloneViewer Component
 * Renders pixel-perfect cloned HTML/CSS/JS in an iframe
 */
export default function CloneViewer({ html, css, js }: CloneViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    // Build complete HTML document
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Injected CSS from cloned website */
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Injected JavaScript from cloned website
    ${js}
  </script>
</body>
</html>
    `;

    // Write to iframe
    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();

  }, [html, css, js]);

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Cloned Website Preview"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
