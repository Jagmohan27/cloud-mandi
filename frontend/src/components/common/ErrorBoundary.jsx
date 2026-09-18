import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cloud Mandi caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white text-neutral-900">
          <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl border border-neutral-200 bg-[#F7F7F7]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              Something went wrong / कुछ समस्या आई
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We could not display this page properly. Please refresh to load fresh mandi rates.
            </p>
            <button
              onClick={this.handleReload}
              className="apple-btn-primary px-6 py-2.5 rounded-full text-xs font-semibold inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Page / पुनः प्रयास करें</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
