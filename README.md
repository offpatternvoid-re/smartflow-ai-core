# SmartFlow AI — Платформа для ML-инференса

> **СРСП** | Предмет: Модели, методы и алгоритмы Deep Learning
> Факультет: Информационных технологий
> Специальность (2-й курс): Высоконагруженные информационные системы с искусственным интеллектом
> **Студент:** Турсунов Пархатжан

---

🌐 **Live demo:** [smartflow-ai.vercel.app](https://smartflow-ai.vercel.app)
📦 **GitHub:** [github.com/your-repo/smartflow-ai](https://github.com/your-repo/smartflow-ai)

---

## Введение

SmartFlow AI представляет собой экспериментальную платформу для выполнения ML-инференса в контейнеризированной среде. Важно подчеркнуть, что проект задумывался как альтернатива облачным сервисам вроде AWS SageMaker или коммерческим хостингам типа Replicate, где пользователю приходится сталкиваться с тарифами, ограничениями по количеству вызовов и отсутствием гибкости развертывания. SmartFlow AI компактен, самодостаточен и может быть развёрнут на локальном сервере или в учебной лаборатории.

Главная техническая проблема, которую решает система, — изоляция состояния модели при одновременной поддержке множества «сессий» инференса. Вместо традиционных классов используется идиома Python-замыканий. Фабрика `create_inference_session(config)` возвращает асинхронную функцию `predict`, внутри которой захвачены веса, счётчики вызовов и метрики. Благодаря этому каждая сессия живёт в собственной лексической области видимости: между ними нет общего глобального состояния, что критически важно для асинхронной работы.

Платформа ориентирована на три целевые группы: разработчики, которые хотят опробовать идеи ML-инференса без сторонних зависимостей; исследователи, изучающие поведение моделей в реальном времени; и студенты, которым необходимо наглядно увидеть, как устроен «низкоуровневый» машинный интеллект. Проект демонстрирует принципы глубокого обучения, но без сложной инфраструктуры — всё вычисление происходит на чистом Python, что облегчает понимание математики и алгоритмов.

В рамках курса «Модели, методы и алгоритмы Deep Learning» SmartFlow AI служит иллюстрацией того, как можно организовать систему инференса на простых компонентах: замыкания, асинхронная архитектура, собственные реализации матричных операций. Это подчёркивает, что глубокие знания основ важнее, чем умение настраивать фреймворки.

Проект показывает следующие концепции: использование `async/await` в Web API (Django Ninja), декларативные схемы с Pydantic, контейнеризацию через Docker Compose, управление состоянием через Redis, визуализацию метрик на Angular с Chart.js и, главное, технический паттерн «closure for ML».

## Технологический стек

| Слой | Технология | Версия | Назначение |
|------|-----------|--------|------------|
| Frontend | Angular | 21.x | SPA-интерфейс |
| Стилизация | Tailwind CSS | 3.x | Утилитарный CSS |
| Визуализация | Chart.js | 4.x | Графики метрик |
| Backend | Django + Ninja | 6.x / 1.5 | REST API (ASGI) |
| ML Engine | Pure Python | 3.12 | Инференс без numpy |
| Сервер | Uvicorn | latest | ASGI-сервер |
| Кэш/очередь | Redis | 7.x | Хранение сессий |
| Контейнеризация | Docker Compose | 3.x | Оркестрация |
| Прокси | Nginx | Alpine | Раздача статики |

## Архитектура системы

### 4.1 Общая схема

Система реализует трёхуровневую архитектуру:

```
Angular SPA (порт 4200/Nginx)
       ↓  HTTP/REST
Django Ninja API (порт 8000/Uvicorn)
       ↓
ML Engine (Python closures) ←→ Redis (сессии)
```

Angular-приложение, собранное на `node:20-alpine`, обслуживается Nginx. Все запросы `GET`/`POST` пересылаются на Uvicorn, где находится Django Ninja‑приложение. Внутри API находится фабрика сессий и менеджер, сохраняющий метрики в Redis. Сам «движок» располагается в `backend/core/ml_engine.py` и реализован как набор чистых функций.

### 4.2 Ключевая архитектурная идея — ML-сессии через замыкания

Замыкание (closure) — это функция, которая запоминает окружение, в котором была определена. В Python это реализуется автоматически при создании вложенной функции. В нашем случае `create_inference_session(config)` создаёт локальные переменные `weights`, `call_count`, `latency_history`, `input_stats` и т.д. Затем внутри определяется асинхронная функция `closure_predict`, которая использует эти переменные. Эта функция возвращается вызывающему и может быть сохранена в менеджере сессий.

Пример псевдокода из `ml_engine.py`:

```python
def create_inference_session(config):
    weights = _initialize_weights(config)  # захвачено в closure
    call_count = 0
    latency_history = []

    async def predict(inputs):
        nonlocal call_count
        call_count += 1
        result = _forward_pass(inputs, weights)
        return {"prediction": result, "call_count": call_count}

    return predict  # возвращаем функцию, не объект
```

Преимущества перед классами очевидны: нет глобального состояния, которое могло бы быть случайно изменено; отсутствует overhead инстанциации (нет `__init__`, нет `self`); и при удалении функции сборщик мусора автоматически освобождает замкнутые объекты. В контексте многопоточной или асинхронной среды это даёт гарантию, что одна сессия не «протечёт» в другую.

Также закрытые переменные доступны только самой функции, что упрощает отладку и статический анализ. Пример из реального кода:

```python
closure_predict.session_id = session_id
closure_predict.get_stats = lambda: {
    "call_count": call_count,
    "avg_latency_ms": round(sum(latency_history) / len(latency_history), 2)
}
```

### 4.3 Четыре архитектуры нейросетей

- **linear** — одношаговый линейный слой, задержка ~10 ms. Веса `W1` и смещения `b1` создаются функцией `_load_weights`. Пример вычисления:
  ```python
  logits = _add_bias(_matvec(weights["W1"], x), weights["b1"])
  probs = _softmax(logits)
  ```

- **mlp** — двухслойный перцептрон со скрытым слоем, задержка ~25 ms. Скрытый слой имеет размер `max(16, size//4)`; активируется через выбранную функцию (`relu`, `gelu` и т.д.).

- **attention** — упрощённый механизм self-attention с Q/K/V-проекциями. Скалярное произведение нормируется на `sqrt(d)` и пропускается через `sigmoid` для получения веса внимания.

- **autoencoder** — архитектура энкодер‑декодер для детекции аномалий. Кодируется в вектор размерности `max(4, size//8)`, затем реконструируется. Ошибка восстановления используется для детекции и возвращается в поле `reconstruction_error`.

Каждая архитектура реализована отдельной функцией `_forward_*` и выбирается через словарь `FORWARD_MAP`.

## Разработка Frontend-части (Angular)

### 5.1 Структура приложения

Интерфейс состоит из следующих страниц:

- `/` — Landing page (hero, features, stats)
- `/dashboard` — Dashboard с KPI и live-активностью
- `/sessions` — Управление ML-сессиями
- `/predict` — Запуск инференса и бенчмарков
- `/analytics` — Графики и аналитика
- `/docs` — Документация API

Каждая страница оформлена в отдельном standalone компоненте, что уменьшает зависимость от модулей и упрощает lazy loading. Навигация реализована через `app.routes.ts`.

### 5.2 Ключевые технические решения

**Реактивность и Change Detection:**

После асинхронных операций Angular не всегда обновляет DOM автоматически. Например, при вызове `await this.api.predict()` статус `loading` оставался `true` на экране. Причина — стратегию `Default` и отсутствие события, которое бы инициировало проверку. Решение: вызывать `this.cdr.detectChanges()` в `finally` блоке каждого метода, работающего с HTTP. Это гарантирует, что UI реагирует на изменение состояний.

**Компонент Predict:**

Архитектура split-panel: левая панель содержит форму (выбор сессии, текстовое поле для вектора, кнопки), правая отображает результаты (label, confidence, latency и т.д.). Парсинг входного вектора реализован как:

```typescript
inputVector.replace(/[\[\]\s]/g, '').split(',').map(parseFloat)
```

Это избавляет пользователя от необходимости писать точный JSON; достаточно списка чисел через запятую.

**Визуализация метрик (Chart.js):**

- Donut-chart для архитектурного распределения сессий
- Горизонтальные bar-charts для latency и calls per session
- Line-chart для calls over time

Цветовая схема основана на архитектуре: linear=синий, mlp=зелёный, attention=оранжевый, autoencoder=фиолетовый. Динамическая раскраска реализована с помощью функции `getArchColor()` и масси
в массива `backgroundColor`, что позволило устранить баг с однотонными барами.

**Inline SVG иллюстрации:**

Все изображения на landing page реализованы средствами SVG, сформированными программно. Нет ни одного внешнего растрового файла; отклик на размер отображения и тёмную тему обеспечивается изменением атрибутов `fill`/`stroke` прямо в шаблоне.

**Универсальный API сервис:**

Один `ApiService` инкапсулирует все HTTP-вызовы. Базовый URL определяется автоматически из `environment.ts`:

```typescript
const base = environment.apiUrl || window.location.origin + '/api/v1';
```

Код сервиса использует `fetch` и возвращает промисы, что позволяет легко интегрировать с async/await.

## Разработка Backend-части (Django Ninja)

### 6.1 Почему Django Ninja, а не DRF

Проект выбирает Django Ninja по ряду причин:

- Автогенерация OpenAPI/Swagger без доп. конфигурации. Документация доступна сразу на `/api/v1/docs`.
- Нативная поддержка `async/await`, что позволяет не блокировать Uvicorn при вычислениях ML Engine.
- Пydantic v2 для валидации схем и типизированные эндпоинты упрощают код.
- Скорость разработки выше: не требуется определять сериализаторы и viewsets, достаточно простых функций.

### 6.2 API Эндпоинты (таблица)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/health/` | Статус сервиса, версия, Redis |
| GET | `/api/v1/sessions/` | Список всех сессий |
| POST | `/api/v1/sessions/create/` | Создание новой ML-сессии |
| DELETE | `/api/v1/sessions/{name}/` | Удаление сессии |
| GET | `/api/v1/sessions/{name}/stats/` | Детальная статистика |
| POST | `/api/v1/predict/` | Запуск инференса |
| POST | `/api/v1/batch/` | Пакетный инференс |
| POST | `/api/v1/compare/` | A/B сравнение двух сессий |
| POST | `/api/v1/benchmark/` | Стресс-тест сессии |
| GET | `/api/v1/metrics/` | Общие метрики платформы |
| GET | `/api/v1/metrics/history/` | История вызовов |

### 6.3 Важное техническое решение — Pydantic v2 конфликт

При переходе на Pydantic v2 было обнаружено, что поле `model_config` является зарезервированным внутренним свойством. В моделях, описывающих тело запросов, такое имя приводило к неопределённым ошибкам. Решением стал рефакторинг всех схем и frontend-форм: поле переименовано в `cfg`, а в сериализации используется `payload.cfg`. Это изменение подробно задокументировано в коде `backend/api/views.py` и `frontend/src/app/pages/*`.

### 6.4 Раздача статики (Swagger UI)

После установки Django Ninja swagger-статические файлы (`/static/ninja/*.css`) отдавались как `text/html`, что приводило к белому экрану документации. Добавление middleware `WhiteNoiseMiddleware` в `settings.py` исправило поведение:

```python
MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # остальные middleware
]
```

Whitenoise автоматически выставляет корректный `Content-Type` для CSS/JS.

## ML ENGINE v2.0

### 7.1 Принцип работы (подробно, минимум 10 предложений)

ML Engine разработан как автономный модуль `backend/core/ml_engine.py`. Все вычисления в inference path происходят на чистом Python без использования numpy, torch или других внешних библиотек. Это позволяет студентам видеть, как формируются матричные операции: `_matvec`, `_add_bias`, `_apply_act`, `_softmax`, `_dot`.

Функции активации включают relu, sigmoid, tanh и gelu (последний аппроксимируется через tanh). Весовые матрицы и смещения инициализируются с помощью потенциально повторяемого генератора `random.Random(seed)`.

Технически, когда вызывается `create_inference_session(config)`, создаются веса и вспомогательные объекты:

```python
weights = _load_weights(model_config)
input_stats = _RunningStats()
drift_det = _DriftDetector(window=50)
```

Затем определяется функция `closure_predict`, в которой происходит:
- подсчёт вызовов и определение режима warmup
- симуляция задержки (delay по архитектуре)
- обновление статистик ввода (`input_stats.update(v)`)
- нормализация при необходимости
- вычисление предсказания через соответствующую `_forward_*`
- подсчёт latency и обновление `latency_history`
- детекция дрейфа и формирование ответа.

Словарь `result` возвращается в JSON-совместимом виде и содержит поля `prediction`, `latency_ms`, `drift`, `error_rate` и др.

### 7.2 Нормализация входных данных (Welford's algorithm)

Онлайн-алгоритм Велфорда позволяет вычислять среднее и стандартное отклонение без хранения всех входных значений. Это критично для потоковых данных. Класс `_RunningStats` реализует алгоритм:

```python
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
```

После трёх прогревочных вызовов `call_count > 3` входной вектор нормализуется:

```python
x_proc = _normalize_input(
    input_data,
    {"mean": input_stats.mean, "std": input_stats.std}
)
```

Это обеспечивает z-score нормализацию `(x - mean) / (std + 1e-8)` и активируется только если в конфиге указан `normalize=True`.

### 7.3 Детекция дрейфа данных (Data Drift Detection)

Система поддерживает скользящее окно последних 50 средних значений входов. При каждом вызове `drift_det.update(input_data)` вычисляется среднее, добавляется в историю и, если история содержит >10 элементов, рассчитывается z-скор относительно предыдущих значений. Если он превышает 2.5, возвращается флаг `drift_detected=True`.

Результат включает поля:

```python
{
  "drift_detected": bool,
  "drift_score": float,
  "drift_warning": str | None
}
```

Это позволяет платформе мониторить качество модели и предлагать перетренировку при смещении входных данных.

### 7.4 Перцентили латентности

История задержек сохраняется в `latency_history` (максимум 500 последних записей). Функция `_percentile` вычисляет P50, P95, P99, min, max, avg:

```python
def _percentile(arr, p):
    if not arr: return 0.0
    sorted_arr = sorted(arr)
    idx = max(0, min(len(sorted_arr)-1, int(len(sorted_arr)*p/100)-1))
    return round(sorted_arr[idx], 2)
```

Полученные метрики включаются в ответ `closure_predict` и используются для SLA‑мониторинга.

### 7.5 Многоклассовая классификация

Движок поддерживает `n_classes` равные 2, 3, 4, 5. Для `n_classes>1` применяется softmax; для двоичной классификации дополнительно вычисляется `sigmoid` при `n_classes == 1`. Словарь `LABELS_MAP` предоставляет текстовые подписи, например:

```python
LABELS_MAP = {
    2: ["negative", "positive"],
    3: ["negative", "neutral", "positive"],
    4: ["very_negative", "negative", "positive", "very_positive"],
    5: ["very_negative", "negative", "neutral", "positive", "very_positive"],
}
```

Вероятности возвращаются в поле `probabilities`.

## База данных и хранение состояния

В качестве in-memory хранилища сессий используется Redis. Каждая сессия сохраняется под ключом `session:{name}` как JSON с конфигурацией и статистикой:

```
{
  "cfg": {...},
  "created_at": 1690000000.0,
  "stats": {...}
}
```

Redis выбран из-за его малых задержек и отсутствия необходимости в реляционных моделях. Django ORM не используется для ML-данных; никакие таблицы не создаются. Сессии эфиремны: при перезапуске контейнера информация теряется, что соответствует природе временных тестовых моделей.

Автоматические миграции при старте контейнера выполняются командой `python manage.py migrate`, но они относятся только к компонентам Django.

## Инфраструктура и DevOps

### 9.1 Docker Compose архитектура

Конфигурация включает три сервиса:
- `web` — Django/Uvicorn на базе `python:3.12-slim`.
- `frontend` — Angular build + Nginx multistage (см. docker/frontend.Dockerfile).
- `redis` — официальный Redis 7.x.

Все образы монтируют соответствующие каталоги и назначают зависимости `depends_on`.

### 9.2 Nginx как reverse proxy

В `docker/nginx.conf` настроено:

```nginx
server {
  listen 4200;
  root /usr/share/nginx/html;
  location /api/ {
    proxy_pass http://web:8000;
  }
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Nginx кэширует статические ассеты и обеспечивает CORS.

### 9.3 Multi-stage Docker build

Фронтенд собирается в два шага:

```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build -- --outputPath=dist

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

Это позволяет получить итоговый образ ~25 MB.

### 9.4 CI/CD

На уровне разработки `docker-compose up --build` выполняет:
- `collectstatic` для Swagger UI и Django статики;
- `migrate` для обновления БД;
- запуск Uvicorn в режиме hot-reload.

Строка запуска обозначена в `docker-compose.yml` и `backend/docker-entrypoint.sh`.

## Анализ решённых технических проблем

1. **Pydantic v2 конфликт имён** (`model_config` зарезервировано) → переименование в `cfg`.
2. **Computing... навсегда** —Angular Change Detection не видел async изменения → добавлен `this.cdr.detectChanges()`.
3. **Dashboard "No sessions yet"** — парсинг `res` вместо `res.sessions` на фронтенде.
4. **Swagger белый экран** — статическая раздача происходила с типом `text/html`; исправлено добавлением `whitenoise`.
5. **Цвета баров в Analytics** — все бары одного цвета; функция `getArchColor()` и динамический массив `backgroundColor[]` устранили проблему.
6. **Размерность входного вектора** — несоответствие `input_dim`; добавлено автоматическое определение из конфига.

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-repo/smartflow-ai-core.git
cd smartflow-ai-core

# 2. Запустить все сервисы
docker-compose up --build

# 3. Открыть в браузере
# Frontend:  http://localhost:4200
# API Docs:  http://localhost:8000/api/v1/docs
# Health:    http://localhost:8000/api/v1/health/
```

#### Тестирование через API:

```bash
# Создать сессию
curl -X POST http://localhost:8000/api/v1/sessions/create/ \
  -H "Content-Type: application/json" \
  -d '{"name": "test_v1", "cfg": {"size": 128, "architecture": "mlp", "n_classes": 3}}'

# Запустить инференс
curl -X POST http://localhost:8000/api/v1/predict/ \
  -H "Content-Type: application/json" \
  -d '{"session_name": "test_v1", "inputs": [0.1, -0.5, 0.3, 0.8]}'

# Бенчмарк
curl -X POST http://localhost:8000/api/v1/benchmark/ \
  -H "Content-Type: application/json" \
  -d '{"session_name": "test_v1", "n_calls": 50}'
```

## Структура проекта

```text
smartflow-ai-core/
├── backend/
│   ├── api/
│   │   └── views.py          # Django Ninja эндпоинты
│   ├── core/
│   │   ├── ml_engine.py      # ML Engine v2.0 (closures)
│   │   └── session_manager.py # Redis-менеджер сессий
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py
│   └── requirements.txt
├── frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── landing/      # Главная страница
│       │   ├── dashboard/    # Dashboard с KPI
│       │   ├── sessions/     # Управление сессиями
│       │   ├── predict/      # Инференс и бенчмарк
│       │   ├── analytics/    # Графики и аналитика
│       │   └── docs/         # Документация API
│       └── services/
│           └── api.service.ts # HTTP-клиент
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Сравнение с аналогами

| Функция | SmartFlow AI | AWS SageMaker | Replicate | BentoML |
|---------|-------------|---------------|-----------|---------|
| Self-hosted | ✅ | ❌ | ❌ | ✅ |
| Zero config | ✅ | ❌ | ❌ | ❌ |
| Closure isolation | ✅ | ❌ | ❌ | ❌ |
| Built-in drift detection | ✅ | платно | ❌ | ❌ |
| A/B тестирование | ✅ | ✅ | ❌ | ❌ |
| Latency percentiles | ✅ | платно | ❌ | ✅ |
| Стоимость | $0 | $$$$ | $$ | $0 |

## Заключение

В результате выполненной работы была разработана многоуровневая система, позволяющая запускать ML-инференс
на нескольких архитектурах при помощи чистого Python и асинхронной инфраструктуры. Были реализованы ключевые концепции Deep Learning: линейные и нелинейные слои, self-attention, автоэнкодер, многоклассовая классификация и статистики производительности. Системное программирование проявилось в выборе замыканий для изоляции сессий, использовании Redis для хранения состояния и контейнеризации с помощью Docker Compose.

Ключевой вклад проекта — демонстрация того, что ML-инференс может работать без тяжёлых фреймворков, если правильно организовать вычисления и данные. Платформа подчёркивает практическую ценность простоты: её можно развернуть на обычном ноутбуке, показать в лаборатории, использовать для быстрых экспериментов.

Для будущего развития возможны следующие направления: добавление WebSocket‑каналов для real-time метрик, интеграция PostgreSQL для долговременного хранения, внедрение авторизации через JWT и ролей, а также расширение набора архитектур (CNN, RNN). В долгосрочной перспективе можно организовать CI/CD с авторазвёртыванием в Kubernetes.

В целом архитектура Angular + Django Ninja + Redis + Docker оказалась эффективной: каждый компонент занимается своей задачей, стек легко изучаем студентам, а магистральный код остаётся компактным и наглядным. Проект может служить как учебный пример, так и базой для небольших внутренних сервисов.

## Использованные технологии

- [Angular 21](https://angular.dev) — Frontend фреймворк
- [Django Ninja](https://django-ninja.dev) — FastAPI-style API для Django
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [Chart.js](https://chartjs.org) — Визуализация данных
- [Redis](https://redis.io) — In-memory хранилище
- [Docker Compose](https://docs.docker.com/compose/) — Контейнеризация
- [Uvicorn](https://www.uvicorn.org) — ASGI сервер
- [Whitenoise](https://whitenoise.readthedocs.io) — Раздача статики
- [Pydantic v2](https://docs.pydantic.dev) — Валидация данных

---
*СРСП | КазНУ им. Аль-Фараби | 2026*
