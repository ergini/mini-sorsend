export const emitSocketEvent = (res: any, event: string, data?: any) => {
  if (res?.socket?.server?.io) {
    res.socket.server.io.emit(event, data);
  }
};
