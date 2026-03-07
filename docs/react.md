# React

## 1. Как избежать лишних перерендеров в React?

- **`React.memo`** — мемоизирует компонент; перерендер только при изменении пропсов
- **`useMemo`** — кэширует вычисленное значение между рендерами
- **`useCallback`** — кэширует функцию, возвращает стабильную ссылку
- **Правильная декомпозиция** — изолировать часто меняющееся состояние в отдельный компонент
- **Не создавать объекты/массивы прямо в JSX** — каждый рендер создаёт новую ссылку
- **`useReducer`** вместо нескольких `useState` для связанного состояния
- **`key`** — правильные ключи в списках предотвращают лишнее размонтирование

```jsx
const Child = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);

function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => console.log('clicked'), []);
  // handleClick — стабильная ссылка, Child не перерендерится
  return <Child onClick={handleClick} />;
}
```

---

## 2. Что такое хуки в React и какие чаще всего используются?

**Хуки** — функции, позволяющие использовать состояние и другие возможности React в функциональных компонентах. Появились в React 16.8.

**Правила:** вызывать только на верхнем уровне (не внутри условий/циклов) и только внутри функциональных компонентов или кастомных хуков.

| Хук | Назначение |
| --- | --- |
| `useState` | Локальное состояние компонента |
| `useEffect` | Сайд-эффекты: запросы, подписки, работа с DOM |
| `useContext` | Доступ к контексту без prop drilling |
| `useRef` | Ссылки на DOM-элементы и мутабельные значения |
| `useMemo` | Кэширование вычисленных значений |
| `useCallback` | Кэширование функций |
| `useReducer` | Сложное состояние (альтернатива useState) |
| `useLayoutEffect` | Синхронный аналог useEffect (до отрисовки) |
| `useId` | Генерация уникальных ID (React 18+) |

---

## 3. Что такое ключ (key) в React и зачем он нужен?

**`key`** — специальный атрибут, помогающий React идентифицировать элементы в списке при алгоритме reconciliation (согласования).

**Зачем:** когда список обновляется, React сравнивает элементы по `key`. Правильный `key` позволяет переиспользовать существующие DOM-узлы вместо их пересоздания.

```jsx
// Плохо — index как key (проблемы при перестановках/удалениях)
items.map((item, i) => <Item key={i} {...item} />);

// Хорошо — стабильный уникальный идентификатор
items.map(item => <Item key={item.id} {...item} />);
```

**Проблемы с `key={index}`:** при удалении/перестановке элементов React перепривязывает данные не к тем узлам → баги с состоянием компонентов (например, в полях ввода).

**Key должен быть:** уникальным среди соседних элементов, стабильным (не меняться между рендерами), предсказуемым.

---

## 4. Как работает жизненный цикл React-компонентов?

**Функциональные компоненты:**

```jsx
useEffect(() => {
  // componentDidMount + componentDidUpdate
  const sub = subscribe();

  return () => sub.unsubscribe(); // componentWillUnmount / cleanup
}, [dependency]); // [] = только монтирование
```

**Порядок:**
1. **Монтирование:** рендер → DOM обновлён → `useLayoutEffect` → `useEffect`
2. **Обновление:** рендер → DOM обновлён → `useLayoutEffect` (cleanup + run) → `useEffect` (cleanup + run)
3. **Размонтирование:** `useLayoutEffect` cleanup → `useEffect` cleanup

**Классовые компоненты:**
- Монтирование: `constructor` → `render` → `componentDidMount`
- Обновление: `render` → `componentDidUpdate`
- Удаление: `componentWillUnmount`

---

## 5. Как работает useRef и для чего используется?

`useRef` возвращает объект `{ current: ... }`, который сохраняется между рендерами и **не вызывает перерендер** при изменении.

**1. Доступ к DOM-элементу:**

```jsx
const inputRef = useRef(null);
useEffect(() => { inputRef.current.focus(); }, []);
return <input ref={inputRef} />;
```

**2. Хранение мутабельных значений (таймеры, предыдущие значения):**

```jsx
const timerRef = useRef(null);
const start = () => { timerRef.current = setInterval(tick, 1000); };
const stop = () => clearInterval(timerRef.current);
```

**3. Сохранение предыдущего значения:**

