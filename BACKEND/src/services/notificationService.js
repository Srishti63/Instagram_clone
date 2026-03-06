class NotificationService {
    constructor() {
        this.observers = [];
    }

    subscribe(observer){
        this.observers.push(observer);
    }

    async notify(data){
        for(const observer of this.observers){
            await observer.update(data);
        }
    }
}

const notificationService = new NotificationService();

export default notificationService;