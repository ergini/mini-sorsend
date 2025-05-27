import { NextResponse } from "next/server";
import { Server as ServerIO } from "socket.io";

declare global {
  var io: ServerIO | undefined;
}

export async function GET() {
  if (global.io) {
    console.log("Test: Emitting test-event");
    global.io.emit("test-event", { message: "Socket.IO is working!", timestamp: new Date().toISOString() });
    return NextResponse.json({ 
      success: true, 
      message: "Test event emitted",
      connectedClients: global.io.engine.clientsCount 
    });
  } else {
    console.log("Test: Socket.IO not available");
    return NextResponse.json({ 
      success: false, 
      message: "Socket.IO not available" 
    }, { status: 500 });
  }
} 