```jsx
const prevCount = useRef();
useEffect(() => { prevCount.current = count; });
// prevCount.current — значение с прошлого рендера
```

**Ключевое отличие от `useState`:** изменение `ref.current` не вызывает перерендер.

---

## 6. В чём отличие useEffect от useLayoutEffect?

|  | `useEffect` | `useLayoutEffect` |
| --- | --- | --- |
| Когда запускается | После отрисовки браузером | После обновления DOM, до отрисовки |
| Блокирует отрисовку | Нет (асинхронный) | Да (синхронный) |
| Применение | Запросы, подписки, аналитика | Чтение/изменение размеров DOM |

```jsx
// useLayoutEffect — когда нужно избежать "мигания" UI
useLayoutEffect(() => {
  const height = ref.current.offsetHeight;
  ref.current.style.marginTop = `-${height / 2}px`;
}, []);
```

**Правило:** всегда начинайте с `useEffect`. Переходите на `useLayoutEffect` только при видимых визуальных артефактах.

---

## 7. В чём разница функциональных и классовых компонентов?

|  | Функциональные | Классовые |
| --- | --- | --- |
| Синтаксис | Функция | `class extends React.Component` |
| Состояние | `useState` | `this.state` |
| Жизненный цикл | Хуки (`useEffect` и др.) | `componentDidMount`, `componentDidUpdate`… |
| `this` | Не нужен | Требуется везде |
| Boilerplate | Минимальный | Больше кода |
| Производительность | Немного лучше | Немного хуже |

```jsx
// Классовый
class Counter extends React.Component {
  state = { count: 0 };
  render() {
    return <button onClick={() => this.setState({ count: this.state.count + 1 })}>
      {this.state.count}
    </button>;
  }
}

// Функциональный
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Сейчас:** функциональные компоненты — стандарт. Классовые используются только в legacy-коде.

---

## 8. Что делает useEffect и как работает функция очистки?

`useEffect` выполняет сайд-эффекты после рендера: запросы к API, подписки, работа с DOM, таймеры.

```jsx
useEffect(() => {
  // Выполняется после рендера
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(r => r.json())
    .then(setData);

  // Функция очистки — вызывается перед следующим запуском
  // и перед размонтированием компонента
  return () => {
    controller.abort(); // отменяем запрос
  };
}, [id]); // перезапускается при изменении id
```

**Зависимости:**
- `[]` — только при монтировании (и очистка при размонтировании)
- `[a, b]` — при монтировании и при изменении `a` или `b`
- без массива — после каждого рендера

**Функция очистки используется для:** отмены запросов, отписки от событий, очистки таймеров, закрытия WebSocket-соединений.

---

## 9. Для чего используется React и почему его выбирают?

**React** — JavaScript-библиотека для построения пользовательских интерфейсов, разработана Meta.

**Ключевые концепции:**
- **Компонентный подход** — UI разбивается на независимые переиспользуемые компоненты
- **Virtual DOM** — React сравнивает виртуальный DOM с реальным и делает минимальные обновления
- **Декларативность** — описываете, как должен выглядеть UI, React решает как это отрисовать
- **Однонаправленный поток данных** — данные текут сверху вниз через пропсы

**Почему выбирают:**
- Большая экосистема (Next.js, React Native, тысячи библиотек)
- Огромное сообщество и рынок труда
- Гибкость — не навязывает архитектуру
- React Native — переиспользование логики для мобильных приложений
- Активная поддержка и развитие (React 18: Concurrent Mode, Suspense, Server Components)

```jsx
// Компонент = функция, возвращающая JSX
function Welcome({ name }) {
  const [liked, setLiked] = useState(false);
  return (
    <div>
      <h1>Привет, {name}!</h1>
      <button onClick={() => setLiked(l => !l)}>
        {liked ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

---

## 10. Как работают useMemo и useCallback для оптимизации React?

`useMemo` — кэширует результат вычисления, пересчитывает только при изменении зависимостей.

```js
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.price - b.price);
}, [items]);
```

`useCallback` — кэширует функцию, возвращает стабильную ссылку между рендерами.

```js
const handleSubmit = useCallback((data) => {
  api.submit(data);
}, []);
```

Используйте `useMemo` для тяжёлых вычислений и объектов/массивов передаваемых в `memo`-компоненты. `useCallback` — для функций-пропсов `memo`-компонентов и зависимостей `useEffect`. Не злоупотребляйте — мемоизация сама имеет стоимость.

---

## 11. Что такое Context API и когда его использовать?

**Context API** — механизм передачи данных вниз по дереву компонентов без prop drilling.

```jsx
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}

function Button() {
  const { theme } = useContext(ThemeContext); // читаем из любого места дерева
  return <button className={theme}>Click</button>;
}
```

**Когда использовать:** глобальные данные (тема, язык, текущий пользователь, auth-токен).

**Когда не использовать:** часто меняющиеся данные (каждое изменение контекста перерендерит всех потребителей). Для высокочастотных обновлений — Zustand, Redux или разбиение на несколько контекстов.

**Оптимизация:** разделяйте контекст на «состояние» и «действия» — подписчики экшенов не будут рендериться при изменении данных.

---

## 12. Как работает алгоритм Reconciliation (согласования)?

**Reconciliation** — процесс, при котором React сравнивает новый Virtual DOM со старым и минимально обновляет реальный DOM.

**Алгоритм (Diffing):**
1. Если типы элементов разные (`div` → `span`) — дерево пересоздаётся полностью
2. Если типы одинаковые — обновляются только изменившиеся атрибуты/пропсы
3. Для списков — используется `key` для сопоставления элементов

```jsx
// React видит одинаковый тип — только обновит className
// Было: <div className="old" />
// Стало: <div className="new" />

// Тип изменился — полное пересоздание (состояние сброшено)
// Было: <Counter />
// Стало: <input />
```

**React Fiber** (с React 16) — перезаписанный движок reconciliation. Позволяет прерывать рендеринг (Concurrent Mode), расставлять приоритеты задач, реализует `Suspense`, `useTransition`.

---

## 13. Что такое Error Boundaries?

**Error Boundary** — компонент-класс, перехватывающий ошибки JavaScript в дереве дочерних компонентов и показывающий fallback UI вместо краша.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Что-то пошло не так.</h2>;
    }
    return this.props.children;
  }
}

