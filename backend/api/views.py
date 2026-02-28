import asyncio
import time
import os
import redis as redis_lib
from typing import Optional

from ninja import NinjaAPI, Schema
from core.ml_engine import create_inference_session, batch_predict_session
from core.session_manager import (
    register_session,
    get_all_sessions,
    get_session,
    delete_session,
    log_call,
    get_recent_calls,
    get_metrics,
)

api = NinjaAPI(version="2.0", title="SmartFlow AI API")


# ────────────────────────────────────────────────────────────────
# SCHEMAS
# ────────────────────────────────────────────────────────────────

class ModelCfg(Schema):
    size: int = 128
    activation: str = "relu"
    architecture: str = "linear"
    n_classes: int = 2
    normalize: bool = True
    warmup: int = 5
    seed: int = 42
    description: str = ""


class CreateSchema(Schema):
    name: str
    cfg: ModelCfg = ModelCfg()


class PredictSchema(Schema):
    session_name: str
    inputs: list[float]


class BatchSchema(Schema):
    session_name: str
    inputs: list[list[float]]


class CompareSchema(Schema):
    session_a: str
    session_b: str
    inputs: list[float]


class BenchmarkSchema(Schema):
    session_name: str
    n_calls: int = 20
    input_dim: Optional[int] = None


# ────────────────────────────────────────────────────────────────
# HEALTH
# ────────────────────────────────────────────────────────────────

@api.get("/health/")
def health(request):
    try:
        redis_lib.from_url(os.environ.get("REDIS_URL", "redis://redis:6379/0")).ping()
        redis_ok = True
    except Exception:
        redis_ok = False
    sessions = get_all_sessions()
    return {
        "status": "ok",
        "version": "2.0.0",
        "redis": "connected" if redis_ok else "disconnected",
        "active_sessions": len(sessions),
        "timestamp": time.time(),
        "engine_version": "2.0",
    }


# ────────────────────────────────────────────────────────────────
# SESSIONS
# ────────────────────────────────────────────────────────────────

@api.get("/sessions/")
def list_sessions(request):
    return {"sessions": get_all_sessions()}


@api.post("/sessions/create/")
def create_session(request, payload: CreateSchema):
    if get_session(payload.name):
        return api.create_response(request, {"error": "Session already exists"}, status=400)
    _dump = getattr(payload.cfg, "model_dump", None) or getattr(payload.cfg, "dict", None)
    cfg_dict = _dump() if _dump else {}
    fn = create_inference_session(cfg_dict)
    register_session(payload.name, fn)
    return {
        "status": "created",
        "session_id": fn.session_id,
        "name": payload.name,
        "architecture": payload.cfg.architecture,
        "n_classes": payload.cfg.n_classes,
        "input_dim": payload.cfg.size,
    }


@api.delete("/sessions/{name}/")
def remove_session(request, name: str):
    if delete_session(name):
        return {"status": "deleted", "name": name}
    return api.create_response(request, {"error": "Not found"}, status=404)


@api.get("/sessions/{name}/stats/")
def session_stats(request, name: str):
    s = get_session(name)
    if not s:
        return api.create_response(request, {"error": "Not found"}, status=404)
    stats = s["fn"].get_stats()
    return {
        "name": name,
        "session_id": s["session_id"],
        "status": s["status"],
        "created_at": s["created_at"],
        "model_config": s["model_config"],
        **stats,
    }


# ────────────────────────────────────────────────────────────────
# INFERENCE
# ────────────────────────────────────────────────────────────────

@api.post("/predict/")
async def predict(request, payload: PredictSchema):
    s = get_session(payload.session_name)
    if not s:
        return api.create_response(request, {"error": "Session not found"}, status=404)
    result = await s["fn"](payload.inputs)
    log_call(payload.session_name, result)
    return result


@api.post("/batch/")
async def batch(request, payload: BatchSchema):
    s = get_session(payload.session_name)
    if not s:
        return api.create_response(request, {"error": "Session not found"}, status=404)
    batch_result = await batch_predict_session(s["fn"], payload.inputs)
    for r in batch_result["results"]:
        log_call(payload.session_name, r)
    return batch_result


@api.post("/compare/")
async def compare_sessions(request, payload: CompareSchema):
    sa = get_session(payload.session_a)
    sb = get_session(payload.session_b)
    if not sa:
        return api.create_response(
            request, {"error": f"Session '{payload.session_a}' not found"}, status=404
        )
    if not sb:
        return api.create_response(
            request, {"error": f"Session '{payload.session_b}' not found"}, status=404
        )
    result_a, result_b = await asyncio.gather(
        sa["fn"](payload.inputs),
        sb["fn"](payload.inputs),
    )
    log_call(payload.session_a, result_a)
    log_call(payload.session_b, result_b)
    label_a = result_a.get("prediction", {}).get("label")
    label_b = result_b.get("prediction", {}).get("label")
    agree = label_a == label_b
    return {
        "session_a": {"name": payload.session_a, "result": result_a},
        "session_b": {"name": payload.session_b, "result": result_b},
        "agreement": agree,
        "latency_diff_ms": round(
            abs(result_a.get("latency_ms", 0) - result_b.get("latency_ms", 0)), 2
        ),
    }


@api.post("/benchmark/")
async def benchmark_session(request, payload: BenchmarkSchema):
    import random

    s = get_session(payload.session_name)
    if not s:
        return api.create_response(request, {"error": "Session not found"}, status=404)
    input_dim = payload.input_dim or s["model_config"].get("size", 128)
    inputs_list = [
        [random.gauss(0, 1) for _ in range(input_dim)] for _ in range(payload.n_calls)
    ]
    t_start = time.perf_counter()
    results = await asyncio.gather(*[s["fn"](inp) for inp in inputs_list])
    total_time_ms = (time.perf_counter() - t_start) * 1000

    latencies = [r.get("latency_ms", 0) for r in results]
    latencies.sort()

    def pct(p):
        idx = max(0, int(len(latencies) * p / 100) - 1)
        return round(latencies[idx], 2) if latencies else 0

    total_time_sec = total_time_ms / 1000
    return {
        "session_name": payload.session_name,
        "n_calls": payload.n_calls,
        "total_time_ms": round(total_time_ms, 2),
        "throughput_rps": round(payload.n_calls / total_time_sec, 1) if total_time_sec > 0 else 0,
        "latency": {
            "min": round(min(latencies), 2) if latencies else 0,
            "max": round(max(latencies), 2) if latencies else 0,
            "avg": round(sum(latencies) / len(latencies), 2) if latencies else 0,
            "p50": pct(50),
            "p95": pct(95),
            "p99": pct(99),
        },
        "architecture": s["model_config"].get("architecture", "linear"),
    }


# ────────────────────────────────────────────────────────────────
# METRICS
# ────────────────────────────────────────────────────────────────

@api.get("/metrics/")
def metrics(request):
    return {
        **get_metrics(),
        "recent_calls": get_recent_calls(10),
    }


@api.get("/metrics/history/")
def metrics_history(request, limit: int = 100):
    return {
        "calls": get_recent_calls(limit),
        "total_logged": limit,
    }
