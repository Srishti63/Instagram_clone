import { createClient } from "redis";

export const redisClient = createClient({
    url: process.env.REDIS_URL ,
});

redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

redisClient.on("connect", () => {
    console.log("✅ Redis Connected");
});

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};