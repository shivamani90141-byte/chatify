import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  isSoundEnabled:
    JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    const newValue = !get().isSoundEnabled;

    localStorage.setItem("isSoundEnabled", newValue);

    set({
      isSoundEnabled: newValue,
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/contacts");

      set({
        allContacts: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/chats");

      set({
        chats: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);

      set({
        messages: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Immediately show message in UI
    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Replace temporary message with real MongoDB message
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === tempId ? res.data : message
        ),
      }));
    } catch (error) {
      // Remove optimistic message if request fails
      set((state) => ({
        messages: state.messages.filter(
          (message) => message._id !== tempId
        ),
      }));

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) {
      console.log("Socket not available");
      return;
    }

    // Prevent duplicate listeners
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) {
        return;
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      // Optional notification sound
      if (get().isSoundEnabled) {
        const notificationSound = new Audio(
          "/sounds/notification.mp3"
        );

        notificationSound.currentTime = 0;

        notificationSound
          .play()
          .catch((error) =>
            console.log("Audio play failed:", error)
          );
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newMessage");
  },
}));