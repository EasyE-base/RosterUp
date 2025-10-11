import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';

interface ConfigErrorProps {
  message?: string;
}

export default function ConfigError({ message }: ConfigErrorProps) {
  const isVercel = window.location.hostname.includes('vercel.app');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 rounded-lg border border-slate-700 p-8">
        <div className="flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Configuration Required
        </h1>

        <p className="text-slate-400 text-center mb-6">
          {message || 'Environment variables are not configured for this deployment.'}
        </p>

        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Missing Configuration
          </h2>

          <div className="space-y-2 text-sm">
            <p className="text-slate-300">The following environment variables need to be set:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-1 ml-4">
              <li><code className="text-blue-400">VITE_SUPABASE_URL</code></li>
              <li><code className="text-blue-400">VITE_SUPABASE_ANON_KEY</code></li>
            </ul>
          </div>
        </div>

        {isVercel && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3">Steps to Configure on Vercel:</h3>
            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
              <li>Go to your Vercel project dashboard</li>
              <li>Navigate to <strong>Settings → Environment Variables</strong></li>
              <li>Add the required variables from your Supabase project</li>
              <li>Redeploy your application</li>
            </ol>

            <a
              href="https://vercel.com/docs/concepts/projects/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              View Vercel Documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {!isVercel && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3">Steps to Configure Locally:</h3>
            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
              <li>Copy <code className="text-blue-400">.env.example</code> to <code className="text-blue-400">.env</code></li>
              <li>Add your Supabase credentials to the <code className="text-blue-400">.env</code> file</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            For more help, check the README.md in the project repository
          </p>
        </div>
      </div>
    </div>
  );
}