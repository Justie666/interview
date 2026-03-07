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

## 17. Сколько типов данных в JavaScript и какие они?

В JavaScript **8 типов данных**: 7 примитивных + 1 ссылочный.

**Примитивы** (хранятся по значению, иммутабельны):

| Тип | Пример | Особенность |
| --- | --- | --- |
| `string` | `'hello'` | UTF-16 |
| `number` | `42`, `NaN`, `Infinity` | 64-bit float |
| `bigint` | `9007199254740991n` | Целые без ограничений |
| `boolean` | `true`, `false` | |
| `undefined` | `let x;` | Нет значения |
| `null` | `null` | Отсутствие объекта (typeof → 'object', это баг JS) |
| `symbol` | `Symbol('id')` | Уникальный идентификатор |

**Ссылочный тип** (хранятся по ссылке, мутабельны):
- `object` — объекты, массивы, функции, Map, Set, Date...

```js
// Примитивы сравниваются по значению
'hello' === 'hello' // true

// Объекты сравниваются по ссылке
{} === {}   // false
[] === []   // false

const a = { x: 1 };
const b = a;
b.x = 99;
console.log(a.x); // 99 — одна и та же ссылка
```

**`typeof` в JavaScript:**
```js
typeof 42         // 'number'
typeof 'str'      // 'string'
typeof true       // 'boolean'
typeof undefined  // 'undefined'
typeof null       // 'object' ← исторический баг
typeof {}         // 'object'
typeof []         // 'object'
typeof function(){} // 'function'
typeof Symbol()   // 'symbol'
```

---

## 18. В чём разница поверхностного и глубокого копирования объектов?

**Поверхностное копирование (shallow copy)** — копирует только первый уровень. Вложенные объекты остаются как ссылки.

```js
const original = { a: 1, nested: { b: 2 } };

// Способы shallow copy:
const copy1 = { ...original };
const copy2 = Object.assign({}, original);

copy1.a = 99;          // не влияет на original
copy1.nested.b = 99;   // ВЛИЯЕТ — nested — одна ссылка!
console.log(original.nested.b); // 99
```

**Глубокое копирование (deep copy)** — рекурсивно копирует все уровни.

```js
// 1. structuredClone — современный стандарт (доступен с Node 17+, браузеры 2022+)
const deep1 = structuredClone(original);
deep1.nested.b = 999;
console.log(original.nested.b); // 2 — оригинал не изменился

// 2. JSON (работает только для JSON-совместимых данных)
const deep2 = JSON.parse(JSON.stringify(original));
// Не работает с: функциями, undefined, Date, Map, Set, циклическими ссылками

// 3. Библиотека lodash
import cloneDeep from 'lodash/cloneDeep';
const deep3 = cloneDeep(original);
```

| Метод | Скорость | Поддержка типов |
| --- | --- | --- |
| `structuredClone` | Хорошая | Date, Map, Set, ArrayBuffer, циклические ссылки |
| `JSON.parse/stringify` | Быстрая | Только JSON-типы |
| `lodash.cloneDeep` | Средняя | Почти всё |

---

## 19. Что такое область видимости (scope) и замыкание в JavaScript?

**Область видимости (scope)** — контекст, в котором доступны переменные. В JS область видимости лексическая — определяется в момент написания кода.

**Виды областей видимости:**

```js
// Глобальная — доступна везде
var globalVar = 'global';

function outer() {
  // Функциональная — доступна внутри функции
  let outerVar = 'outer';

  if (true) {
    // Блочная — доступна только в блоке {} (let/const)
    let blockVar = 'block';
    var funcVar = 'func'; // var игнорирует блок, поднимается до функции
  }

  console.log(funcVar);  // 'func' — var доступен
  // console.log(blockVar); // ReferenceError
}
```

**Hoisting (поднятие)** — переменные и функции поднимаются к началу своей области видимости:

