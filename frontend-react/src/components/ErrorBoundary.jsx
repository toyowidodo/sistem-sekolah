import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        logger.error('ErrorBoundary caught an error', { error, errorInfo });
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">
                            Oops! Terjadi Kesalahan
                        </h1>
                        <p className="text-gray-700 mb-4">
                            Aplikasi mengalami masalah yang tidak terduga. Silakan refresh halaman atau hubungi administrator.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <details className="text-sm text-gray-600 bg-gray-100 p-3 rounded mb-4">
                                <summary className="cursor-pointer font-semibold">Detail Error</summary>
                                <pre className="mt-2 overflow-auto text-xs">
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