// Использование:
<ErrorBoundary>
  <FeatureComponent />
</ErrorBoundary>
```

**Важно:** Error Boundaries не ловят ошибки в:
- обработчиках событий (используйте `try/catch`)
- асинхронном коде (`setTimeout`, промисах)
- серверном рендеринге
- самом Error Boundary

В React 19 появится хук `use(ErrorBoundary)` как альтернатива.

---

## 14. Как работают React.lazy и Suspense?

**React.lazy** + **Suspense** — механизм code splitting на уровне компонентов. Компонент загружается только когда он нужен (lazy loading).

```jsx
import { lazy, Suspense } from 'react';

// Компонент загружается только при первом рендере
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

**Как работает:**
1. `lazy()` возвращает специальный компонент, который при рендере «бросает» Promise
2. Ближайший `<Suspense>` перехватывает этот Promise и показывает `fallback`
3. Когда Promise резолвится (чанк загружен) — рендерится настоящий компонент

**Suspense для данных (React 18+):** работает с библиотеками (React Query, SWR, Relay) через те же механизмы.

```jsx
// Роутинг с lazy loading — стандартный паттерн
const routes = [
  { path: '/profile', component: lazy(() => import('./pages/Profile')) },
  { path: '/settings', component: lazy(() => import('./pages/Settings')) },
];
```

---

## 15. Что такое React Portal?

**Portal** — способ отрендерить дочерний компонент в DOM-узел вне иерархии родителя, сохраняя при этом контекст React (события всплывают по React-дереву, не DOM-дереву).

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body // рендерим в body, а не в текущий контейнер
  );
}

// Использование:
function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Открыть</button>
      {open && <Modal onClose={() => setOpen(false)}>Контент</Modal>}
    </>
  );
}
```

**Типичное применение:** модальные окна, тосты/уведомления, тултипы, выпадающие меню — всё, что должно быть поверх остального контента (z-index, overflow: hidden).

---

## 16. Как создавать кастомные хуки?

**Кастомный хук** — функция с именем на `use`, внутри которой используются другие хуки. Позволяет переиспользовать логику между компонентами.

```jsx
// useLocalStorage — синхронизация state с localStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
}