```js
console.log(x); // undefined (var поднят, но без значения)
var x = 5;

console.log(y); // ReferenceError: TDZ (Temporal Dead Zone)
let y = 5;

greet(); // OK — function declaration поднимается целиком
function greet() { return 'hello'; }
```

**Scope chain** — при обращении к переменной JS ищет сначала в текущем scope, затем во внешних, вплоть до глобального.

---

## 20. В чём разница call, apply и bind?

Все три явно задают `this` для функции. Разница — в способе передачи аргументов и когда выполняется функция.

```js
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const user = { name: 'Alex' };

// call — вызывает функцию немедленно, аргументы через запятую
greet.call(user, 'Привет', '!');   // 'Привет, Alex!'

// apply — вызывает функцию немедленно, аргументы массивом
greet.apply(user, ['Привет', '!']); // 'Привет, Alex!'

// bind — возвращает новую функцию с привязанным this (не вызывает)
const boundGreet = greet.bind(user, 'Привет');
boundGreet('!');   // 'Привет, Alex!'
boundGreet('...');  // 'Привет, Alex...'
```

| | `call` | `apply` | `bind` |
| --- | --- | --- | --- |
| Вызов | Немедленный | Немедленный | Возвращает функцию |
| Аргументы | Через запятую | Массивом | Частично применённые |

**Частичное применение через bind:**

```js
function multiply(a, b) { return a * b; }
const double = multiply.bind(null, 2); // a = 2 зафиксирован
double(5);  // 10
double(10); // 20
```

---

## 21. Что такое рекурсия?

**Рекурсия** — вызов функции самой себой. Требует **базового случая** (условие выхода), иначе бесконечный стек → `RangeError: Maximum call stack size exceeded`.

```js
function factorial(n) {
  if (n <= 1) return 1;          // базовый случай
  return n * factorial(n - 1);   // рекурсивный вызов
}
factorial(5); // 120

// Обход дерева — классическое применение
function walkTree(node) {
  console.log(node.value);
  for (const child of node.children) {
    walkTree(child);
  }
}
```

**Мемоизация** устраняет повторные вычисления (Фибоначчи без неё — O(2ⁿ)):

```js
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return (memo[n] = fib(n - 1, memo) + fib(n - 2, memo));
}
```

**Применение:** обход деревьев (DOM, AST, файловая система), сортировка (quicksort, mergesort), разбор вложенных структур, динамическое программирование.

**Глубокая рекурсия:** при большой глубине переписывайте на итерацию с явным стеком — не ограничена размером Call Stack.

---

## 22. Можно ли изменить this в стрелочной функции?

**Нет.** `this` стрелочной функции берётся из лексического окружения в момент определения и **не может быть изменён** никаким способом.

```js
const arrow = () => console.log(this);

// Все попытки изменить this — игнорируются:
arrow.call({ x: 1 });    // window / undefined (strict mode)
arrow.apply({ x: 1 });   // то же самое
arrow.bind({ x: 1 })();  // то же самое
new arrow();              // TypeError: arrow is not a constructor
```

**Практическая проблема:**

```js
const obj = {
  name: 'Alex',
  // Стрелочная функция берёт this из момента объявления объекта — это глобальный контекст
  greet: () => `Привет, ${this.name}`, // undefined!
  // Обычный метод — this определяется при вызове
  greetOk() { return `Привет, ${this.name}`; }, // 'Alex'
};
```

**Вывод:** если нужна возможность привязки `this` — используйте обычную функцию. Стрелочная — для колбэков, где нужно сохранить контекст внешнего кода.

---

## 23. Что такое принципы ООП?

**Объектно-ориентированное программирование** строится на четырёх принципах:

**1. Инкапсуляция** — скрытие внутреннего состояния, доступ только через публичный интерфейс:

```js
class BankAccount {
  #balance = 0; // приватное поле (ES2022)

  deposit(amount) { this.#balance += amount; }
  getBalance() { return this.#balance; }
}
// account.#balance — SyntaxError снаружи класса
```

**2. Наследование** — потомок получает свойства и методы родителя:

