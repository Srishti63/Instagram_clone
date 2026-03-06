import {Notification }from "../models/notification.model.js";

class InAppNotificationObserver{
    async update(data){

        console.log("Observer triggered:", data);

        await Notification.create({
            recipient: data.recipientId,
            sender : data.senderId,
            type : data.type,
            postId : data.postId || null
        });
    }
}

export default InAppNotificationObserver;