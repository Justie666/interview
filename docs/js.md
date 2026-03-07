# JavaScript Core

## 1. Что такое Event Loop и как он работает с микрозадачами и макрозадачами?

**Event Loop** — механизм, позволяющий JavaScript (однопоточному языку) выполнять асинхронный код без блокировки потока.

**Составные части:**
- **Call Stack** — стек вызовов, где выполняется синхронный код (LIFO)
- **Web APIs** — браузерные API (setTimeout, fetch, DOM-события), работающие вне JS-потока
- **Microtask Queue** — очередь микрозадач (приоритетная)
- **Macrotask Queue (Callback Queue)** — очередь макрозадач

**Порядок выполнения за один «тик»:**
1. Выполнить весь синхронный код в Call Stack
2. Выполнить **все** микрозадачи (до полного опустошения очереди)
3. Взять **одну** макрозадачу
4. Снова выполнить все накопившиеся микрозадачи
5. Повторить

**Микрозадачи:** `Promise.then/catch/finally`, `async/await`, `queueMicrotask()`, `MutationObserver`

**Макрозадачи:** `setTimeout`, `setInterval`, `setImmediate` (Node.js), UI-события, `MessageChannel`

```js
console.log('1');                              // синхронно
setTimeout(() => console.log('2'), 0);        // макрозадача
Promise.resolve().then(() => console.log('3')); // микрозадача
console.log('4');                              // синхронно

// Вывод: 1 → 4 → 3 → 2
```

---

## 2. Что такое замыкания и для чего они нужны?

**Замыкание** — функция, которая «помнит» переменные из своего лексического окружения даже после завершения внешней функции.

```js
function counter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const increment = counter();
increment(); // 1
increment(); // 2
increment(); // 3
```

**Применение:**
- **Инкапсуляция / приватные переменные** — скрыть данные от внешнего доступа
- **Фабричные функции** — создавать функции с предзаданным контекстом
- **Мемоизация** — кэшировать результаты вычислений
- **Частичное применение / currying** — зафиксировать часть аргументов функции
- **Обработчики событий** — сохранить контекст на момент подписки

---

## 3. Как работают Call Stack, Callback Queue и Event Loop?

**Call Stack** — структура LIFO. При вызове функции она кладётся на вершину стека, при завершении — убирается. Переполнение → `RangeError: Maximum call stack size exceeded`.

**Callback Queue (Macrotask Queue)** — очередь FIFO. Сюда попадают коллбэки `setTimeout`, `setInterval`, DOM-событий. Event Loop берёт задачу оттуда **только когда Call Stack пуст**.

**Microtask Queue** — приоритетная очередь. Полностью очищается **перед каждой** следующей макрозадачей. Именно поэтому `Promise.then` выполняется раньше `setTimeout(fn, 0)`.

```js
setTimeout(() => console.log('macro'), 0);
Promise.resolve().then(() => console.log('micro'));
console.log('sync');

// Вывод: sync → micro → macro
```

**Event Loop** — бесконечный цикл, который:
1. Проверяет, пуст ли Call Stack
2. Сначала опустошает Microtask Queue
3. Затем берёт одну задачу из Macrotask Queue

---

## 4. В чём разница между var, const и let?

|  | `var` | `let` | `const` |
| --- | --- | --- | --- |
| Область видимости | Функция | Блок `{}` | Блок `{}` |
| Hoisting | Да (значение `undefined`) | Да (TDZ — ошибка при доступе) | Да (TDZ) |
| Переобъявление | Можно | Нельзя | Нельзя |
| Переприсвоение | Можно | Можно | Нельзя |

```js
var x = 1; var x = 2; // OK
let y = 1; let y = 2; // SyntaxError

const obj = {};
obj.a = 1;   // OK — мутация объекта разрешена
obj = {};    // TypeError — переприсвоение запрещено
```

**Рекомендация:** используйте `const` по умолчанию, `let` — когда нужно переприсваивать, `var` — не используйте.

---

## 5. Что такое промисы и как они работают?

**Promise** — объект, представляющий результат асинхронной операции. Имеет три состояния: `pending` → `fulfilled` или `rejected`. Переход **необратим**.

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('данные'), 1000);
});

