import { createContext, useContext } from 'react';

// Provided by App; pages/components call pushToast(title, body, {link, linkLabel})
export const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);
