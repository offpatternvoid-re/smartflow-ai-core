import asyncio, time, uuid, random

def create_inference_session(model_config: dict):
    """
    Фабрика инференс-сессий через замыкания.
    weights и session_id живут в лексическом окружении —
    без глобальных переменных и без инстансов классов.
    """
    session_id      = str(uuid.uuid4())
    weights         = _load_weights(model_config)
    created_at      = time.time()
    call_count      = 0
    latency_history = []

    async def closure_predict(input_data: list[float]) -> dict:
        nonlocal call_count
        call_count += 1
        t0     = time.perf_counter()
        result = await _process(input_data, weights)
        lat    = (time.perf_counter() - t0) * 1000
        latency_history.append(lat)
        avg = sum(latency_history) / len(latency_history)
        p95 = sorted(latency_history)[
            max(0, int(len(latency_history) * 0.95) - 1)
        ]
        return {
            "session_id":     session_id,
            "prediction":     result,
            "latency_ms":     round(lat, 2),
            "avg_latency_ms": round(avg, 2),
            "p95_latency_ms": round(p95, 2),
            "call_count":     call_count,
            "uptime_seconds": round(time.time() - created_at, 1),
        }

    closure_predict.session_id   = session_id
    closure_predict.created_at   = created_at
    closure_predict.model_config = model_config
    closure_predict.get_stats    = lambda: {
        "call_count":     call_count,
        "avg_latency_ms": round(
            sum(latency_history) / len(latency_history), 2
        ) if latency_history else 0,
        "uptime_seconds": round(time.time() - created_at, 1),
    }
    return closure_predict

def _load_weights(config: dict) -> list[float]:
    return [random.gauss(0, 1) for _ in range(config.get("size", 128))]

async def _process(inputs: list[float], weights: list[float]) -> dict:
    await asyncio.sleep(0.05)
    score      = sum(x * w for x, w in zip(inputs, weights))
    confidence = min(abs(score) / 10, 1.0)
    return {
        "score":      round(score, 4),
        "label":      "positive" if score > 0 else "negative",
        "confidence": round(confidence, 4),
    }
