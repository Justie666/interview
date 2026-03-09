# Browser & Network

## 1. Опиши процесс от ввода URL в браузере до отображения страницы

1. **URL parsing** — браузер разбирает введённый адрес
2. **DNS lookup** — резолвинг домена в IP-адрес (кэш браузера → ОС → DNS-сервер)
3. **TCP connection** — установка соединения (трёхстороннее рукопожатие: SYN → SYN-ACK → ACK)
4. **TLS handshake** — если HTTPS, согласование шифрования
5. **HTTP request** — браузер отправляет `GET /` с заголовками
6. **Server response** — сервер возвращает HTML (статус 200, заголовки, тело)
7. **HTML parsing** — браузер строит **DOM** (Document Object Model)
8. **CSS parsing** — строит **CSSOM** (CSS Object Model)
9. **Render Tree** — объединение DOM + CSSOM
10. **Layout (Reflow)** — вычисление размеров и позиций элементов
11. **Paint** — отрисовка пикселей слоями
12. **Composite** — объединение слоёв и вывод на экран

> Параллельно: при парсинге HTML при обнаружении `<script>` — загрузка и выполнение JS (блокирует парсинг, если нет `async`/`defer`).

## 2. Способы хранения данных в браузере

|                    | `localStorage` | `sessionStorage`    | `Cookies`              | `IndexedDB`      |
| ------------------ | -------------- | ------------------- | ---------------------- | ---------------- |
| Объём              | ~5–10 МБ       | ~5 МБ               | ~4 КБ                  | Сотни МБ         |
| Время жизни        | Постоянно      | До закрытия вкладки | Задаётся вручную       | Постоянно        |
| Отправка на сервер | Нет            | Нет                 | Да (автоматически)     | Нет              |
| Доступ из JS       | Да             | Да                  | Да (`document.cookie`) | Да (async API)   |
| Тип данных         | Только строки  | Только строки       | Только строки          | Любые (бинарные) |

```js
localStorage.setItem("token", "abc123");
localStorage.getItem("token"); // 'abc123'
localStorage.removeItem("token");
```

**Когда использовать:**

- `localStorage` — настройки, кэш на долгое время
- `sessionStorage` — временные данные текущей сессии
- `Cookies` — аутентификация (флаги `HttpOnly`, `Secure`, `SameSite`)
- `IndexedDB` — большие объёмы структурированных данных

## 3. Что такое CORS?

**CORS (Cross-Origin Resource Sharing)** — механизм безопасности браузера, контролирующий HTTP-запросы между разными источниками (origin = протокол + домен + порт).

**Браузер блокирует** запрос к другому origin по умолчанию (политика Same-Origin Policy).

**Как работает:**

- Сервер добавляет заголовок `Access-Control-Allow-Origin: *` (или конкретный домен)
- Для «сложных» запросов (PUT, DELETE, кастомные заголовки) сначала отправляется **preflight-запрос** `OPTIONS`

```
// Ответ сервера с разрешением CORS:
Access-Control-Allow-Origin: https://mysite.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization
```

**CORS — это ограничение браузера**, не сервера. Серверы общаются между собой без CORS. Решение: настроить заголовки на сервере или использовать прокси.

## 4. В чём разница async и defer у тега script?

По умолчанию `<script>` блокирует парсинг HTML — браузер останавливается, загружает и выполняет скрипт, затем продолжает.

|                    | `<script>`         | `async`              | `defer`             |
| ------------------ | ------------------ | -------------------- | ------------------- |
| Блокирует парсинг  | Да                 | Нет                  | Нет                 |
| Порядок выполнения | По порядку         | Не гарантирован      | По порядку          |
| Когда выполняется  | Сразу при загрузке | Сразу после загрузки | После парсинга HTML |

```html
<!-- Блокирует парсинг — плохо в <head> -->
<script src="app.js"></script>

<!-- Загружается параллельно, выполняется сразу — порядок не гарантирован -->
<script async src="analytics.js"></script>

<!-- Загружается параллельно, выполняется после HTML — сохраняет порядок -->
<script defer src="app.js"></script>
```

**Правило:** используйте `defer` для основных скриптов, `async` — для независимых (аналитика, реклама).

## 5. В чём разница между HTTP-методами GET, POST, PUT, PATCH, DELETE?

