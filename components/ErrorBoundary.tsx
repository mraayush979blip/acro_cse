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
    } catch (e) {}
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-[2rem] flex items-center justify-center mb-6 text-rose-600 animate-bounce">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Something went wrong</h1>
          <p className="text-sm font-medium text-slate-500 max-w-xs mb-8">
            The application encountered an unexpected error. We've logged the details for our developers.
          </p>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md text-left mb-8 overflow-auto max-h-40">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Error Details</p>
            <p className="text-xs font-mono text-slate-700 break-all">{this.state.error?.message}</p>
            {this.state.error?.stack && (
                <pre className="text-[8px] text-slate-400 mt-2 font-mono whitespace-pre-wrap">{this.state.error.stack.split('\n').slice(0, 3).join('\n')}</pre>
            )}
          </div>

          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="h-14 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
              <RefreshCw size={18} />
              Reload App
            </button>
            <button 
              onClick={() => {
                sessionStorage.clear();
                window.location.href = '/';
              }}
              className="h-14 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Reset & Go Home
            </button>
          </div>
          
          <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            Acro CSE v2.0 • Build Stability Engine
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
