# Практические задачи

Задачи с реальных собеседований. Формат: условие → решение с объяснением.

---

## JS Quiz

### 1. Объекты как ключи

```js
const a = {}, b = {}, c = {}
a[b] = '1'
a[c] = '2'
console.log(a)
```

<details>
<summary>Ответ</summary>

**Вывод:** `{ '[object Object]': '2' }`

Любой объект, используемый как ключ, приводится к строке через `.toString()` → `'[object Object]'`. Оба объекта `b` и `c` дают одинаковый ключ, поэтому второе присваивание перезаписывает первое.

Чтобы использовать объекты как уникальные ключи — используйте `Map`.

</details>

---

### 2. Порядок Event Loop

```js
console.log('1')

setTimeout(() => console.log('2'), 0)
setTimeout(() => console.log('3'), 0)

Promise.resolve()
  .then(() => console.log('4'))
  .then(() => console.log('5'))

console.log('6')
```

<details>
<summary>Ответ</summary>

**Вывод:** `1 → 6 → 4 → 5 → 2 → 3`

1. Синхронный код: `1`, `6`
2. Микрозадачи (Promise.then) полностью: `4`, `5`
3. Макрозадачи по одной: `2`, `3`

Микрозадачи всегда выполняются до следующей макрозадачи.

</details>

---

### 3. Потеря `this` в колбэке

```js
const obj = {
  name: 'Alice',
  friends: ['Bob', 'Charlie'],
  printFriends() {
    this.friends.filter(function(friend) {
      console.log(this.name + ' → ' + friend)
    })
  }
}

obj.printFriends()
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

---

### 4. typeof null

```js
console.log(typeof null)
console.log(typeof undefined)
console.log(typeof [])
console.log(typeof function(){})
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

---

### 5. Приведение типов с ==

```js
console.log([] == ![])
console.log(null == undefined)
console.log(null == 0)
console.log('' == false)
console.log(0 == '0')
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
const emitter = new EventEmitter()

emitter
  .on('data', (x) => console.log('handler 1:', x))
  .on('data', (x) => console.log('handler 2:', x))
  .emit('data', 42)
// handler 1: 42
// handler 2: 42
```

<details>
<summary>Решение</summary>

```js
class EventEmitter {
  constructor() {
    this._handlers = {}
  }

  on(event, fn) {
    if (!this._handlers[event]) {
      this._handlers[event] = []
    }
    this._handlers[event].push(fn)
    return this // chaining
  }

  off(event, fn) {
    if (this._handlers[event]) {
      this._handlers[event] = this._handlers[event].filter(h => h !== fn)
    }
    return this // chaining
  }

  emit(event, ...args) {
    if (this._handlers[event]) {
      this._handlers[event].forEach(fn => fn(...args))
    }
    return this
  }
}
```

**Ключевые моменты:**
- `return this` в каждом методе обеспечивает chaining
- `off` сравнивает по ссылке на функцию — анонимные функции нельзя отписать
- `emit` использует spread для передачи любого числа аргументов

</details>

---

### 7. Debounce

Реализовать функцию `debounce(fn, delay)` — вызывает `fn` только после того, как прошло `delay` мс без новых вызовов.

<details>
<summary>Решение</summary>

```js
function debounce(fn, delay) {
  let timer

  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// Использование:
const onSearch = debounce((query) => {
  fetch(`/search?q=${query}`)
}, 300)

input.addEventListener('input', (e) => onSearch(e.target.value))
```

**Ключевые моменты:**
- `clearTimeout` при каждом вызове сбрасывает таймер
- `fn.apply(this, args)` сохраняет контекст и аргументы
- Замыкание хранит `timer` между вызовами

</details>

---

### 8. Поиск с debounce и AbortController (SWAPI-задача)

Написать React-компонент: поиск персонажей Star Wars через [https://swapi.dev](https://swapi.dev). Требования:
- debounce 300 мс
- отмена предыдущего запроса при новом (AbortController)
- индикатор загрузки

<details>
<summary>Решение</summary>

```jsx
import { useState, useEffect, useRef } from 'react'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function SwapiSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`https://swapi.dev/api/people/?search=${debouncedQuery}`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        setResults(data.results)
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [debouncedQuery])

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Поиск персонажа..."
      />
      {loading && <p>Загрузка...</p>}
      {error && <p>Ошибка: {error}</p>}
      <ul>
        {results.map(p => <li key={p.url}>{p.name}</li>)}
      </ul>
    </div>
  )
}
```

**Почему AbortController важен:** без него старый запрос может вернуться позже нового → race condition → на экране окажутся неверные данные.

</details>

---

### 9. Чек-боксы с двойным кликом — найди баги

В коде ниже несколько ошибок. Найдите и исправьте.

```jsx
function CheckboxList({ items }) {
  const [selected, setSelected] = React.useState([])

  React.useEffect(() => {
    document.addEventListener('dblclick', () => {
      console.log('selected:', selected)
    })
  })

  return (
    <div>
      {items.map((item, i) => (
        <label for={`item-${i}`}>
          <input
            type="checkbox"
            id={`item-${i}`}
            disable={selected.includes(item.id)}
            onChange={() =>
              setSelected(prev =>
                prev.includes(item.id)
                  ? prev.filter(id => id !== item.id)
                  : [...prev, item.id]
              )
            }
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}
```

<details>
<summary>Ответ — список багов</summary>

**1. `useEffect` без массива зависимостей** — подписка на `dblclick` добавляется при каждом рендере, накапливаются дубли обработчиков. Нужны: зависимости `[selected]` и функция очистки:

```jsx
useEffect(() => {
  const handler = () => console.log('selected:', selected)
  document.addEventListener('dblclick', handler)
  return () => document.removeEventListener('dblclick', handler)
}, [selected])
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
