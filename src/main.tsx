import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white" dir="rtl">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto p-2 flex items-center justify-center">
              <img src="./logo.png" alt="الخطة" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-base font-bold text-white">منصة الخطة - داشبورد الكواليتي</h1>
            <p className="text-xs text-slate-300">
              تم اكتشاف نسخة ذاكرة مؤقتة قديمة في متصفحك. اضغط على الزر بالأسفل لتحديث البيانات وفتح الداشبورد فوراً.
            </p>
            {this.state.error && (
              <div className="p-2 bg-slate-900/60 rounded text-[10px] text-rose-300 font-mono text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-lg cursor-pointer"
            >
              تحديث وفتح الداشبورد الآن
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
