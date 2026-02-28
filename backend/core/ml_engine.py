"""
SmartFlow AI — Enhanced ML Engine v2.0
=======================================
Closure-based inference engine.

Features v2.0:
  - Multiple architectures: linear / mlp / attention / autoencoder
  - Multi-class classification (2/3/4/5 classes) with softmax
  - Input normalization (Z-score, Welford)
  - Drift detection (sliding window)
  - Latency percentiles (p50/p95/p99) per session
  - Warmup tracking, error rate tracking
  - Pure Python math (no numpy in inference path).
"""

import asyncio
import math
import random
import time
import uuid
from collections import Counter
from typing import Callable


# ────────────────────────────────────────────────────────────────
# UTILITIES
# ────────────────────────────────────────────────────────────────

def _softmax(scores: list[float]) -> list[float]:
    """Numerically stable softmax."""
    m = max(scores)
    exps = [math.exp(s - m) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(-50, min(50, x))))


def _relu(x: float) -> float:
    return max(0.0, x)


def _tanh(x: float) -> float:
    return math.tanh(x)


def _gelu(x: float) -> float:
    """Approx GELU: x * Φ(x)."""
    return x * 0.5 * (1.0 + math.tanh(math.sqrt(2 / math.pi) * (x + 0.044715 * x ** 3)))


ACTIVATIONS: dict[str, Callable[[float], float]] = {
    "relu": _relu,
    "sigmoid": _sigmoid,
    "tanh": _tanh,
    "gelu": _gelu,
}

LABELS_MAP = {
    2: ["negative", "positive"],
    3: ["negative", "neutral", "positive"],
    4: ["very_negative", "negative", "positive", "very_positive"],
    5: ["very_negative", "negative", "neutral", "positive", "very_positive"],
}


# ────────────────────────────────────────────────────────────────
# WEIGHT LOADING
# ────────────────────────────────────────────────────────────────

