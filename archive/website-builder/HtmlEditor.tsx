import { useState } from 'react';
import { Code, Eye, Save } from 'lucide-react';

interface HtmlEditorProps {
  html: string;
  css: string;
  onSave: (html: string, css: string) => void;
}

export default function HtmlEditor({ html, css, onSave }: HtmlEditorProps) {
  const [editedHtml, setEditedHtml] = useState(html);
  const [editedCss, setEditedCss] = useState(css);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');

  const handleSave = () => {
    onSave(editedHtml, editedCss);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Editor Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-500" />
            <span className="text-white font-medium">HTML Editor - Direct Code Editing</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded p-1">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'html'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'css'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              CSS
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center space-x-2 ${
              showPreview
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className={showPreview ? 'w-1/2' : 'w-full'}>
          <div className="h-full flex flex-col">
            <textarea
              value={activeTab === 'html' ? editedHtml : editedCss}
              onChange={(e) =>
                activeTab === 'html'
                  ? setEditedHtml(e.target.value)
                  : setEditedCss(e.target.value)
              }
              className="flex-1 w-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none"
              style={{ tabSize: 2 }}
              spellCheck={false}
            />

            {/* Editor Footer */}
            <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
              <span>
                {activeTab === 'html' ? 'HTML' : 'CSS'} •{' '}
                {activeTab === 'html' ? editedHtml.length : editedCss.length} characters
              </span>
              <span className="text-slate-500">
                Use Ctrl+S to save (or click Save button)
              </span>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="w-1/2 border-l border-slate-800">
            <div className="h-full flex flex-col bg-white">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 border-b border-slate-700">
                Live Preview
              </div>
              <div className="flex-1 overflow-auto">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <style>${editedCss}</style>
                      </head>
                      <body>
                        ${editedHtml}
                      </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts"
                  title="Live Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
