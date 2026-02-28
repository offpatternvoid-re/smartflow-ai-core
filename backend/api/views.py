from ninja import NinjaAPI, Schema
from core.ml_engine import create_inference_session
from core.session_manager import (
    register_session, get_all_sessions, get_session,
    delete_session, log_call, get_recent_calls, get_metrics
)
import time, os, redis as redis_lib

api = NinjaAPI(version="1.0", title="SmartFlow AI API")

class CreateSchema(Schema):
    name: str
    model_config: dict = {"size": 128, "activation": "relu"}

class PredictSchema(Schema):
    session_name: str
    inputs: list[float]

class BatchSchema(Schema):
    session_name: str
    inputs: list[list[float]]

@api.get("/health/")
def health(request):
    try:
        redis_lib.from_url(os.environ.get(
            "REDIS_URL", "redis://redis:6379/0")).ping()
        redis_ok = True
    except: redis_ok = False
    return {"status": "ok", "version": "1.0.0",
            "redis": "connected" if redis_ok else "disconnected",
            "timestamp": time.time()}

@api.get("/sessions/")
def list_sessions(request):
    return {"sessions": get_all_sessions()}

@api.post("/sessions/create/")
def create_session(request, payload: CreateSchema):
    if get_session(payload.name):
        return api.create_response(
            request, {"error": "Already exists"}, status=400)
    fn = create_inference_session(payload.model_config)
    register_session(payload.name, fn)
    return {"status": "created", "session_id": fn.session_id,
            "name": payload.name}

@api.delete("/sessions/{name}/")
def remove_session(request, name: str):
    if delete_session(name):
        return {"status": "deleted", "name": name}
    return api.create_response(
        request, {"error": "Not found"}, status=404)

@api.post("/predict/")
async def predict(request, payload: PredictSchema):
    s = get_session(payload.session_name)
    if not s: return api.create_response(
        request, {"error": "Not found"}, status=404)
    result = await s["fn"](payload.inputs)
    log_call(payload.session_name, result)
    return result

@api.post("/batch/")
async def batch(request, payload: BatchSchema):
    s = get_session(payload.session_name)
    if not s: return api.create_response(
        request, {"error": "Not found"}, status=404)
    import asyncio
    results = await asyncio.gather(*[s["fn"](i) for i in payload.inputs])
    for r in results: log_call(payload.session_name, r)
    return {"results": list(results), "count": len(results)}

@api.get("/metrics/")
def metrics(request):
    return {**get_metrics(), "recent_calls": get_recent_calls(10)}
