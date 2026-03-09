# Практические задачи

Задачи с реальных собеседований. Формат: условие → решение с объяснением.

---

## JS Quiz

### 1. Объекты как ключи

```js
const a = {},
  b = {},
  c = {};
a[b] = "1";
a[c] = "2";
console.log(a);
```

<details>
<summary>Ответ</summary>

**Вывод:** `{ '[object Object]': '2' }`

Любой объект, используемый как ключ, приводится к строке через `.toString()` → `'[object Object]'`. Оба объекта `b` и `c` дают одинаковый ключ, поэтому второе присваивание перезаписывает первое.

Чтобы использовать объекты как уникальные ключи — используйте `Map`.

</details>

### 2. Порядок Event Loop

```js
console.log("1");

setTimeout(() => console.log("2"), 0);
setTimeout(() => console.log("3"), 0);

Promise.resolve()
  .then(() => console.log("4"))
  .then(() => console.log("5"));

console.log("6");
```

<details>
<summary>Ответ</summary>

**Вывод:** `1 → 6 → 4 → 5 → 2 → 3`

1. Синхронный код: `1`, `6`
2. Микрозадачи (Promise.then) полностью: `4`, `5`
3. Макрозадачи по одной: `2`, `3`

Микрозадачи всегда выполняются до следующей макрозадачи.

</details>

### 3. Потеря `this` в колбэке

```js
const obj = {
  name: "Alice",
  friends: ["Bob", "Charlie"],
  printFriends() {
    this.friends.filter(function (friend) {
      console.log(this.name + " → " + friend);
    });
  },
};

obj.printFriends();
```

<details>
<summary>Ответ</summary>

**Вывод:** `undefined → Bob`, `undefined → Charlie`

Обычная функция в `.filter()` теряет контекст — `this` внутри неё указывает на `undefined` (strict mode) или `window`.

**Решение:** заменить на стрелочную функцию:

```js
printFriends() {
  this.friends.filter(friend => {
    console.log(this.name + ' → ' + friend) // 'Alice → Bob'
  })
}
```

Стрелочная функция берёт `this` из окружающего лексического контекста — метода `printFriends`.

</details>

### 4. typeof null

```js
console.log(typeof null);
console.log(typeof undefined);
console.log(typeof []);
console.log(typeof function () {});
```

<details>
<summary>Ответ</summary>

```
'object'    ← исторический баг JS (с 1995 года)
'undefined'
'object'    ← массивы тоже объекты
'function'  ← функции — объекты, но typeof возвращает 'function'
```

Проверить что это массив: `Array.isArray([])` → `true`.
Проверить `null`: `value === null`.

</details>

### 5. Приведение типов с ==

```js
console.log([] == ![]);
console.log(null == undefined);
console.log(null == 0);
console.log("" == false);
console.log(0 == "0");
```

<details>
<summary>Ответ</summary>

```
true   // [] → 0, ![] → false → 0, итого 0 == 0
true   // специальное правило языка
false  // null == только null или undefined
true   // '' → 0, false → 0
true   // '0' → 0
```

`==` применяет приведение типов по сложным правилам. Всегда используйте `===`.

</details>

---

## Реализации

### 6. EventEmitter с chaining

Реализовать класс `EventEmitter` с методами `on`, `off`, `emit`. Методы `on` и `off` должны поддерживать chaining.

```js
const emitter = new EventEmitter();

emitter
  .on("data", (x) => console.log("handler 1:", x))
  .on("data", (x) => console.log("handler 2:", x))
  .emit("data", 42);
// handler 1: 42
// handler 2: 42
```

<details>
<summary>Решение</summary>

```js
class EventEmitter {
  constructor() {
    this._handlers = {};
  }

  on(event, fn) {
    if (!this._handlers[event]) {
      this._handlers[event] = [];
    }
    this._handlers[event].push(fn);
    return this; // chaining
  }

  off(event, fn) {
    if (this._handlers[event]) {
      this._handlers[event] = this._handlers[event].filter((h) => h !== fn);
    }
    return this; // chaining
  }

  emit(event, ...args) {
    if (this._handlers[event]) {
      this._handlers[event].forEach((fn) => fn(...args));
    }
    return this;
  }
}
```

