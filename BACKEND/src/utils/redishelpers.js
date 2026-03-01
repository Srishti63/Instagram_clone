import { redisClient } from "./redisClient.js";
import { ApiError } from "./ApiError.js";

export const storeOtp = async (purpose, userId, otp) => {
    await redisClient.set(`otp:${purpose}:${userId}`, otp, { EX: 300 });
};

export const verifyOtpFromRedis = async (purpose, userId, otp) => {
    const key = `otp:${purpose}:${userId}`;
    const storedOtp = await redisClient.get(key);

    if (!storedOtp) {
        throw new ApiError(400, "OTP expired or not found");
    }

    if (storedOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    await redisClient.del(key);
};

export const setCooldown = async (purpose, userId) => {
    await redisClient.set(
        `otp:cooldown:${purpose}:${userId}`,
        "true",
        { EX: 60 } // 60 sec cooldown
    );
};

export const checkCooldown = async (purpose, userId) => {
    return await redisClient.get(`otp:cooldown:${purpose}:${userId}`);
};

export const incrementLoginAttempts = async(identifiers)=>{
    const key = `login:attempts:${identifiers}`;

    const attempts= await redisClient.incr(key);

    if(attempts ==1){
        await redisClient.expire(key,900);
    }
    return attempts;
}

export const  getLoginAttempts = async(identifiers)=>{
    return await redisClient.get(`login:attempts:${identifiers}`);
}

export const resetLoginAttempts = async (identifiers) => {
  await redisClient.del(`login:attempts:${identifiers}`);
};