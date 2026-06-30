const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLogLevel = LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL || 'info'];

const logger = {
    debug: (message, data) => {
        if (LOG_LEVELS.debug >= currentLogLevel) {
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    },
    info: (message, data) => {
        if (LOG_LEVELS.info >= currentLogLevel) {
            console.info(`[INFO] ${message}`, data || '');
        }
    },
    warn: (message, data) => {
        if (LOG_LEVELS.warn >= currentLogLevel) {
            console.warn(`[WARN] ${message}`, data || '');
        }
    },
    error: (message, error) => {
        if (LOG_LEVELS.error >= currentLogLevel) {
            console.error(`[ERROR] ${message}`, error || '');
        }
        // Send error to monitoring service in production
        if (import.meta.env.PROD) {
            sendErrorToMonitoring(message, error);
        }
    },
};

// Function to send errors to monitoring service (optional)
const sendErrorToMonitoring = (message, error) => {
    // This can be integrated with services like Sentry, LogRocket, etc.
    // For now, it's a placeholder
};

export default logger;
