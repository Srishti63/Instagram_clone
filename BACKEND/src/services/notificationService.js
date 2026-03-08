import { io } from "../index.js";
import { getReceiverSocketId } from "../sockets/chatSocket.js";

class NotificationService {
    constructor() {
        this.observers = [];
    }

    subscribe(observer){
        this.observers.push(observer);
    }

    async notify(data){
        // 1. Notify standard Observers (e.g., InAppNotificationObserver)
        for(const observer of this.observers){
            await observer.update(data);
        }

        // 2. Emit real-time WebSocket event
        if (data.recipientId) {
            const receiverSocketId = getReceiverSocketId(data.recipientId.toString());
            if (receiverSocketId) {
                // io.to() sends only to that specific user's socket
                io.to(receiverSocketId).emit("new_notification", data);
            }
        }
    }
}

const notificationService = new NotificationService();

export default notificationService;