import redis.asyncio as aioredis
import os
from dotenv import load_dotenv

load_dotenv()

redis = None

async def get_redis():
    global redis
    if redis is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis = await aioredis.from_url(
            redis_url,
            decode_responses=True
        )
    return redis