def _load_weights(config: dict) -> dict:
    """Generate weights for the selected architecture."""
    rng = random.Random(config.get("seed", 42))
    size = config.get("size", 128)
    arch = config.get("architecture", "linear")
    n_classes = config.get("n_classes", 2)
    act_name = config.get("activation", "relu")

    def _w(rows: int, cols: int, scale: float = 0.1) -> list[list[float]]:
        return [[rng.gauss(0, scale) for _ in range(cols)] for _ in range(rows)]

    weights = {
        "architecture": arch,
        "n_classes": n_classes,
        "activation": act_name,
        "input_dim": size,
    }

    if arch == "linear":
        weights["W1"] = _w(n_classes, size)
        weights["b1"] = [0.0] * n_classes

    elif arch == "mlp":
        hidden = max(16, size // 4)
        weights["W1"] = _w(hidden, size)
        weights["b1"] = [0.0] * hidden
        weights["W2"] = _w(n_classes, hidden)
        weights["b2"] = [0.0] * n_classes

    elif arch == "attention":
        head_dim = max(8, size // 8)
        weights["W_q"] = _w(head_dim, size)
        weights["W_k"] = _w(head_dim, size)
        weights["W_v"] = _w(head_dim, size)
        weights["W_out"] = _w(n_classes, head_dim)
        weights["b_out"] = [0.0] * n_classes

    elif arch == "autoencoder":
        bottleneck = max(4, size // 8)
        weights["W_enc"] = _w(bottleneck, size)
        weights["b_enc"] = [0.0] * bottleneck
        weights["W_dec"] = _w(size, bottleneck)
        weights["b_dec"] = [0.0] * size
        weights["anomaly_threshold"] = 0.5

    return weights


# ────────────────────────────────────────────────────────────────
# MATRIX OPS (pure Python)
# ────────────────────────────────────────────────────────────────

def _matvec(matrix: list[list[float]], vec: list[float]) -> list[float]:
    return [sum(row[j] * vec[j] for j in range(len(vec))) for row in matrix]


def _add_bias(vec: list[float], bias: list[float]) -> list[float]:
    return [v + b for v, b in zip(vec, bias)]


def _apply_act(vec: list[float], act_fn: Callable) -> list[float]:
    return [act_fn(v) for v in vec]


def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _normalize_input(inputs: list[float], stats: dict) -> list[float]:
    """Z-score normalization with running mean/std."""
    mean = stats["mean"]
    std = max(stats["std"], 1e-8)
    return [(x - mean) / std for x in inputs]


# ────────────────────────────────────────────────────────────────
# FORWARDS
# ────────────────────────────────────────────────────────────────

def _forward_linear(inputs: list[float], weights: dict) -> dict:
    act_fn = ACTIVATIONS.get(weights["activation"], _relu)
    n_classes = weights["n_classes"]
    x = (inputs + [0.0] * weights["input_dim"])[: weights["input_dim"]]

    logits = _add_bias(_matvec(weights["W1"], x), weights["b1"])
    probs = _softmax(logits) if n_classes > 1 else [_sigmoid(logits[0])]

    pred_idx = probs.index(max(probs))
    labels = LABELS_MAP.get(n_classes, [str(i) for i in range(n_classes)])

    return {
        "label": labels[pred_idx],
        "class_index": pred_idx,
        "confidence": round(probs[pred_idx], 4),
        "probabilities": {labels[i]: round(probs[i], 4) for i in range(n_classes)},
        "logits": [round(l, 4) for l in logits],
        "score": round(logits[pred_idx], 4),
    }


def _forward_mlp(inputs: list[float], weights: dict) -> dict:
    act_fn = ACTIVATIONS.get(weights["activation"], _relu)
    n_classes = weights["n_classes"]
    x = (inputs + [0.0] * weights["input_dim"])[: weights["input_dim"]]

    h = _apply_act(_add_bias(_matvec(weights["W1"], x), weights["b1"]), act_fn)
    logits = _add_bias(_matvec(weights["W2"], h), weights["b2"])
    probs = _softmax(logits)

    pred_idx = probs.index(max(probs))
    labels = LABELS_MAP.get(n_classes, [str(i) for i in range(n_classes)])

    return {
        "label": labels[pred_idx],
        "class_index": pred_idx,
        "confidence": round(probs[pred_idx], 4),
        "probabilities": {labels[i]: round(probs[i], 4) for i in range(n_classes)},
        "hidden_activation_norm": round(math.sqrt(sum(v ** 2 for v in h)), 4),
        "logits": [round(l, 4) for l in logits],
        "score": round(logits[pred_idx], 4),
    }


def _forward_attention(inputs: list[float], weights: dict) -> dict:
    n_classes = weights["n_classes"]
    x = (inputs + [0.0] * weights["input_dim"])[: weights["input_dim"]]
    scale = math.sqrt(len(weights["W_q"][0]))

    q = _matvec(weights["W_q"], x)
    k = _matvec(weights["W_k"], x)
    v = _matvec(weights["W_v"], x)

    attn_score = _dot(q, k) / scale
    attn_weight = _sigmoid(attn_score)
    context = [attn_weight * vi for vi in v]

    logits = _add_bias(_matvec(weights["W_out"], context), weights["b_out"])
    probs = _softmax(logits)

    pred_idx = probs.index(max(probs))
    labels = LABELS_MAP.get(n_classes, [str(i) for i in range(n_classes)])

    return {
        "label": labels[pred_idx],
        "class_index": pred_idx,
        "confidence": round(probs[pred_idx], 4),
        "probabilities": {labels[i]: round(probs[i], 4) for i in range(n_classes)},
        "attention_weight": round(attn_weight, 4),
        "attention_score": round(attn_score, 4),
        "score": round(logits[pred_idx], 4),
    }


def _forward_autoencoder(inputs: list[float], weights: dict) -> dict:
    act_fn = ACTIVATIONS.get(weights["activation"], _relu)
    x = (inputs + [0.0] * weights["input_dim"])[: weights["input_dim"]]

    encoded = _apply_act(_add_bias(_matvec(weights["W_enc"], x), weights["b_enc"]), act_fn)
    reconstructed = _add_bias(_matvec(weights["W_dec"], encoded), weights["b_dec"])

    mse = sum((xi - ri) ** 2 for xi, ri in zip(x, reconstructed)) / len(x)
    threshold = weights.get("anomaly_threshold", 0.5)
    is_anomaly = mse > threshold
    anomaly_score = min(mse / (threshold + 1e-8), 10.0)

    return {
        "label": "anomaly" if is_anomaly else "normal",
        "is_anomaly": is_anomaly,
        "reconstruction_error": round(mse, 6),
        "anomaly_score": round(anomaly_score, 4),
        "threshold": round(threshold, 4),
        "confidence": round(
            min(anomaly_score / 2, 1.0) if is_anomaly else 1.0 - min(anomaly_score / 2, 1.0), 4
        ),
        "encoded_dim": len(encoded),
        "bottleneck": [round(e, 4) for e in encoded[:8]],
        "score": round(mse, 6),
    }


FORWARD_MAP = {
    "linear": _forward_linear,
    "mlp": _forward_mlp,
    "attention": _forward_attention,
    "autoencoder": _forward_autoencoder,
}


# ────────────────────────────────────────────────────────────────
# DRIFT DETECTOR
# ────────────────────────────────────────────────────────────────

class _DriftDetector:
    def __init__(self, window: int = 50):
        self.window = window
        self._history: list[float] = []

    def update(self, inputs: list[float]) -> dict:
        mean_val = sum(inputs) / len(inputs) if inputs else 0.0
        self._history.append(mean_val)
        if len(self._history) > self.window:
            self._history.pop(0)

        if len(self._history) < 10:
            return {"drift_detected": False, "drift_score": 0.0, "drift_warning": None}

        hist_mean = sum(self._history[:-1]) / len(self._history[:-1])
        hist_std = (
            math.sqrt(
                sum((v - hist_mean) ** 2 for v in self._history[:-1]) / len(self._history[:-1])
            )
            + 1e-8
        )

        z_score = abs(mean_val - hist_mean) / hist_std
        drift = z_score > 2.5

        return {
            "drift_detected": drift,
            "drift_score": round(z_score, 3),
            "drift_warning": "Input distribution shifted significantly" if drift else None,
        }


# ────────────────────────────────────────────────────────────────
# RUNNING STATS (Welford)
# ────────────────────────────────────────────────────────────────

class _RunningStats:
    def __init__(self):
        self.n = 0
        self._mean = 0.0
        self._M2 = 0.0

    def update(self, value: float):
        self.n += 1
        delta = value - self._mean
        self._mean += delta / self.n
        delta2 = value - self._mean
        self._M2 += delta * delta2

    @property
    def mean(self) -> float:
        return self._mean

    @property
    def std(self) -> float:
        if self.n < 2:
            return 1.0
        return math.sqrt(self._M2 / self.n)


# ────────────────────────────────────────────────────────────────
# create_inference_session
# ────────────────────────────────────────────────────────────────

def create_inference_session(model_config: dict):
    session_id = str(uuid.uuid4())
    weights = _load_weights(model_config)
    created_at = time.time()
    call_count = 0
    latency_history: list[float] = []
    error_count = 0
    last_prediction = None
    warmup_limit = model_config.get("warmup", 5)
    warmup_done = False
    normalize = model_config.get("normalize", True)

    input_stats = _RunningStats()
    drift_det = _DriftDetector(window=50)

    def _percentile(arr: list[float], p: float) -> float:
        if not arr:
            return 0.0
        sorted_arr = sorted(arr)
        idx = max(0, min(len(sorted_arr) - 1, int(len(sorted_arr) * p / 100) - 1))
        return round(sorted_arr[idx], 2)

    def _get_latency_stats() -> dict:
        if not latency_history:
            return {"p50": 0, "p95": 0, "p99": 0, "min": 0, "max": 0, "avg": 0}
        return {
            "p50": _percentile(latency_history, 50),
            "p95": _percentile(latency_history, 95),
            "p99": _percentile(latency_history, 99),
            "min": round(min(latency_history), 2),
            "max": round(max(latency_history), 2),
            "avg": round(sum(latency_history) / len(latency_history), 2),
        }

    async def closure_predict(input_data: list[float]) -> dict:
        nonlocal call_count, error_count, last_prediction, warmup_done

        if not input_data:
            error_count += 1
            return {"error": "Empty input", "session_id": session_id}

        is_warmup = call_count < warmup_limit and not warmup_done
        if call_count >= warmup_limit:
            warmup_done = True

        call_count += 1
        t0 = time.perf_counter()

        arch = weights.get("architecture", "linear")
        delay = {"linear": 0.01, "mlp": 0.025, "attention": 0.04, "autoencoder": 0.035}
        await asyncio.sleep(delay.get(arch, 0.02))

        for v in input_data:
            input_stats.update(v)

        if normalize and call_count > 3:
            x_proc = _normalize_input(
                input_data, {"mean": input_stats.mean, "std": input_stats.std}
            )
        else:
            x_proc = input_data

        forward_fn = FORWARD_MAP.get(arch, _forward_linear)
        try:
            prediction = forward_fn(x_proc, weights)
        except Exception as exc:
            error_count += 1
            return {"error": str(exc), "session_id": session_id, "call_count": call_count}

        lat = (time.perf_counter() - t0) * 1000
        latency_history.append(lat)
        if len(latency_history) > 500:
            latency_history.pop(0)

        drift_info = drift_det.update(input_data)
        last_prediction = prediction
        lat_stats = _get_latency_stats()

        return {
            "session_id": session_id,
            "call_count": call_count,
            "prediction": prediction,
            "architecture": arch,
            "latency_ms": round(lat, 2),
            "avg_latency_ms": lat_stats["avg"],
            "p50_latency_ms": lat_stats["p50"],
            "p95_latency_ms": lat_stats["p95"],
            "p99_latency_ms": lat_stats["p99"],
            "uptime_seconds": round(time.time() - created_at, 1),
            "is_warmup": is_warmup,
            "normalized": normalize and call_count > 3,
            "drift": drift_info,
            "error_rate": round(error_count / call_count, 4) if call_count > 0 else 0,
        }

    closure_predict.session_id = session_id
    closure_predict.created_at = created_at
    closure_predict.model_config = model_config

    closure_predict.get_stats = lambda: {
        "call_count": call_count,
        "error_count": error_count,
        "error_rate": round(error_count / call_count, 4) if call_count > 0 else 0,
        "avg_latency_ms": round(sum(latency_history) / len(latency_history), 2)
        if latency_history
        else 0,
        "latency_stats": _get_latency_stats(),
        "uptime_seconds": round(time.time() - created_at, 1),
        "architecture": weights.get("architecture", "linear"),
        "n_classes": weights.get("n_classes", 2),
        "input_dim": weights.get("input_dim", 128),
        "warmup_done": warmup_done,
        "input_mean": round(input_stats.mean, 4),
        "input_std": round(input_stats.std, 4),
        "last_prediction": last_prediction,
        "model_version": "2.0",
    }

    return closure_predict


# ────────────────────────────────────────────────────────────────
# BATCH UTILITY
# ────────────────────────────────────────────────────────────────

async def batch_predict_session(session_fn, inputs: list[list[float]]) -> dict:
    results = await asyncio.gather(*[session_fn(inp) for inp in inputs])
    latencies = [r.get("latency_ms", 0) for r in results if "error" not in r]
    labels = [r.get("prediction", {}).get("label", "unknown") for r in results]
    label_counts = dict(Counter(labels))

    return {
        "results": list(results),
        "count": len(results),
        "success_count": len(latencies),
        "error_count": len(results) - len(latencies),
        "batch_latency_ms": round(sum(latencies), 2),
        "avg_latency_ms": round(sum(latencies) / len(latencies), 2) if latencies else 0,
        "label_distribution": label_counts,
    }