// useFetch — универсальный хук для запросов
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(setData)
      .catch(e => !controller.signal.aborted && setError(e))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// Использование:
const { data: user, loading } = useFetch('/api/user');
```

**Правила:** имя начинается с `use`, соблюдает правила хуков, не возвращает JSX.

---

## 17. Что такое React.memo и когда его использовать?

**`React.memo`** — HOC (компонент высшего порядка), который мемоизирует компонент: пропускает повторный рендер, если пропсы не изменились (поверхностное сравнение).

```jsx
// Без memo — перерендеривается каждый раз при рендере Parent
function Child({ name }) {
  console.log('render Child');
  return <div>{name}</div>;
}

// С memo — рендерится только при изменении name
const Child = React.memo(function Child({ name }) {
  console.log('render Child');
  return <div>{name}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child name="Alex" /> {/* не перерендерится при клике */}
    </>
  );
}
```

**Кастомная функция сравнения:**

```jsx
const Child = React.memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
  // true — пропустить рендер, false — рендерить
);
```

**Когда использовать:** компонент рендерится часто, получает стабильные пропсы, рендеринг дорогостоящий. В связке с `useCallback` для стабилизации функций-пропсов.

**Когда не использовать:** простые компоненты (проверка дороже рендера), пропсы меняются при каждом рендере, компонент и так рендерится редко.

---

## 18. Что такое Virtual DOM и как он работает?

**Virtual DOM** — лёгкое JavaScript-представление реального DOM в виде дерева объектов. React работает с ним вместо прямого манипулирования DOM.

**Процесс обновления:**

```
1. Состояние изменилось (setState)
         ↓
2. React создаёт новый Virtual DOM
         ↓
3. Diffing: сравнивает новый VDOM со старым (O(n) алгоритм)
         ↓
4. Reconciliation: вычисляет минимальный набор изменений
         ↓
5. Commit: применяет изменения к реальному DOM
```

```jsx
// JSX компилируется в React.createElement — это и есть VDOM-нода
const element = <div className="box">Hello</div>;
// Превращается в:
const element = React.createElement('div', { className: 'box' }, 'Hello');
// Что создаёт объект:
// { type: 'div', props: { className: 'box', children: 'Hello' } }
```

**Почему это быстро:**
- Операции с JS-объектами быстрее DOM-операций
- Пакетирование обновлений (batching) — несколько `setState` → один рендер
- Минимальные изменения DOM вместо перерисовки всего

**React Fiber** (React 16+) — перезаписанный алгоритм: может прерывать работу, расставлять приоритеты, поддерживает Concurrent Mode.

---

## 19. Что такое Redux и как он устроен?

**Redux** — библиотека управления глобальным состоянием. Основана на паттерне Flux: однонаправленный поток данных.

**Три принципа:**
1. **Single source of truth** — весь стейт в одном Store
2. **State is read-only** — изменить стейт можно только через Action
3. **Changes via pure functions** — Reducer — чистая функция `(state, action) => newState`

```js
// Action — описание события
const increment = () => ({ type: 'counter/increment' });
const addTodo = (text) => ({ type: 'todos/add', payload: text });

// Reducer — чистая функция, вычисляет новое состояние
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'counter/increment': return state + 1;
    case 'counter/decrement': return state - 1;
    default: return state;
  }
}

// Store
const store = createStore(counterReducer);
store.dispatch(increment());
store.getState(); // 1
```

**Redux Toolkit (RTK)** — современный способ, устраняет boilerplate:

```js
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; }, // RTK использует Immer — мутации OK
    decrement: state => { state.value -= 1; },
  },
});

export const { increment, decrement } = counterSlice.actions;

