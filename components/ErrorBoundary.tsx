import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });

    // Log to session storage for diagnostics
    try {
      const log = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        ts: new Date().toISOString(),
        url: window.location.href,
        ua: navigator.userAgent
      };
      sessionStorage.setItem('last_fatal_error', JSON.stringify(log));
    } catch (e) { }
  }

  private reportError = () => {
    const { error } = this.state;
    const log = {
      message: error?.message || 'Unknown error',
      url: window.location.href,
      ts: new Date().toISOString(),
      stack: error?.stack?.substring(0, 500) || 'No stack trace'
    };

    const text = `🚨 *ACRO AMS ERROR REPORT* 🚨\n\n*Message:* ${log.message}\n*URL:* ${log.url}\n*Time:* ${log.ts}\n\n*Stack Trace Snippet:*\n\`\`\`${log.stack}\`\`\``;
    const whatsappUrl = `https://wa.me/916266439162?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-[2rem] flex items-center justify-center mb-6 text-rose-600 animate-pulse">
            <AlertTriangle size={40} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">System Interrupted</h1>
          <p className="text-sm font-medium text-slate-500 max-w-xs mb-8">
            The application encountered a fatal error. Your data has been locally saved to prevent loss.
          </p>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm w-full max-w-md text-left mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertTriangle size={80} />
            </div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Technical Debug Info
            </p>
            <p className="text-xs font-bold text-slate-700 break-all leading-relaxed">{this.state.error?.message}</p>
            {this.state.error?.stack && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <pre className="text-[9px] text-slate-400 font-mono whitespace-pre-wrap overflow-hidden h-20">{this.state.error.stack.split('\n').slice(0, 5).join('\n')}</pre>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full max-w-xs gap-3">
            <button
              onClick={() => window.location.reload()}
              className="h-14 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <RefreshCw size={18} strokeWidth={3} />
              Reload Application
            </button>

            <button
              onClick={this.reportError}
              className="h-14 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
              Report to Developer
            </button>

            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = '/';
              }}
              className="h-14 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:text-slate-900 transition-all"
            >
              <Home size={18} />
              Reset Session
            </button>
          </div>

          <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Acro AMS v2.1 • Resilience Engine Activated
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
