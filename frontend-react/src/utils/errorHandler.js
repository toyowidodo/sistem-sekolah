/**
 * Standardized error handler for all API errors
 */
export const getErrorMessage = (error) => {
    // Server validation errors
    if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && typeof errors === 'object') {
            return Object.values(errors)
                .flat()
                .join(', ');
        }
        return error.response?.data?.message || 'Data tidak valid';
    }

    // Server-provided message
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // HTTP status messages
    switch (error.response?.status) {
        case 400:
            return 'Permintaan tidak valid';
        case 401:
            return 'Sesi telah berakhir, silakan login kembali';
        case 403:
            return 'Anda tidak memiliki izin untuk mengakses halaman ini';
        case 404:
            return 'Data tidak ditemukan';
        case 429:
            return 'Terlalu banyak permintaan, silakan coba lagi nanti';
        case 500:
        case 502:
        case 503:
        case 504:
            return 'Server sedang mengalami gangguan, silakan coba lagi nanti';
        default:
            break;
    }

    // Network errors
    if (!error.response) {
        return 'Gagal terhubung ke server';
    }

    return error.message || 'Terjadi kesalahan yang tidak diketahui';
};

/**
 * Log error dengan detail lengkap
 */
export const logError = (component, error, context = {}) => {
    const errorData = {
        component,
        timestamp: new Date().toISOString(),
        status: error.response?.status,
        message: error.message,
        context,
        stack: error.stack,
    };

    console.error('[ERROR]', errorData);

    // Bisa dikirim ke error tracking service (Sentry, etc)
    // if (import.meta.env.PROD) {
    //     sendToErrorTracker(errorData);
    // }
};