```js
class Animal { speak() { return 'звук'; } }
class Dog extends Animal {
  speak() { return `${super.speak()} — гав`; }
}
new Dog().speak(); // 'звук — гав'
```

**3. Полиморфизм** — один интерфейс, разное поведение в зависимости от типа:

```js
const animals = [new Dog(), new Cat(), new Bird()];
animals.forEach(a => console.log(a.speak())); // каждый — по-своему
```

**4. Абстракция** — скрытие сложности за простым интерфейсом:

```js
class HttpClient {
  get(url) { /* retry, timeout, headers, parsing — скрыто */ }
}
client.get('/api/user'); // пользователь не знает деталей
```

---

## 24. Что такое SOLID?

**SOLID** — пять принципов проектирования, делающих код гибким и сопровождаемым:

| Буква | Принцип | Суть |
| --- | --- | --- |
| **S** | Single Responsibility | Один класс/модуль — одна зона ответственности |
| **O** | Open/Closed | Открыт для расширения, закрыт для изменения |
| **L** | Liskov Substitution | Потомок взаимозаменяем с родителем |
| **I** | Interface Segregation | Много узких интерфейсов лучше одного широкого |
| **D** | Dependency Inversion | Зависеть от абстракций, а не от конкретных реализаций |

```js
// S — плохо: UserService делает всё
class UserService {
  getUser() {}
  sendEmail() {}   // чужая ответственность
  saveToFile() {}  // чужая ответственность
}
// S — хорошо: разделение
class UserService { getUser() {} }
class EmailService { sendEmail() {} }

// O — расширяем без изменения существующего кода
class Logger { log(msg) { console.log(msg); } }
class FileLogger extends Logger {
  log(msg) { super.log(msg); fs.appendFile('log.txt', msg); }
}

// D — зависим от интерфейса (notifier), а не от реализации
class OrderService {
  constructor(notifier) { this.notifier = notifier; }
  placeOrder() { this.notifier.send('Заказ оформлен'); }
}
// Можно передать EmailNotifier, SMSNotifier, SlackNotifier — без изменения OrderService
```

---

## 25. В чём разница == и ===? Что такое приведение типов?

**`===` (строгое равенство)** — сравнивает значение И тип, без приведений. Всегда предпочтительно.

**`==` (нестрогое равенство)** — приводит типы перед сравнением по сложным правилам.

```js
1 === 1           // true
1 === '1'         // false — разные типы

1 == '1'          // true  (строка → число)
0 == false        // true  (false → 0)
null == undefined // true  (специальное правило)
null == 0         // false (!)
[] == ![]         // true  — классический вопрос на собеседовании
```

**Приведение типов (Type Coercion):**

```js
// Явное
Number('42')   // 42
String(42)     // '42'
Boolean(0)     // false

// Неявное — в операциях
'5' + 3        // '53'  (число → строка, + конкатенирует)
'5' - 3        // 2     (строка → число, - арифметический)
+true          // 1
+null          // 0
+undefined     // NaN
```

**Falsy значения** (приводятся к `false`): `0`, `''`, `null`, `undefined`, `NaN`, `false`, `0n`.

**Правило:** всегда используйте `===`. `==` — источник трудноуловимых багов.

---

## 26. В чём разница null и undefined?

```js
// undefined — переменная объявлена, но не инициализирована (JS устанавливает сам)
let x;
x;                // undefined

function fn(a) {}
fn();             // a === undefined — аргумент не передан

const obj = {};
obj.missing;      // undefined — свойство не существует

// null — явное отсутствие значения (программист ставит намеренно)
let user = null;  // пользователь ещё не загружен
```

| | `undefined` | `null` |
| --- | --- | --- |
| `typeof` | `'undefined'` | `'object'` (исторический баг) |
| Происхождение | JS устанавливает сам | Программист задаёт явно |
| `== null` | `true` | `true` |
| `=== null` | `false` | `true` |

```js
// Стандартный паттерн — проверка на оба сразу
if (value == null) { /* null или undefined */ }
```

