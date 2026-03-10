import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    
    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '[::1]' ||
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    return isLocalhost ? 'http://localhost:5000' : 'https://study-sync-u59i.onrender.com';
};

const rawBaseURL = getBaseURL();
const api = axios.create({
    baseURL: rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL.replace(/\/$/, '')}/api`,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const { token } = JSON.parse(savedUser);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