| Метод    | Назначение               | Тело запроса | Идемпотентен |
| -------- | ------------------------ | ------------ | ------------ |
| `GET`    | Получить ресурс          | Нет          | Да           |
| `POST`   | Создать ресурс           | Да           | Нет          |
| `PUT`    | Заменить ресурс целиком  | Да           | Да           |
| `PATCH`  | Частично обновить ресурс | Да           | Нет          |
| `DELETE` | Удалить ресурс           | Нет          | Да           |

**Идемпотентность** — повторный запрос даёт тот же результат. `GET /users/1` можно вызвать 100 раз — ничего не изменится. `POST /users` каждый раз создаёт нового пользователя.

```
GET    /posts       → список постов
GET    /posts/1     → конкретный пост
POST   /posts       → создать пост
PUT    /posts/1     → заменить пост целиком
PATCH  /posts/1     → обновить поле (например, только title)
DELETE /posts/1     → удалить пост
```

## 6. В чём разница Reflow и Repaint?

**Reflow (Layout)** — браузер пересчитывает размеры и позиции элементов. Дорогостоящая операция.

**Repaint** — браузер перерисовывает пиксели (цвет, тень, видимость) без изменения геометрии. Дешевле, но тоже затратно.

| Триггер   | Reflow + Repaint                                    | Только Repaint                                      |
| --------- | --------------------------------------------------- | --------------------------------------------------- |
| Изменение | `width`, `height`, `padding`, `margin`, `font-size` | `color`, `background`, `box-shadow`, `border-color` |

**Как избегать лишних reflow:**

```js
// Плохо — чтение и запись вперемешку (forced synchronous layout)
const h = el.offsetHeight; // читаем — браузер делает reflow
el.style.height = h + 10 + "px"; // пишем
const h2 = el.offsetHeight; // читаем снова — ещё один reflow

// Хорошо — сначала все чтения, потом все записи
const h = el.offsetHeight;
const w = el.offsetWidth;
el.style.height = h + 10 + "px";
el.style.width = w + 10 + "px";

// Лучше — CSS-анимации через transform/opacity (composite-only, без reflow)
el.style.transform = "translateX(100px)"; // GPU, без layout
```

**`will-change: transform`** — подсказывает браузеру создать отдельный слой для элемента.

## 7. Что такое Core Web Vitals?

**Core Web Vitals** — метрики Google для оценки пользовательского опыта, влияют на SEO-ранжирование.

| Метрика                             | Что измеряет                            | Хорошо   | Плохо    |
| ----------------------------------- | --------------------------------------- | -------- | -------- |
| **LCP** (Largest Contentful Paint)  | Скорость загрузки главного контента     | ≤ 2.5 с  | > 4 с    |
| **INP** (Interaction to Next Paint) | Отзывчивость на взаимодействия          | ≤ 200 мс | > 500 мс |
| **CLS** (Cumulative Layout Shift)   | Визуальная стабильность (прыжки layout) | ≤ 0.1    | > 0.25   |

**Как улучшить:**

- **LCP:** предзагрузка героического изображения (`<link rel="preload">`), SSR, CDN
- **INP:** разбить долгие задачи (`setTimeout(fn, 0)`, `scheduler.yield()`), не блокировать main thread
- **CLS:** задавать `width`/`height` изображениям, резервировать место под динамический контент

```html
<!-- Предзагрузка LCP-изображения -->
<link rel="preload" as="image" href="/hero.webp" />
<!-- Размеры изображения предотвращают CLS -->
<img src="photo.jpg" width="800" height="600" alt="..." />
```

## 8. Чем WebSocket отличается от HTTP?

**WebSocket** — протокол полнодуплексной связи через одно TCP-соединение. Сервер может отправлять данные клиенту без запроса.

|            | HTTP                                         | WebSocket           |
| ---------- | -------------------------------------------- | ------------------- |
| Связь      | Запрос-ответ (клиент инициирует)             | Двунаправленная     |
| Соединение | Новое на каждый запрос (HTTP/1.1 keep-alive) | Одно постоянное     |
| Заголовки  | Каждый раз (~500 байт)                       | Только при открытии |
| Применение | REST API, страницы                           | Чат, трейдинг, игры |

```js
// Клиент
const ws = new WebSocket("wss://api.example.com/ws");

ws.onopen = () =>
  ws.send(JSON.stringify({ type: "subscribe", channel: "prices" }));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onclose = () => console.log("Disconnected");
ws.onerror = (err) => console.error(err);

// Закрыть
ws.close();
```

**Установка соединения:** начинается с HTTP Upgrade-запроса (`101 Switching Protocols`), затем переключается на WebSocket-фреймы.