// В компоненте:
const count = useSelector(state => state.counter.value);
const dispatch = useDispatch();
dispatch(increment());
```

**Поток данных:** `UI → dispatch(action) → reducer → новый store → UI обновился`

**Когда Redux не нужен:** небольшое приложение, локальное состояние, достаточно Context API + `useReducer`.

---

## 20. Что такое React Fiber?

**React Fiber** — переписанный алгоритм reconciliation, введённый в React 16. Разбивает рендеринг на небольшие единицы работы («волокна»), которые можно **прерывать, откладывать и приоритизировать**.

**Проблема до Fiber:** старый Stack Reconciler был полностью синхронным — долгий рендер блокировал главный поток и вызывал «подвисание» UI.

**Что даёт Fiber:**
- **Concurrent Mode** — рендер прерывается, пропускает неважные задачи
- **Приоритеты задач** — пользовательский ввод важнее фоновых обновлений
- **`Suspense`** — умеет «приостанавливать» рендер в ожидании данных
- **`useTransition`** — помечать обновления как «не срочные»

```jsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setFilteredList(heavyFilter(items)); // Fiber откладывает — не блокирует ввод
});

return isPending ? <Spinner /> : <List items={filteredList} />;
```

**Две фазы рендеринга:**
1. **Render phase** (прерываемая) — строит Fiber-дерево, вычисляет изменения
2. **Commit phase** (непрерываемая) — применяет изменения к реальному DOM

---

## 21. Что такое Batching в React?

**Batching** — объединение нескольких `setState` в один рендер для оптимизации.

```jsx
// React 17 — батчинг только внутри React-обработчиков событий
function handleClick() {
  setCount(c => c + 1); // не рендерит
  setFlag(f => !f);     // не рендерит
  // → один рендер в конце
}

// React 17 — НЕ батчилось в setTimeout / промисах
setTimeout(() => {
  setCount(c => c + 1); // рендер!
  setFlag(f => !f);     // ещё рендер!
}, 0);
```

**React 18 — Automatic Batching:** батчинг работает везде автоматически:

```jsx
// React 18 — один рендер в конце, даже в setTimeout и fetch
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // → один рендер
}, 0);

fetch('/api').then(() => {
  setData(d);
  setLoading(false);
  // → один рендер
});
```

Отключить батчинг при необходимости можно через `flushSync`.

---

## 22. Как работает реактивность в React?

React использует **явную реактивность** — в отличие от Vue и MobX, он не отслеживает зависимости автоматически. Перерендер происходит только тогда, когда разработчик явно вызывает `setState` / `dispatch`.

**Механизм:**

```
setState вызван
    ↓
React ставит компонент в очередь на перерендер
    ↓
Вся функция-компонент запускается заново (render phase)
    ↓
React сравнивает новый и старый VDOM (diffing)
    ↓
Применяет минимальные изменения к DOM (commit phase)
```

```jsx
// React НЕ знает о мутации — перерендера не будет!
const [user, setUser] = useState({ name: 'Alex' });
user.name = 'Bob'; // ❌ мутация — React не заметит

// Правильно — новый объект → React видит изменение
setUser({ ...user, name: 'Bob' }); // ✅
```

**Оптимизации реактивности:**
- `React.memo` — пропускает рендер, если пропсы не изменились
- `useMemo` / `useCallback` — стабилизируют значения между рендерами
- `useTransition` / `useDeferredValue` — понижают приоритет обновлений

---

## 23. Что такое flushSync?

**`flushSync`** — функция из `react-dom`, которая форсирует **синхронный рендер немедленно**, обходя батчинг.

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1); // DOM обновится СРАЗУ
  });
  // Здесь DOM уже актуален:
  console.log(ref.current.textContent); // свежее значение

  flushSync(() => {
    setFlag(f => !f); // ещё один синхронный рендер
  });
}
```

**Когда нужен:**
- Нужно прочитать обновлённый DOM сразу после `setState` (размеры, позиции)
- Интеграция с третьесторонними библиотеками, ожидающими синхронного DOM
- Анимации, где важен точный момент обновления

**Предупреждение:** снижает производительность — React не может батчить такие обновления. Используйте только когда реально необходимо.

---

## 24. Что такое Stale Closure в useEffect?

**Stale Closure** («устаревшее замыкание») — баг, когда коллбэк в `useEffect` захватывает **устаревшее значение** переменной из момента создания функции.

```jsx
// Баг: stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count);   // ВСЕГДА 0 — захватил значение при монтировании
      setCount(count + 1);  // ВСЕГДА устанавливает 1
    }, 1000);
    return () => clearInterval(id);
  }, []); // [] — эффект не перезапускается, замыкание «протухает»
}
```

**Три решения:**

