# ⚡ SmartFlow AI
> PaaS для ML-инференса через замыкания · Django · Angular · Docker

![Status](https://img.shields.io/badge/status-active-16A34A)
![Stack](https://img.shields.io/badge/stack-Django%205%20%2B%20Angular%2017-0A0A0A)
![License](https://img.shields.io/badge/license-MIT-0A0A0A)

## 📋 Содержание
[Описание](#-описание) · [Архитектура](#-архитектура) · [Стек](#-стек) · [Структура](#-структура) · [Установка](#-установка) · [API](#-api-7-эндпоинтов) · [Страницы](#-страницы) · [.env](#-env) · [Troubleshooting](#-troubleshooting) · [Без Docker](#-без-docker) · [Лицензия](#-лицензия)

## 📌 Описание
SmartFlow AI — это передовая PaaS-платформа (Platform as a Service), предназначенная для динамической сборки, деплоя и мониторинга лёгких нейросетевых конвейеров. Продукт ориентирован на B2B-сегмент, стартапы и независимых разработчиков, которым нужен быстрый и надежный ML-инференс без развёртывания тяжёлых систем.

Научная новизна платформы заключается в отказе от классического Объектно-Ориентированного программирования. Вместо него используется мощный паттерн замыканий (Closures). Фабрика `create_inference_session()` единожды инициализирует веса модели в памяти и возвращает вложенную асинхронную функцию `closure_predict()`. 

Этот подход имеет решающие преимущества перед ООП: полная потокобезопасность (отсутствие race conditions при асинхронной обработке), надежная лексическая изоляция окружения каждой сессии (без глобальных переменных) и абсолютно нулевые накладные расходы на инстанцирование классов при каждом предикте, что радикально снижает latency.

Платформа использует асинхронный стек: Uvicorn работает в связке с асинхронным Django (Django Ninja), а пакетная обработка эффективно разрешается через `asyncio.gather()`. SmartFlow AI идеален для ML-инженеров, стартапов и команд, занимающихся быстрым прототипированием ИИ-продуктов.

## 🏗 Архитектура
```ascii
  ┌─────────────────────────┐
  │  Browser (Angular :4200)│
  └────────────┬────────────┘
               │ HTTP
  ┌────────────▼────────────┐
  │   Nginx (static :4200)  │
  └────────────┬────────────┘
               │ proxy_pass
  ┌────────────▼────────────┐
  │ Django + Uvicorn (:8000)│
  │  ┌───────────────────┐  │
  │  │ ML Engine         │  │
  │  │ (closures)        │  │
  │  │ Session Manager   │  │
  │  │ Django Ninja API  │  │
  │  └───────────────────┘  │
  └──────┬──────────┬───────┘
         │          │
  ┌──────▼───┐ ┌────▼──────┐
  │PostgreSQL│ │  Redis 7  │
  │172.17.0.1│ │  :6379    │
  └──────────┘ └───────────┘
```

## 🛠 Стек
| Слой        | Технология                           |
|-------------|--------------------------------------|
| Frontend    | Angular 17+, Tailwind CSS, Chart.js  |
| Backend     | Django 5, Django Ninja, Uvicorn      |
| ML Engine   | PyTorch (CPU), asyncio, closures     |
| Database    | PostgreSQL 18 (local)                |
| Cache       | Redis 7                              |
| Containers  | Docker, Docker Compose               |
| Proxy       | Nginx alpine                         |

## 📁 Структура
```text
.
  backend
    api
      views.py                   # ← Эндпоинты Django Ninja API
    config
      settings.py                # ← Конфигурация Django
      urls.py                    # ← Маршрутизация API
      asgi.py                    # ← ASGI точка входа для Uvicorn
    core
      ml_engine.py               # ← Closure factory (create_inference_session)
      session_manager.py         # ← Менеджер активных моделей
  docker
    backend.Dockerfile           # ← Сборка бэкенда с правами www-data
  docker-compose.yml             # ← Оркестрация сервисов
  .env                           # ← Переменные окружения
  frontend
    src
      app
        app.component.ts         # ← Корневой компонент с RouterOutlet
        app.routes.ts            # ← Маршрутизация Angular
        components
          navbar                 # ← Навигация (Cluely style)
          toast                  # ← Уведомления
        pages
          analytics              # ← Графики метрик Chart.js
          dashboard              # ← Мониторинг сессий (live feed)
          docs                   # ← Документация (Swagger)
          landing                # ← Hero страница (Cluely style)
          predict                # ← Single & Batch инференс
          sessions               # ← Управление сессиями (modal)
        services
          api.service.ts         # ← HTTP клиент для REST
          metrics.service.ts     # ← Polling через BehaviorSubject
          notification.service.ts# ← Менеджер Toast-уведомлений
      styles.css                 # ← Глобальные Tailwind-стили
    tailwind.config.js           # ← Дизайн-токены
```

## 🚀 Установка
```bash
git clone <url> && cd smartflow-ai-core
cp .env.example .env  # заполнить DB данные
docker-compose up --build
# Frontend:  http://localhost:4200
# API Docs:  http://localhost:8000/api/v1/docs
# Health:    http://localhost:8000/api/v1/health/
```

## 📡 API (7 эндпоинтов)
| Метод  | Эндпоинт | Назначение |
|--------|----------|------------|
| `GET` | `/api/v1/health/` | Статус системы и подключений |
| `GET` | `/api/v1/sessions/` | Список активных ML-сессий |
| `POST` | `/api/v1/sessions/create/` | Создать новую (name, config) |
| `DELETE` | `/api/v1/sessions/{name}/` | Удалить сессию по имени |
| `POST` | `/api/v1/predict/` | Одиночный предикшн |
| `POST` | `/api/v1/batch/` | Пакетный предикшн (asyncio.gather) |
| `GET` | `/api/v1/metrics/` | Статистика вызовов и latency |

**Примеры запросов (cURL):**
```bash
# 1. Health 
curl http://localhost:8000/api/v1/health/

# 2. List Sessions
curl http://localhost:8000/api/v1/sessions/

# 3. Create Session
curl -X POST http://localhost:8000/api/v1/sessions/create/ \
  -H 'Content-Type: application/json' \
  -d '{"name": "demo_model", "model_config": {"size": 128, "activation": "relu"}}'

# 4. Predict
curl -X POST http://localhost:8000/api/v1/predict/ \
  -H 'Content-Type: application/json' \
  -d '{"session_name": "demo_model", "inputs": [1.5, -0.2]}'

# 5. Batch Predict
curl -X POST http://localhost:8000/api/v1/batch/ \
  -H 'Content-Type: application/json' \
  -d '{"session_name": "demo_model", "inputs": [[1.5, -0.2], [4.1, 0.9]]}'

# 6. Delete Session
curl -X DELETE http://localhost:8000/api/v1/sessions/demo_model/

# 7. Metrics
curl http://localhost:8000/api/v1/metrics/
```

## 🖥 Страницы
| Маршрут | Описание |
|---------|----------|
| `/` | Лендинг с презентацией преимуществ и Hero Section (Cluely UI) |
| `/dashboard` | Главный Overview: 4 KPI, таблица сессий и live-лента инференсов |
| `/sessions` | Мозаика активных моделей и модальное окно создания новых сессий |
| `/predict` | Интерфейс тестирования (Single & Batch режимы) с логом истории |
| `/analytics` | Графики (Latency over Time, Calls) и P50/P95 метрики эффективности |
| `/docs` | Инструкция Quick Start (слева) + встроенный Swagger UI (справа) |

## ⚙️ .env
| Переменная | Пример | Описание |
|------------|--------|----------|
| `SECRET_KEY` | `django-insecure-smartflow-2026-xyz`| Ключ шифрования Django |
| `DEBUG` | `True` | Режим разработчика |
| `DB_HOST` | `172.17.0.1` | IP локального хоста из контейнера (Docker gateway) |
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DB_NAME` | `smartflow_db` | Имя БД |
| `DB_USER` | `smartflow_admin` | Юзер БД |
| `DB_PASSWORD` | `p@ss_fUnc_26` | Пароль БД |
| `REDIS_URL` | `redis://redis:6379/0` | Ссылка к Redis |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,0.0.0.0` | Разрешенные хосты |
| `CORS_ORIGINS` | `http://localhost:4200` | Whitelist для CORS (Angular) |

## 🐛 Troubleshooting
- **Permission denied (web-1)** → В `docker/backend.Dockerfile` добавлены `chmod -R 755` и `chown -R www-data:www-data`.
- **PostgreSQL not found** → Использована директива `extra_hosts: [ "host.docker.internal:host-gateway" ]` в `docker-compose.yml` (`DB_HOST=172.17.0.1`).
- **CORS errors** → Убедитесь, что `CorsMiddleware` стоит ПЕРВЫМ в `settings.MIDDLEWARE`.
- **Redis WARNING** → Выполните на хосте Linux: `sudo sysctl vm.overcommit_memory=1` (overcommit_memory=1).
- **version obsolete** → Удалена старая директива `version: "3.x"` из `docker-compose.yml`.

## 👨💻 Без Docker
```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
uvicorn backend.asgi:application --reload --port 8000

# Frontend
cd frontend && npm install
ng serve --port 4200 --proxy-config proxy.conf.json
```

## 📄 Лицензия
MIT — свободное использование и модификация.