**Ключевые моменты:**

- `return this` в каждом методе обеспечивает chaining
- `off` сравнивает по ссылке на функцию — анонимные функции нельзя отписать
- `emit` использует spread для передачи любого числа аргументов

</details>

### 7. Debounce

Реализовать функцию `debounce(fn, delay)` — вызывает `fn` только после того, как прошло `delay` мс без новых вызовов.

<details>
<summary>Решение</summary>

```js
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Использование:
const onSearch = debounce((query) => {
  fetch(`/search?q=${query}`);
}, 300);

input.addEventListener("input", (e) => onSearch(e.target.value));
```

**Ключевые моменты:**

- `clearTimeout` при каждом вызове сбрасывает таймер
- `fn.apply(this, args)` сохраняет контекст и аргументы
- Замыкание хранит `timer` между вызовами

</details>

### 8. Поиск с debounce и AbortController (SWAPI-задача)

Написать React-компонент: поиск персонажей Star Wars через [https://swapi.dev](https://swapi.dev). Требования:

- debounce 300 мс
- отмена предыдущего запроса при новом (AbortController)
- индикатор загрузки

<details>
<summary>Решение</summary>

```jsx
import { useState, useEffect, useRef } from "react";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function SwapiSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`https://swapi.dev/api/people/?search=${debouncedQuery}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск персонажа..."
      />
      {loading && <p>Загрузка...</p>}
      {error && <p>Ошибка: {error}</p>}
      <ul>
        {results.map((p) => (
          <li key={p.url}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Почему AbortController важен:** без него старый запрос может вернуться позже нового → race condition → на экране окажутся неверные данные.

</details>

### 9. Чек-боксы с двойным кликом — найди баги

В коде ниже несколько ошибок. Найдите и исправьте.

```jsx
function CheckboxList({ items }) {
  const [selected, setSelected] = React.useState([]);

  React.useEffect(() => {
    document.addEventListener("dblclick", () => {
      console.log("selected:", selected);
    });
  });

  return (
    <div>
      {items.map((item, i) => (
        <label for={`item-${i}`}>
          <input
            type="checkbox"
            id={`item-${i}`}
            disable={selected.includes(item.id)}
            onChange={() =>
              setSelected((prev) =>
                prev.includes(item.id)
                  ? prev.filter((id) => id !== item.id)
                  : [...prev, item.id],
              )
            }
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}
```

<details>
<summary>Ответ — список багов</summary>

**1. `useEffect` без массива зависимостей** — подписка на `dblclick` добавляется при каждом рендере, накапливаются дубли обработчиков. Нужны: зависимости `[selected]` и функция очистки:

```jsx
useEffect(() => {
  const handler = () => console.log("selected:", selected);
  document.addEventListener("dblclick", handler);
  return () => document.removeEventListener("dblclick", handler);
}, [selected]);
```

**2. `for` вместо `htmlFor`** — в JSX HTML-атрибут `for` пишется как `htmlFor`:

```jsx
<label htmlFor={`item-${i}`}>
```

**3. `disable` вместо `disabled`** — неверное имя атрибута, чекбокс не будет отключаться:

```jsx
disabled={selected.includes(item.id)}
```

**4. `key={i}` (индекс) при использовании в списке** — неявная проблема: лучше `key={item.id}`, чтобы React правильно отслеживал элементы при перестановках.

</details>

---

## JS Quiz (продолжение)

### 10. Замыкание в цикле — var vs let

```ts
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
```

<details>
<summary>Ответ</summary>

**Вывод:** `3 3 3` затем `0 1 2`

`var` не создаёт новую область видимости для каждой итерации — все три колбэка замыкают одну и ту же переменную `i`, которая к моменту срабатывания таймеров уже равна `3`.

`let` создаёт новое связывание на каждой итерации — каждый колбэк замыкает свою копию `j`.

**Решение без `let`** (до ES6) — IIFE:

```ts
for (var i = 0; i < 3; i++) {
  (function (i: number) {
    setTimeout(() => console.log(i), 0);
  })(i);
}
```

</details>

### 11. Promise chaining — что выведет?

```ts
Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => {
    throw new Error("oops");
  })
  .catch(() => 42)
  .then((x) => console.log(x));
```

<details>
<summary>Ответ</summary>

**Вывод:** `42`

1. `1 + 1 = 2`
2. Бросается ошибка → `.then` пропускается, управление переходит в `.catch`
3. `.catch` возвращает `42` — это разрешённый Promise
4. `.then(x => console.log(x))` получает `42`

**Ключевое:** `.catch` не прерывает цепочку — он сам возвращает Promise. Если не перебросить ошибку, следующий `.then` выполнится как обычно.

</details>

### 12. Hoisting — что выведет?

```ts
console.log(typeof foo);
console.log(typeof bar);

var foo = function () {};
function bar() {}

console.log(typeof foo);
console.log(typeof bar);
```

<details>
<summary>Ответ</summary>

```
'undefined'   // var foo поднят, но без значения
'function'    // function bar поднята целиком
'function'    // foo теперь присвоена функция
'function'    // bar не изменился
```

`var` поднимается с значением `undefined`. Function declaration поднимается полностью — и имя, и тело. Поэтому `bar` доступна до своего объявления в коде.

</details>

### 13. Прототипная цепочка — instanceof

```ts
function A() {}
function B() {}

B.prototype = Object.create(A.prototype);

const b = new (B as any)();

console.log(b instanceof B);
console.log(b instanceof A);
console.log(b instanceof Object);
console.log(b.constructor === B);
```

<details>
<summary>Ответ</summary>

```
true   // b.__proto__ === B.prototype
true   // A.prototype есть в цепочке
true   // Object.prototype есть в любой цепочке
false  // B.prototype = Object.create(A.prototype) перезаписал constructor
```

`instanceof` проверяет цепочку прототипов, а не сам конструктор. При наследовании через `Object.create` свойство `constructor` теряется — нужно восстанавливать вручную:

```ts
B.prototype.constructor = B;
```

</details>

---

## Реализации (продолжение)

### 14. Throttle

Реализовать функцию `throttle(fn, limit)` — вызывает `fn` не чаще одного раза за `limit` мс.

```ts
const onScroll = throttle(() => console.log("scroll"), 300);
window.addEventListener("scroll", onScroll);
// при быстром скролле — срабатывает максимум раз в 300 мс
```

<details>
<summary>Решение</summary>

```ts
function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```

**Ключевые моменты:**

- `lastCall` хранится в замыкании между вызовами
- В отличие от debounce — функция вызывается сразу при первом вызове, затем блокируется на `limit` мс
- `Parameters<T>` сохраняет типы аргументов исходной функции

</details>

### 15. Curry

Реализовать функцию `curry(fn)` — возвращает каррированную версию функции. Поддерживает частичное применение аргументов.

```ts
const add = (a: number, b: number, c: number) => a + b + c;

const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6
```

<details>
<summary>Решение</summary>

```ts
function curry(fn: (...args: unknown[]) => unknown) {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function (...moreArgs: unknown[]) {
      return curried(...args, ...moreArgs);
    };
  };
}
```

**Ключевые моменты:**

- `fn.length` — количество параметров исходной функции
- Если накоплено достаточно аргументов — вызываем `fn`, иначе — возвращаем новую функцию
- Аргументы накапливаются через spread — не мутируем массив

</details>

### 16. Promise.all — полифил

Реализовать `promiseAll(promises)`, которая ведёт себя как `Promise.all`: резолвится когда все промисы выполнены, реджектится при первой ошибке.

```ts
promiseAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]).then(
  console.log,
); // [1, 2, 3]
```

<details>
<summary>Решение</summary>

```ts
function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);

    const results: T[] = new Array(promises.length);
    let remaining = promises.length;

    promises.forEach((promise, i) => {
      Promise.resolve(promise)
        .then((value) => {
          results[i] = value;
          remaining--;
          if (remaining === 0) resolve(results);
        })
        .catch(reject);
    });
  });
}
```

**Ключевые моменты:**

- `results[i] = value` — сохраняем по индексу, чтобы порядок совпадал с входным массивом (промисы могут завершиться в любом порядке)
- `Promise.resolve(promise)` — обрабатывает случай когда элемент не является промисом
- При первом `reject` всё отменяется — остальные промисы продолжают выполняться, но результат игнорируется

</details>

### 17. pipe и compose

Реализовать `pipe(f, g, h)` — применяет функции слева направо. И `compose(f, g, h)` — справа налево.

```ts
const double = (x: number) => x * 2;
const addOne = (x: number) => x + 1;
const square = (x: number) => x * x;

pipe(double, addOne, square)(3); // 49
compose(square, addOne, double)(3); // 49
```

<details>
<summary>Решение</summary>

```ts
function pipe<T>(...fns: Array<(arg: T) => T>): (x: T) => T {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
}

function compose<T>(...fns: Array<(arg: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}
```

**Ключевые моменты:**

- `pipe` = `reduce` (слева направо) — читается как цепочка операций
- `compose` = `reduceRight` (справа налево) — математическая запись `f(g(h(x)))`
- Оба принимают любое количество функций через rest-параметры

</details>

### 18. Flatten

Реализовать `flatten(arr)` — рекурсивно разворачивает вложенный массив любой глубины.

```ts
flatten([1, [2, [3, [4]], 5]]); // [1, 2, 3, 4, 5]
flatten([1, [2, 3], [4, [5]]]); // [1, 2, 3, 4, 5]
```

<details>
<summary>Решение</summary>

```ts
type NestedArray<T> = Array<T | NestedArray<T>>;

function flatten<T>(arr: NestedArray<T>): T[] {
  return arr.reduce<T[]>((acc, item) => {
    return Array.isArray(item)
      ? acc.concat(flatten(item))
      : acc.concat(item as T);
  }, []);
}

// Нативный (ES2019+)
// arr.flat(Infinity)
```

**Ключевые моменты:**

- Рекурсивный тип `NestedArray<T>` описывает массив произвольной вложенности
- `Array.isArray` — единственный надёжный способ проверить массив
- На собесе ожидают рекурсивное решение, не `flat(Infinity)`

</details>

### 19. Мемоизация

Реализовать `memoize(fn)` — кэширует результаты вызовов функции по аргументам.

```ts
const expensiveCalc = memoize((n: number) => {
  console.log("computing...");
  return n * n;
});

expensiveCalc(4); // 'computing...' → 16
expensiveCalc(4); // (из кэша) → 16
expensiveCalc(5); // 'computing...' → 25
```

<details>
<summary>Решение</summary>

```ts
function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}
```

**Ключевые моменты:**

- `JSON.stringify(args)` — простой ключ для нескольких аргументов; не работает с функциями, `undefined`, циклическими ссылками — на собесе это нормально упомянуть
- `Map` лучше объекта для кэша: ключи любого типа, нет коллизий с `__proto__`
- `Parameters<T>` и `ReturnType<T>` — сохраняем типы исходной функции

</details>

### 20. deepEqual

Реализовать `deepEqual(a, b)` — глубокое сравнение двух значений.

```ts
deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
deepEqual([1, [2, 3]], [1, [2, 3]]); // true
deepEqual({ a: 1 }, { a: 2 }); // false
deepEqual(null, null); // true
```

<details>
<summary>Решение</summary>

```ts
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      )
    )
      return false;
  }

  return true;
}
```

**Ключевые моменты:**

- `a === b` — покрывает примитивы и одинаковые ссылки на объекты
- `typeof null === 'object'` — нужна отдельная проверка на `null`
- `unknown` вместо `any` — безопаснее, заставляет сужать тип перед использованием

</details>

---

## React

### 21. Найди причину лишних ререндеров

Компонент `List` тормозит. Найдите проблему и исправьте.

```tsx
const ThemeContext = createContext<{ theme: string; lang: string } | null>(
  null,
);

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeContext.Provider value={{ theme: "dark", lang: "ru" }}>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <List />
    </ThemeContext.Provider>
  );
}

const List = React.memo(() => {
  const ctx = useContext(ThemeContext);
  return <div>{ctx?.theme}</div>;
});
```

<details>
<summary>Ответ</summary>

**Проблема:** при каждом рендере `App` создаётся **новый объект** `{ theme: 'dark', lang: 'ru' }`. `ThemeContext.Provider` получает новую ссылку → все потребители контекста перерендериваются, включая `List`. `React.memo` не помогает — он проверяет только пропсы, а не контекст.

**Решение — стабилизировать значение контекста через `useMemo`:**

```tsx
function App() {
  const [count, setCount] = useState(0);
  const theme = useMemo(() => ({ theme: "dark", lang: "ru" }), []);

  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <List />
    </ThemeContext.Provider>
  );
}
```

Или разделить контекст — отдельный для темы, отдельный для счётчика.

</details>

### 22. Реализовать usePrevious

Реализовать хук `usePrevious<T>(value: T)` — возвращает предыдущее значение переменной.

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);

  return (
    <p>
      Сейчас: {count}, до: {prev}
    </p>
  );
}
```

<details>
<summary>Решение</summary>

```ts
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }); // без зависимостей — запускается после каждого рендера

  return ref.current;
}
```

**Ключевые моменты:**

- `useRef` хранит значение между рендерами без вызова перерендера
- `useEffect` без зависимостей запускается **после** рендера — `ref.current` обновляется уже когда компонент отрисовался
- Поэтому во время текущего рендера `ref.current` ещё содержит предыдущее значение — именно это нам нужно

</details>

### 23. Реализовать useWindowSize

Реализовать хук `useWindowSize()` — возвращает актуальные размеры окна и обновляется при resize.

```tsx
function Component() {
  const { width, height } = useWindowSize();
  return (
    <p>
      {width} x {height}
    </p>
  );
}
```

<details>
<summary>Решение</summary>

```ts
interface WindowSize {
  width: number;
  height: number;
}

