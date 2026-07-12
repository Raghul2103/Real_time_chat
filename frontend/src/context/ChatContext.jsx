import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socket';
import customFetch from '../services/customFetch';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState({ type: 'global' });
  const [typingStatus, setTypingStatus] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [notification, setNotification] = useState(null);

  // Use ref to keep track of activeChat and user in socket event listeners without re-binding
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Dismiss notification toast after delay
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch initial user list
  const fetchUsers = async () => {
    if (!user) return;
    setLoadingUsers(true);
    try {
      const response = await customFetch.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch message history for the active chat
  const fetchMessages = async () => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const currentChat = activeChat;
      if (currentChat.type === 'global') {
        const response = await customFetch.get('/messages/global');
        setMessages(response.data.messages || []);
      } else if (currentChat.type === 'private' && currentChat.user) {
        const response = await customFetch.get(`/messages/private/${currentChat.user._id}`);
        setMessages(response.data.messages || []);
        
        // Notify server that messages are read
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('mark-as-read', { senderId: currentChat.user._id });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load contacts and messages when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [activeChat, user]);

  // Configure socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    // Handle when socket connection opens/refreshes
    const handleConnect = () => {
      console.log('Socket client connected in ChatContext');
      if (activeChatRef.current.type === 'global') {
        socket.emit('join-global');
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);

    // 1. Online list syncing
    socket.on('online-users', (usersList) => {
      setOnlineUsers(usersList);
      // Synchronize state in users list
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          const isOnlineNow = usersList.some((ou) => ou._id === u._id);
          return { ...u, isOnline: isOnlineNow };
        })
      );
    });

    socket.on('user-online', (onlineUser) => {
      setOnlineUsers((prev) => {
        if (prev.some((u) => u._id === onlineUser._id)) return prev;
        return [...prev, onlineUser];
      });
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === onlineUser._id ? { ...u, isOnline: true } : u))
      );
    });

    socket.on('user-offline', (offlineUserId) => {
      setOnlineUsers((prev) => prev.filter((u) => u._id !== offlineUserId));
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === offlineUserId ? { ...u, isOnline: false } : u))
      );
    });

    // 2. Message streams
    socket.on('global-message', (msg) => {
      if (activeChatRef.current.type === 'global') {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('private-message', (msg) => {
      const active = activeChatRef.current;
      const currentUser = userRef.current;

      if (!currentUser) return;

      // Message is relevant to active private conversation
      const isFromActiveUser = active.type === 'private' && active.user && msg.sender._id === active.user._id;
      const isSentByMeToActiveUser = active.type === 'private' && active.user && msg.sender._id === currentUser._id && msg.receiver._id === active.user._id;

      if (isFromActiveUser || isSentByMeToActiveUser) {
        setMessages((prev) => [...prev, msg]);
        
        // If received from active user, emit mark-as-read immediately
        if (isFromActiveUser) {
          socket.emit('mark-as-read', { senderId: active.user._id });
        }
      } else {
        // Increment unread count or notify user
        if (msg.sender._id !== currentUser._id) {
          setUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u._id === msg.sender._id) {
                return { ...u, unreadCount: (u.unreadCount || 0) + 1 };
              }
              return u;
            })
          );
          setNotification({
            senderName: msg.sender.name,
            messageText: msg.message,
            avatar: msg.sender.avatar,
          });
        }
      }
    });

    // 3. Typing indicator
    socket.on('typing', (data) => {
      const { senderId, isTyping, isGlobal } = data;
      setTypingStatus((prev) => ({
        ...prev,
        [senderId]: { isTyping, isGlobal },
      }));
    });

    // 4. Message status
    socket.on('delivered', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, delivered: true } : msg))
      );
    });

    socket.on('read', ({ readerId }) => {
      const active = activeChatRef.current;
      if (active.type === 'private' && active.user && active.user._id === readerId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.receiver && msg.receiver._id === readerId ? { ...msg, read: true, delivered: true } : msg))
        );
      }
    });

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off('connect', handleConnect);
      socket.off('online-users');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('global-message');
      socket.off('private-message');
      socket.off('typing');
      socket.off('delivered');
      socket.off('read');
    };
  }, [user]);

  // Switch chat channel
  const selectChat = (chatTarget) => {
    // Clear unread counts for target user
    if (chatTarget.type === 'private' && chatTarget.user) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === chatTarget.user._id ? { ...u, unreadCount: 0 } : u))
      );
    }
    
    // Clear typing status from previous active chat
    setTypingStatus({});
    
    setActiveChat(chatTarget);

    // Join room if global or private
    const socket = getSocket();
    if (socket && socket.connected) {
      if (chatTarget.type === 'global') {
        socket.emit('join-global');
      } else if (chatTarget.type === 'private' && chatTarget.user) {
        socket.emit('join-private', { receiverId: chatTarget.user._id });
      }
    }
  };

  // Send message function (socket-driven)
  const sendMessage = (text) => {
    const socket = getSocket();
    if (!socket || !socket.connected) return;

    if (activeChat.type === 'global') {
      socket.emit('send-global-message', { message: text });
    } else if (activeChat.type === 'private' && activeChat.user) {
      socket.emit('send-private-message', {
        receiverId: activeChat.user._id,
        message: text,
      });
    }
  };

  // Start typing notify
  const sendTypingStart = () => {
    const socket = getSocket();
    if (!socket || !socket.connected) return;

    socket.emit('typing-start', {
      isGlobal: activeChat.type === 'global',
      receiverId: activeChat.type === 'private' ? activeChat.user._id : null,
    });
  };

  // Stop typing notify
  const sendTypingStop = () => {
    const socket = getSocket();
    if (!socket || !socket.connected) return;

    socket.emit('typing-stop', {
      isGlobal: activeChat.type === 'global',
      receiverId: activeChat.type === 'private' ? activeChat.user._id : null,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        onlineUsers,
        messages,
        activeChat,
        typingStatus,
        loadingMessages,
        loadingUsers,
        notification,
        setNotification,
        selectChat,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
        refreshContacts: fetchUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
export default ChatContext;