**Альтернативы:** Server-Sent Events (SSE) — если нужен только поток от сервера; Long Polling — если WebSocket недоступен.

## 9. Что такое Service Worker и PWA?

**Service Worker** — JavaScript-скрипт, работающий в отдельном потоке (не в main thread), выступает прокси между приложением и сетью. Позволяет перехватывать запросы, кэшировать ресурсы, работать офлайн.

```js
// Регистрация
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// sw.js — стратегия Cache First
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open("v1")
      .then((cache) => cache.addAll(["/index.html", "/main.css", "/app.js"])),
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
```

**Стратегии кэширования:**

- **Cache First** — сначала кэш, потом сеть (быстро, риск устаревшего контента)
- **Network First** — сначала сеть, кэш как fallback
- **Stale While Revalidate** — отдать кэш немедленно, обновить в фоне

**PWA (Progressive Web App)** — веб-приложение с нативными возможностями: офлайн-работа (Service Worker), установка на устройство (Web App Manifest), push-уведомления.

## 10. Как работает кэширование HTTP?

Браузер кэширует ответы на основе HTTP-заголовков.

**`Cache-Control`** — основной заголовок управления кэшем:

```
Cache-Control: no-store              — не кэшировать никогда
Cache-Control: no-cache              — кэшировать, но проверять актуальность
Cache-Control: max-age=3600          — кэш действителен 1 час
Cache-Control: public, max-age=86400 — кэш для всех (CDN тоже)
Cache-Control: private, max-age=300  — только браузер (не CDN)
```

**Валидация кэша (conditional requests):**

```
// ETag — уникальный хэш версии ресурса
ETag: "abc123"
// При следующем запросе:
If-None-Match: "abc123"
// Ответ сервера: 304 Not Modified (тело не отправляется)

// Last-Modified — дата последнего изменения
Last-Modified: Wed, 01 Jan 2025 00:00:00 GMT
If-Modified-Since: Wed, 01 Jan 2025 00:00:00 GMT
```

**Стратегия для SPA:** файлы с хэшем в имени (`app.a3f5c.js`) кэшируются навсегда (`max-age=31536000, immutable`), `index.html` — не кэшируется (`no-cache`).

## 11. Что такое XSS и CSRF? Как защититься?

**XSS (Cross-Site Scripting)** — внедрение вредоносного скрипта в страницу через пользовательский ввод.

```js
// Уязвимость
document.innerHTML = userInput; // если userInput = '<script>stealCookies()</script>'

// Защита:
// 1. Экранировать HTML-спецсимволы
// 2. Content Security Policy (CSP)
// 3. HttpOnly cookies — скрипт не может читать куки
// 4. Sanitize библиотеки (DOMPurify)
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);
```

**CSRF (Cross-Site Request Forgery)** — вредоносный сайт заставляет браузер жертвы отправить запрос к другому сайту (куки отправляются автоматически).

```
// Атака: пользователь залогинен в bank.com
// Сайт злоумышленника: <img src="https://bank.com/transfer?to=hacker&amount=1000">
// Браузер отправит запрос с куками bank.com!
```

**Защита от CSRF:**

- **CSRF-токен** — сервер выдаёт случайный токен, форма его включает, сервер проверяет
- **`SameSite=Strict/Lax`** — куки не отправляются в кросс-сайт запросах
- **Проверка `Origin`/`Referer`** заголовков на сервере

```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax
```

## 12. Что такое Content Security Policy (CSP)?

**CSP** — HTTP-заголовок, ограничивающий источники, из которых браузер может загружать ресурсы. Основная защита от XSS.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' https://fonts.googleapis.com; img-src 'self' data:; connect-src 'self' https://api.example.com
```

**Директивы:**

- `default-src` — fallback для всех ресурсов
- `script-src` — источники JS-кода
- `style-src` — источники CSS
- `img-src` — источники изображений
- `connect-src` — fetch/XHR/WebSocket

**`nonce`** — случайное значение для разрешения конкретных inline-скриптов:

```html
<!-- Сервер генерирует nonce при каждом запросе -->
<script nonce="abc123">
  /* этот скрипт разрешён */
