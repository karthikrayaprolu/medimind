import redis.asyncio as aioredis

redis = None

async def get_redis():
    global redis
    if redis is None:
        redis = await aioredis.from_url(
            "redis://localhost:6379",
            decode_responses=True
        )
    return redis