promise
  .then(data => console.log(data))   // 'данные'
  .catch(err => console.error(err))
  .finally(() => console.log('всегда'));
```

**Статические методы:**
- `Promise.all([...])` — ждёт все; отклоняется при первой ошибке
- `Promise.allSettled([...])` — ждёт все; возвращает результат каждого
- `Promise.race([...])` — результат первого завершившегося (успех или ошибка)
- `Promise.any([...])` — результат первого **успешного**

---

## 6. Что такое контекст (this) в JavaScript?

`this` — ключевое слово, ссылающееся на объект, в контексте которого выполняется функция. Значение определяется в **момент вызова** (не объявления).

| Способ вызова | Значение `this` |
| --- | --- |
| Глобальный контекст | `window` / `global` / `undefined` в strict mode |
| Метод объекта | Сам объект |
| `new Function()` | Новый создаваемый объект |
| `call/apply/bind` | Явно переданный объект |
| Стрелочная функция | `this` из внешнего лексического окружения |

```js
const obj = { x: 10, getX() { return this.x; } };
obj.getX();        // 10

const fn = obj.getX;
fn();              // undefined (контекст потерян)
fn.call(obj);      // 10 (явная привязка)
```

---

## 7. В чём разница function declaration, function expression и стрелочной функции?

**Function Declaration** — поднимается (hoisting) целиком, доступна до объявления в коде.

```js
greet(); // OK
function greet() { return 'hello'; }
```

**Function Expression** — поднимается только переменная (не значение).

```js
greet(); // TypeError: greet is not a function
const greet = function() { return 'hello'; };
```

**Arrow Function** — нет собственного `this`, `arguments`, `super`; нельзя использовать как конструктор.

```js
const add = (a, b) => a + b; // implicit return
const greet = () => ({ message: 'hello' }); // вернуть объект
```

**Когда что использовать:**
- Declaration — именованные утилиты, рекурсия
- Expression — условное присвоение, передача в качестве аргумента
- Arrow — коллбэки, методы класса с нужным `this`

---

## 8. В чём разница стрелочной и обычной функции в контексте this?

Обычная функция: `this` определяется **в момент вызова** — зависит от того, как функция была вызвана.

Стрелочная функция: `this` берётся из **лексического окружения** в момент объявления и не меняется никогда.

```js
const obj = {
  name: 'Alex',
  regular() { return this.name; },   // 'Alex'
  arrow: () => this.name,            // undefined (this = window)
};

// В классах стрелочные методы всегда сохраняют this:
class Button {
  handleClick = () => console.log(this); // всегда экземпляр класса
}
```

Стрелочные функции не имеют собственных `this`, `arguments`, `super`, `new.target` — их нельзя использовать как конструкторы.

---

## 9. Зачем нужен async/await?

Синтаксический сахар над промисами — делает асинхронный код читаемым как синхронный.

```js
// Promise-цепочка
fetch('/api/user')
  .then(r => r.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(r => r.json())
  .then(posts => console.log(posts));

// async/await — читается линейно
async function getUserPosts() {
  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch(`/api/posts/${user.id}`).then(r => r.json());
  console.log(posts);
}
```

Ошибки обрабатываются через `try/catch`. Для параллельного выполнения используйте `Promise.all`:

```js
// Последовательно (медленно — ждём каждый):
const a = await fetch('/a');
const b = await fetch('/b');

// Параллельно (быстро):
const [a, b] = await Promise.all([fetch('/a'), fetch('/b')]);
```

---

## 10. Что такое Map и Set?

`Map` — коллекция пар ключ-значение. В отличие от объекта, ключами могут быть **любые типы**, порядок вставки сохраняется.

```js
const map = new Map();
map.set('key', 'value');
map.set(42, 'number key');
map.set({}, 'object key');
map.get('key'); // 'value'
map.size;       // 3
```

`Set` — коллекция **уникальных** значений, дубликаты автоматически удаляются.

```js
const set = new Set([1, 2, 2, 3, 3]); // {1, 2, 3}
set.add(4);
set.has(2); // true

// Частый паттерн — удаление дублей из массива:
const unique = [...new Set(array)];
```

`Map` лучше объекта при частых добавлениях/удалениях, нестроковых ключах и итерации.

---
