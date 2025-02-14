import Redis from "ioredis";

const redisClient = new Redis(`redis://localhost:6379`);

redisClient.on("error", function (error) {
  console.error(error);
});

redisClient.on("connect", function () {
  console.log("Redis connected");
});

export { redisClient };