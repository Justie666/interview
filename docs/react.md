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