```jsx
// 1. Добавить count в зависимости — эффект будет перезапускаться
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, [count]);

// 2. Функциональное обновление — не зависит от замкнутого значения ✅
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);

// 3. useRef — мутабельное значение, всегда актуальное
const countRef = useRef(count);
useEffect(() => { countRef.current = count; });
useEffect(() => {
  const id = setInterval(() => setCount(countRef.current + 1), 1000);
  return () => clearInterval(id);
}, []);
```

**Правило:** если ESLint (`react-hooks/exhaustive-deps`) просит добавить переменную в зависимости — не игнорируйте. Это защита от stale closures.

---

## 25. Почему setState в React — асинхронный?

`setState` не обновляет состояние мгновенно — React **планирует** обновление и применяет его в следующем рендере.

```jsx
function handleClick() {
  setCount(count + 1);
  console.log(count); // 0 — значение не изменилось!
  setCount(count + 1); // тоже +1, не +2 (count всё ещё 0)
  // Итог: count стал 1, а не 2
}
```

**Почему:** React батчит несколько `setState` в один рендер. Если бы `setState` был синхронным — каждый вызов вызывал бы немедленный рендер, что катастрофично для производительности.

**Решение — функциональное обновление** (получает актуальный state, а не замкнутый):

```jsx
setCount(c => c + 1); // c — гарантированно актуальный
setCount(c => c + 1); // c — уже +1 от предыдущей очереди
// Итог: count стал 2 ✅
```

**Прочитать актуальный state сразу** после `setState` — невозможно через переменную. Используйте `useRef` для синхронного доступа или `flushSync` для форсированного рендера.

---

## 26. Что такое useReducer и когда его использовать?

**`useReducer`** — хук для управления состоянием через функцию-редьюсер. Альтернатива `useState` для сложного или взаимосвязанного состояния.

```jsx
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + state.step };
    case 'decrement': return { ...state, count: state.count - state.step };
    case 'setStep':   return { ...state, step: action.payload };
    case 'reset':     return initialState;
    default: throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      <p>Count: {state.count}, Step: {state.step}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'setStep', payload: 5 })}>Step=5</button>
    </>
  );
}
```

**Когда использовать `useReducer` вместо `useState`:**
- Несколько взаимосвязанных полей состояния
- Следующее состояние зависит от предыдущего
- Сложная логика обновлений с условиями
- Хотите тестировать логику отдельно от компонента (reducer — чистая функция)

| | `useState` | `useReducer` |
| --- | --- | --- |
| Сложность состояния | Простое | Сложное / взаимосвязанное |
| Тестируемость | Средняя | Высокая |
| Читаемость при росте | Ухудшается | Централизованная логика |

---

## 27. Что такое MobX и как он работает?

**MobX** — библиотека **реактивного** управления состоянием. Автоматически отслеживает, какие данные используют компоненты, и перерисовывает их при изменении.

**Ключевые концепции:** Observable (данные) → Action (изменение) → Computed (производные) → Reaction (сайд-эффект, рендер).

```js
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this); // автоматически делает всё observable
  }

  increment() { this.count++; }              // action
  get doubled() { return this.count * 2; }  // computed
}

const store = new CounterStore();

// observer — подписывает компонент на используемые observable
const Counter = observer(() => (
  <div>
    <p>{store.count} (x2: {store.doubled})</p>
    <button onClick={() => store.increment()}>+</button>
  </div>
));
```

**Отличие от Redux:** MobX мутирует состояние напрямую (через прокси), Redux требует иммутабельности. MobX — меньше boilerplate, Redux — строже и предсказуемее.

---

## 28. В чём разница Redux, Zustand и MobX?

| | Redux (RTK) | Zustand | MobX |
| --- | --- | --- | --- |
| Парадигма | Flux, иммутабельность | Простой стор | Реактивность, мутации |
| Boilerplate | Средний | Минимальный | Минимальный |
| Размер | ~40 КБ | ~1 КБ | ~16 КБ |
| DevTools | Отличные (time travel) | Хорошие | Хорошие |
| Порог входа | Высокий | Низкий | Средний |
| Когда выбирать | Большие команды, строгая структура | Большинство SPA | OOP-стиль, сложные вычисления |

