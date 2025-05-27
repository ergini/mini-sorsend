"use client";
import { useSocket } from "@/providers/socket-provider";

export const SocketStatus = () => {
  const { isConnected } = useSocket();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          isConnected
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isConnected ? "Socket Connected" : "Socket Disconnected"}
        </div>
      </div>
    </div>
  );
};