</script>
```

**Report-only режим** — не блокирует, только логирует нарушения:

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

## 13. В чём разница HTTP/1.1, HTTP/2 и HTTP/3?

**HTTP/1.1 (1997)** — текстовый протокол, один запрос за раз на соединение:

- Head-of-line blocking: следующий запрос ждёт ответа на предыдущий
- Браузеры открывают 6 параллельных TCP-соединений на домен как костыль

**HTTP/2 (2015)** — бинарный, мультиплексирование:

- Несколько запросов по одному TCP-соединению одновременно
- Сжатие заголовков (HPACK) — экономия трафика
- Server Push — сервер отправляет ресурсы до запроса клиента
- Но: потеря TCP-пакета блокирует все потоки (TCP Head-of-line blocking)

**HTTP/3 (2022)** — на базе QUIC (UDP):

- Устраняет TCP Head-of-line blocking — потоки независимы
- Быстрое восстановление соединения (0-RTT при повторном подключении)
- Лучше на нестабильных сетях (мобильные, WiFi)

```
HTTP/1.1: [req1] → [res1] → [req2] → [res2]      последовательно
HTTP/2:   [req1 + req2 + req3] → [res1, res2, res3]  параллельно, 1 соединение
HTTP/3:   HTTP/2 + QUIC — потеря пакета не блокирует другие потоки
```

|                       | HTTP/1.1   | HTTP/2        | HTTP/3     |
| --------------------- | ---------- | ------------- | ---------- |
| Протокол              | TCP, текст | TCP, бинарный | QUIC (UDP) |
| Мультиплексирование   | Нет        | Да            | Да         |
| Head-of-line blocking | Да         | Частично      | Нет        |
| Сжатие заголовков     | Нет        | HPACK         | QPACK      |

## 14. В чём разница SSR, CSR и SSG?

**CSR (Client-Side Rendering)** — браузер получает пустой HTML + JS, рендерит всё на клиенте:

- Плюсы: быстрая навигация после загрузки, простой деплой (статика)
- Минусы: медленный First Contentful Paint, плохой SEO до выполнения JS
- Когда: dashboard за авторизацией, внутренние инструменты

**SSR (Server-Side Rendering)** — сервер рендерит HTML на каждый запрос:

- Плюсы: быстрый FCP, хороший SEO, актуальные данные
- Минусы: нагрузка на сервер, TTFB зависит от скорости сервера
- Когда: e-commerce, новостные сайты, страницы с персонализацией

**SSG (Static Site Generation)** — HTML генерируется при сборке:

- Плюсы: мгновенная отдача из CDN, минимальная нагрузка на сервер
- Минусы: данные обновляются только при пересборке
- Когда: блоги, документация, лендинги

**ISR (Incremental Static Regeneration, Next.js)** — SSG + ревалидация по времени:

```
CSR:  пустой HTML → JS → fetch → рендер         (медленный старт)
SSR:  данные + HTML на сервере → гидратация      (быстрый FCP)
SSG:  готовый HTML в CDN → мгновенно            (самый быстрый)
ISR:  SSG + revalidate каждые N секунд           (баланс)
```

**Гидратация** — процесс, при котором React «оживляет» серверный HTML, навешивая обработчики событий.

## 15. Что такое preload, prefetch и preconnect?

Resource Hints — подсказки браузеру загрузить или подготовить ресурсы заранее.

**`preload`** — загрузить ресурс немедленно с высоким приоритетом. Для ресурсов нужных на **текущей** странице:

```html
<!-- Шрифт до его обнаружения в CSS -->
<link rel="preload" href="/fonts/Inter.woff2" as="font" crossorigin />
<!-- LCP-изображение — критично для Core Web Vitals -->
<link rel="preload" href="/hero.webp" as="image" />
<!-- Критический CSS -->
<link rel="preload" href="/critical.css" as="style" />
```

**`prefetch`** — загрузить ресурс с низким приоритетом для **следующей** страницы:

```html
<!-- Пока пользователь читает текущую страницу, грузим следующую -->
<link rel="prefetch" href="/about.js" />
```

**`preconnect`** — установить TCP/TLS-соединение заранее, без загрузки ресурса:

```html
<!-- Сокращает время первого запроса к внешнему домену -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://api.example.com" />
```

**`dns-prefetch`** — только DNS-резолвинг (дешевле `preconnect`, fallback для старых браузеров):

```html
<link rel="dns-prefetch" href="https://analytics.google.com" />
```

| Hint           | Когда загружает        | Приоритет | Для чего                   |
| -------------- | ---------------------- | --------- | -------------------------- |
| `preload`      | Немедленно             | Высокий   | Ресурсы текущей страницы   |
| `prefetch`     | В фоне                 | Низкий    | Ресурсы следующей страницы |
| `preconnect`   | Соединение без ресурса | —         | Внешние домены             |
| `dns-prefetch` | Только DNS             | —         | Внешние домены (fallback)  |

---