```js
// Zustand — минимальный boilerplate
import { create } from 'zustand';

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

**Рекомендация:**
- **Zustand** — выбор по умолчанию для большинства React-приложений: просто, быстро, без лишнего кода
- **Redux RTK** — при необходимости строгой структуры, мощных DevTools, большой команды
- **MobX** — при OOP-подходе или сложных вычислительных графах

---

## 29. Что такое Flux-архитектура?

**Flux** — архитектурный паттерн для управления состоянием, разработанный Meta для React. Основная идея — **однонаправленный поток данных**.

**Четыре сущности:**

```
Action → Dispatcher → Store → View → (Action снова)
```

- **Action** — объект, описывающий событие: `{ type: 'ADD_TODO', payload: 'text' }`
- **Dispatcher** — центральный хаб, принимает Actions и рассылает их всем Store
- **Store** — хранит состояние и логику обновления; подписывается на Dispatcher
- **View** — React-компоненты, читают Store, при взаимодействии создают новые Actions

```js
// Action
const addTodo = (text) => ({ type: 'ADD_TODO', payload: text });

// Dispatcher (упрощённо)
dispatcher.dispatch(addTodo('Купить молоко'));

// Store
class TodoStore extends EventEmitter {
  #todos = [];

  handleAction(action) {
    if (action.type === 'ADD_TODO') {
      this.#todos.push(action.payload);
      this.emit('change'); // уведомляем View
    }
  }

  getTodos() { return this.#todos; }
}
```

**Почему однонаправленный поток важен:**
- Состояние предсказуемо — только Actions могут его изменить
- Легко отлаживать — можно воспроизвести любое состояние по цепочке Actions
- Избегает проблем двустороннего связывания (как в AngularJS)

**Redux** — самая популярная реализация Flux. Упростил: один Store вместо многих, reducer вместо Store-классов.

---

## 30. Что такое useTransition и useDeferredValue?

Оба хука позволяют **понизить приоритет** обновления состояния — React будет прерывать его в пользу срочных обновлений (ввод пользователя).

**`useTransition`** — оборачивает setState, получаем флаг `isPending`:

```jsx
const [isPending, startTransition] = useTransition();

function handleSearch(query) {
  setInputValue(query); // срочное — обновляется немедленно

  startTransition(() => {
    setResults(heavyFilter(data, query)); // не срочное — React может отложить
  });
}

return (
  <>
    <input value={inputValue} onChange={e => handleSearch(e.target.value)} />
    {isPending ? <Spinner /> : <ResultsList results={results} />}
  </>
);
```

**`useDeferredValue`** — откладывает значение. Нужен когда нет доступа к setState (приходит пропсом):

```jsx
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  // deferredQuery отстаёт от query, пересчитывается с низким приоритетом
  const results = useMemo(() => heavyFilter(data, deferredQuery), [deferredQuery]);

  return <ul>{results.map(r => <li key={r.id}>{r.name}</li>)}</ul>;
}
```

| | `useTransition` | `useDeferredValue` |
| --- | --- | --- |
| Что откладывает | setState-вызов | Значение (пропс или переменную) |
| `isPending` | Да | Нет |
| Когда | Есть доступ к setState | Только входящее значение |

---

## 31. Что такое forwardRef и useImperativeHandle?

**`forwardRef`** — позволяет родителю передать `ref` внутрь дочернего компонента на DOM-элемент.

```jsx
// Без forwardRef — ref указывает на экземпляр компонента, не на input
function Input({ placeholder }) {
  return <input placeholder={placeholder} />;
}

// С forwardRef — ref пробрасывается на внутренний элемент
const Input = forwardRef(function Input({ placeholder }, ref) {
  return <input ref={ref} placeholder={placeholder} />;
});

// Использование
function Form() {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current.focus(); }, []);
  return <Input ref={inputRef} placeholder="Имя" />;
}
```

**`useImperativeHandle`** — ограничивает что именно видит родитель через ref:

```jsx
const Input = forwardRef(function Input(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    // Родитель видит только эти два метода, не весь DOM-элемент
  }));

  return <input ref={inputRef} {...props} />;
});
```

**В React 19** `forwardRef` не нужен — `ref` передаётся как обычный проп:

```jsx
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

---
