interface CloneViewerProps {
  html: string;
  css: string;
  js?: string;
}

export default function CloneViewer({ html, css, js }: CloneViewerProps) {
  return (
    <div className="w-full h-full">
      <iframe
        srcDoc={`
<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ''}
</body>
</html>
        `}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Clone preview"
      />
    </div>
  );
}
