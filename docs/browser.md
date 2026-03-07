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

---

## 2. Способы хранения данных в браузере

|  | `localStorage` | `sessionStorage` | `Cookies` | `IndexedDB` |
| --- | --- | --- | --- | --- |
| Объём | ~5–10 МБ | ~5 МБ | ~4 КБ | Сотни МБ |
| Время жизни | Постоянно | До закрытия вкладки | Задаётся вручную | Постоянно |
| Отправка на сервер | Нет | Нет | Да (автоматически) | Нет |
| Доступ из JS | Да | Да | Да (`document.cookie`) | Да (async API) |
| Тип данных | Только строки | Только строки | Только строки | Любые (бинарные) |

```js
localStorage.setItem('token', 'abc123');
localStorage.getItem('token'); // 'abc123'
localStorage.removeItem('token');
```

**Когда использовать:**
- `localStorage` — настройки, кэш на долгое время
- `sessionStorage` — временные данные текущей сессии
- `Cookies` — аутентификация (флаги `HttpOnly`, `Secure`, `SameSite`)
- `IndexedDB` — большие объёмы структурированных данных

---

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

---
