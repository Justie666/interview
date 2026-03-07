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

## 11. Как работает прототипное наследование?

**Прототипное наследование** — каждый объект имеет скрытую ссылку `[[Prototype]]` на другой объект (прототип). При обращении к свойству JS ищет его сначала в объекте, затем по цепочке прототипов до `null`.

```js
const animal = { speak() { return 'звук'; } };
const dog = Object.create(animal);
dog.name = 'Rex';

dog.speak();          // 'звук' — найдено в прототипе
dog.hasOwnProperty('name');  // true
dog.hasOwnProperty('speak'); // false
```

**В классах ES6** прототипное наследование скрыто за синтаксическим сахаром `class extends`:

```js
class Animal { speak() { return 'звук'; } }
class Dog extends Animal {
  speak() { return `${super.speak()} — гав`; }
}
new Dog().speak(); // 'звук — гав'
```

**Цепочка:** `dog.__proto__ === Dog.prototype`, `Dog.prototype.__proto__ === Animal.prototype`.

---

## 12. В чём разница throttle и debounce?

Оба ограничивают частоту вызовов функции, но по-разному:

**Debounce** — вызывает функцию только после того, как прошло `N` мс без новых вызовов. Подходит для: поиска по вводу, автосохранения.

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onSearch = debounce((query) => fetch(`/search?q=${query}`), 300);
```

**Throttle** — вызывает функцию не чаще одного раза за `N` мс. Подходит для: скролла, ресайза, mousemove.

```js
function throttle(fn, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

const onScroll = throttle(() => updatePosition(), 100);
```

| | Debounce | Throttle |
| --- | --- | --- |
| Вызов | После паузы | С фиксированным интервалом |
| Применение | Поиск, resize-конец | Скролл, mousemove |

---

## 13. Как работают spread и rest операторы?

Оба используют синтаксис `...`, но в разных контекстах.

**Spread (`...`) — разворачивает** итерируемое в отдельные элементы:

```js
// Копирование массива
const arr = [1, 2, 3];
const copy = [...arr, 4]; // [1, 2, 3, 4]

// Слияние объектов (shallow copy)
const merged = { ...defaults, ...overrides };

// Передача аргументов
Math.max(...arr); // 3
```

**Rest (`...`) — собирает** оставшиеся элементы в массив:

```js
// Параметры функции
function sum(first, ...rest) {
  return first + rest.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// Деструктуризация
const [head, ...tail] = [1, 2, 3, 4]; // head=1, tail=[2,3,4]
const { id, ...rest } = user;          // id отдельно, остальное в rest
```

Spread = «раскрыть», Rest = «собрать». Spread стоит в правой части, Rest — в левой (при деструктуризации) или в параметрах функции.

---

## 14. Что такое WeakMap и WeakRef?

**WeakMap** — коллекция пар ключ-значение, где ключами могут быть **только объекты**. Ключи удерживаются **слабыми ссылками** — если на объект-ключ нет других ссылок, он удаляется сборщиком мусора вместе с записью в WeakMap.

```js
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = heavyCompute(obj);
  cache.set(obj, result);
  return result;
}
// Когда obj удалится — запись в cache тоже исчезнет автоматически
```

**WeakRef** — слабая ссылка на объект. Объект может быть удалён сборщиком мусора, `deref()` вернёт `undefined`.

```js
let obj = { data: 'large' };
const ref = new WeakRef(obj);
obj = null; // obj может быть удалён GC

const val = ref.deref(); // объект или undefined
```

**Отличие от Map:** `WeakMap` не итерируемый, нет `.size`, `.keys()`, `.values()` — намеренно, чтобы не блокировать GC.

---

## 15. Как работают методы массивов map, filter, reduce?

Все три — методы высшего порядка, не мутируют исходный массив, возвращают новое значение.

**`map`** — преобразует каждый элемент, возвращает новый массив той же длины:

```js
const prices = [10, 20, 30];
const withTax = prices.map(p => p * 1.2); // [12, 24, 36]
```

**`filter`** — оставляет только элементы, для которых коллбэк вернул `true`:

```js
const users = [{ age: 17 }, { age: 22 }, { age: 15 }];
const adults = users.filter(u => u.age >= 18); // [{ age: 22 }]
```

**`reduce`** — сворачивает массив в одно значение (аккумулятор):

```js
const sum = [1, 2, 3, 4].reduce((acc, cur) => acc + cur, 0); // 10

// Группировка — частый паттерн
const byId = users.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});
```

**Цепочки:**

```js
const result = orders
  .filter(o => o.status === 'paid')
  .map(o => o.total)
  .reduce((sum, t) => sum + t, 0);
```

---

## 16. Что такое генераторы и Symbol.iterator?

**Генератор** — функция, выполнение которой можно приостановить (`yield`) и возобновить. Возвращает итератор.

```js
function* counter(start = 0) {
  while (true) {
    yield start++;
  }
}

const gen = counter(1);
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
```

**Symbol.iterator** — протокол итерируемости. Любой объект с этим символом можно использовать в `for...of`, spread, деструктуризации.

```js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let cur = this.from;
    const to = this.to;
    return {
      next() {
        return cur <= to
          ? { value: cur++, done: false }
          : { done: true };
      }
    };
  }
};

[...range]; // [1, 2, 3, 4, 5]
```

**Применение генераторов:** ленивые последовательности, пагинация, конечные автоматы, управление async-потоком (Redux Saga).

---