function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return size;
}
```

**Ключевые моменты:**

- `[]` — подписываемся один раз при монтировании
- Функция очистки убирает listener при размонтировании — иначе утечка памяти
- На собесе могут попросить добавить debounce к `handler` — resize стреляет очень часто

</details>

---

## Найди баг

### 24. Race condition в useEffect

```tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => setUser(data));
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

<details>
<summary>Ответ</summary>

**Проблема:** если `userId` меняется быстро (например, пользователь кликает по списку), два запроса уходят одновременно. Более медленный может вернуться позже более быстрого → на экране окажутся данные не того пользователя.

**Решение — AbortController:**

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then((data: { name: string }) => setUser(data))
    .catch((err: Error) => {
      if (err.name !== "AbortError") throw err;
    });

  return () => controller.abort();
}, [userId]);
```

При смене `userId` React вызывает cleanup — предыдущий запрос отменяется, и его результат не попадёт в state.

</details>

### 25. Stale closure в setInterval

```tsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
```

<details>
<summary>Ответ</summary>

**Проблема:** `count` в замыкании захвачен при монтировании и всегда равен `0`. Таймер каждую секунду делает `setCount(0 + 1)` — счётчик навсегда застрянет на `1`.

**Решение — функциональное обновление:**

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1); // c — всегда актуальное значение из очереди React
  }, 1000);
  return () => clearInterval(id);
}, []);
```

Функциональная форма `setState` не замыкает конкретное значение — React передаёт актуальный state в момент применения обновления.

</details>

---