---

## 27. В чём разница ES Modules и CommonJS?

**CommonJS (Node.js, legacy)** — синхронная загрузка, `require` в рантайме:

```js
// Экспорт
module.exports = { greet };

// Импорт — работает в любом месте кода, путь может быть динамическим
const { greet } = require('./utils');
const config = require(`./configs/${env}`); // OK
```

**ES Modules (современный стандарт)** — статическая загрузка, анализируется до выполнения:

```js
// Экспорт
export function greet() {}
export default class App {}

// Импорт — только на верхнем уровне модуля
import { greet } from './utils.js';

// Динамический импорт — возвращает Promise
const { greet } = await import('./utils.js');
```

| | CommonJS | ES Modules |
| --- | --- | --- |
| Среда | Node.js (legacy) | Браузер + Node.js |
| Загрузка | Синхронная | Асинхронная |
| Tree shaking | Нет | Да |
| Динамический путь | `require(variable)` | `await import(variable)` |

**Tree shaking** — бандлер (Vite, Webpack) видит статические импорты и удаляет неиспользуемый код из бандла. С CommonJS это невозможно — импорты динамические.

---

## 28. Что такое optional chaining (?.) и nullish coalescing (??)?

**Optional chaining `?.`** — безопасный доступ к свойствам потенциально `null`/`undefined` значений. Возвращает `undefined` вместо `TypeError`.

```js
const user = { profile: null };

user.profile.avatar;   // TypeError!
user?.profile?.avatar; // undefined — безопасно

user?.getAvatar?.();   // undefined (безопасный вызов метода)
arr?.[0];              // undefined (безопасный доступ по индексу)
```

**Nullish coalescing `??`** — возвращает правый операнд только если левый `null` или `undefined`.

```js
// || — реагирует на все falsy (0, '', false) — это часто баг!
const count = userCount || 10;  // 0 → вернёт 10 (неверно!)

// ?? — только null/undefined
const count = userCount ?? 10;  // 0 → вернёт 0 (верно!)
const name  = user.name ?? 'Аноним';

// Часто комбинируют:
const city = user?.address?.city ?? 'Не указан';
```

**Операторы присвоения:**

```js
user.name  ??= 'Аноним'; // присвоить только если null/undefined
config.log ||= true;     // присвоить если falsy
el.hidden  &&= isAdmin;  // присвоить только если уже truthy
```

---

## 29. Какие паттерны проектирования чаще всего встречаются в JavaScript?

**Singleton** — один экземпляр на всё приложение:

```js
class Store {
  static #instance = null;

  static getInstance() {
    if (!Store.#instance) Store.#instance = new Store();
    return Store.#instance;
  }
}

Store.getInstance() === Store.getInstance(); // true
```

**Observer (pub/sub)** — подписчики реагируют на события. Основа всех событийных систем (DOM, Node.js EventEmitter, Redux):

```js
class EventEmitter {
  #handlers = {};

  on(event, fn)   { (this.#handlers[event] ??= []).push(fn); }
  off(event, fn)  { this.#handlers[event] = this.#handlers[event]?.filter(h => h !== fn); }
  emit(event, data) { this.#handlers[event]?.forEach(fn => fn(data)); }
}

const emitter = new EventEmitter();
emitter.on('login', user => console.log('Logged in:', user));
emitter.emit('login', { id: 1 });
```

**Factory** — создание объектов с логикой выбора, без `new` у потребителя:

```js
function createUser(role) {
  const base = { role, createdAt: Date.now() };
  if (role === 'admin') return { ...base, permissions: ['read', 'write', 'delete'] };
  return { ...base, permissions: ['read'] };
}
```

**Паттерны в React:**
- **HOC** — `React.memo`, `withAuth(Component)` — оборачивают компонент
- **Custom Hooks** — переиспользование логики (`useFetch`, `useLocalStorage`)
- **Compound Components** — `<Select>` + `<Select.Option>` с общим контекстом

---
