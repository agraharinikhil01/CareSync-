import React from 'react';
import { RefreshCw, Home, ShieldAlert, ChevronDown } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareSync Global Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || 'Unknown error';
      const errStack = this.state.error?.stack || '';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center mx-auto mb-5 text-rose-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              CareSync encountered a temporary display issue. Don't worry, your data and records are completely safe.
            </p>

            {/* Error Details Box */}
            <div className="mb-5 text-left rounded-xl bg-rose-50 border border-rose-200 p-3">
              <p className="text-xs font-bold text-rose-700 mb-1">Error:</p>
              <p className="text-xs text-rose-800 font-mono break-all">{errMsg}</p>
              <button
                onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                className="mt-2 text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                {this.state.showDetails ? 'Hide' : 'Show'} Stack Trace
              </button>
              {this.state.showDetails && (
                <pre className="mt-2 text-[9px] text-rose-700 overflow-auto max-h-40 whitespace-pre-wrap font-mono leading-relaxed">
                  {errStack}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition-all shadow-sm shadow-sky-600/20 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

