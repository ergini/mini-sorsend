"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketInstance = io("http://192.168.1.2:3000", {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket.IO connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket.IO disconnected");
    });

    socketInstance.on("project-updated", (data) => {
      console.log("Received project-updated event:", data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });

    socketInstance.on("project-deleted", (data) => {
      console.log("Received project-deleted event:", data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });

    socketInstance.on("task-updated", (data) => {
      console.log("Received task-updated event:", data);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
