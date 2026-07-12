import { useChat } from '../context/ChatContext';

export const useToast = () => {
  const { notification, setNotification } = useChat();
  
  return {
    toast: notification,
    showToast: setNotification,
    clearToast: () => setNotification(null),
  };
};

export default useToast;
