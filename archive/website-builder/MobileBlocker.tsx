import { Monitor, Smartphone } from 'lucide-react';

export default function MobileBlocker() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <div className="relative bg-slate-900 p-4 rounded-full border border-slate-700">
              <Monitor className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-500 p-2 rounded-full border-2 border-slate-800">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Desktop Required
          </h1>

          {/* Description */}
          <p className="text-slate-300 mb-6 leading-relaxed">
            The website builder is optimized for desktop and tablet devices.
            Please switch to a larger screen to create and edit your website.
          </p>

          {/* Features List */}
          <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400 mb-3">
              What you can do on desktop:
            </p>
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Drag and drop elements with precision</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Use keyboard shortcuts for faster editing</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Access advanced design tools and settings</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Preview in desktop, tablet, and mobile views</span>
              </li>
            </ul>
          </div>

          {/* Minimum Requirements */}
          <div className="text-sm text-slate-500 pt-4 border-t border-slate-700">
            <p className="font-medium mb-1">Minimum screen width:</p>
            <p>768px (tablet) or larger</p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="mt-6 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't worry - your published website will look great on all devices!
        </p>
      </div>
    </div>
  );
}
