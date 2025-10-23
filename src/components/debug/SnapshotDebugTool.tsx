/**
 * Snapshot Debug Tool
 * Capture and restore full editor state for bug reproduction
 * Triggered with Cmd+Shift+D
 */

import React, { useState, useEffect } from 'react';
import { useCommandBus } from '@/stores/commandBus';
import { selectorRegistry } from '@/lib/selectorRegistry';
import type { Snapshot } from '@/lib/types';

export function SnapshotDebugTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<string>('');
  const commandBus = useCommandBus();

  /**
   * Keyboard shortcut: Cmd+Shift+D
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle both 'D' and 'd' for cross-browser compatibility
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📸 Opening Snapshot Debug Tool...');
        captureSnapshot();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  /**
   * Capture current editor state
   */
  const captureSnapshot = () => {
    const iframe = document.querySelector('iframe');
    const iframeDoc = iframe?.contentDocument;

    const snap: Snapshot = {
      version: '1.0',
      timestamp: Date.now(),
      commandBus: {
        history: commandBus.history,
        currentIndex: commandBus.currentIndex,
        elements: Object.fromEntries(commandBus.elements),
      },
      selectorRegistry: {
        idToSelector: Object.fromEntries(selectorRegistry['idToSelector']),
        selectorToId: Object.fromEntries(selectorRegistry['selectorToId']),
      },
      iframe: {
        html: iframeDoc?.documentElement.outerHTML || '',
        url: window.location.href,
      },
      userAgent: navigator.userAgent,
    };

    setSnapshot(JSON.stringify(snap, null, 2));
    console.log('📸 Snapshot captured:', snap);
  };

  /**
   * Copy snapshot to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snapshot);
      alert('✅ Snapshot copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('❌ Failed to copy to clipboard');
    }
  };

  /**
   * Apply snapshot (restore state)
   */
  const applySnapshot = () => {
    try {
      const snap: Snapshot = JSON.parse(snapshot);

      // Restore command bus state
      commandBus.history = snap.commandBus.history;
      commandBus.currentIndex = snap.commandBus.currentIndex;
      commandBus.elements = new Map(Object.entries(snap.commandBus.elements));

      // Restore selector registry
      selectorRegistry.clear();
      Object.entries(snap.selectorRegistry.idToSelector).forEach(([id, selector]) => {
        selectorRegistry['idToSelector'].set(id, selector);
      });
      Object.entries(snap.selectorRegistry.selectorToId).forEach(([selector, id]) => {
        selectorRegistry['selectorToId'].set(selector, id);
      });

      // Restore iframe HTML
      const iframe = document.querySelector('iframe');
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(snap.iframe.html);
        iframe.contentDocument.close();
      }

      alert('✅ Snapshot restored successfully!');
      setIsOpen(false);
      console.log('🔄 Snapshot restored:', snap);
    } catch (error: any) {
      console.error('Failed to apply snapshot:', error);
      alert(`❌ Failed to apply snapshot: ${error.message}`);
    }
  };

  /**
   * Download snapshot as JSON file
   */
  const downloadSnapshot = () => {
    const blob = new Blob([snapshot], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas-snapshot-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Upload snapshot from file
   */
  const uploadSnapshot = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setSnapshot(e.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="snapshot-debug-tool"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="snapshot-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          padding: 24,
          maxWidth: '80vw',
          maxHeight: '80vh',
          width: 800,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            📸 Snapshot Debug Tool
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        {/* Info */}
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#666' }}>
          Capture and restore full editor state for bug reproduction.
          Share snapshots with the team for instant debugging.
        </p>

        {/* Textarea */}
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          <textarea
            value={snapshot}
            onChange={(e) => setSnapshot(e.target.value)}
            placeholder="Snapshot JSON will appear here..."
            style={{
              width: '100%',
              height: '100%',
              minHeight: 300,
              fontFamily: 'monospace',
              fontSize: 11,
              border: '1px solid #ddd',
              borderRadius: 4,
              padding: 12,
              resize: 'none',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={captureSnapshot}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            📸 Capture Snapshot
          </button>

          <button
            onClick={copyToClipboard}
            disabled={!snapshot}
            style={{
              padding: '8px 16px',
              backgroundColor: snapshot ? '#6b7280' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: snapshot ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            📋 Copy to Clipboard
          </button>

          <button
            onClick={applySnapshot}
            disabled={!snapshot}
            style={{
              padding: '8px 16px',
              backgroundColor: snapshot ? '#10b981' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: snapshot ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            🔄 Apply Snapshot
          </button>

          <button
            onClick={downloadSnapshot}
            disabled={!snapshot}
            style={{
              padding: '8px 16px',
              backgroundColor: snapshot ? '#8b5cf6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: snapshot ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            💾 Download
          </button>

          <button
            onClick={uploadSnapshot}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            📁 Upload
          </button>
        </div>

        {/* Help text */}
        <p style={{ margin: '16px 0 0', fontSize: 11, color: '#999' }}>
          💡 Press <kbd style={{ padding: '2px 6px', background: '#f3f4f6', borderRadius: 3, fontFamily: 'monospace' }}>Cmd+Shift+D</kbd> to open this tool
        </p>
      </div>
    </div>
  );
}
