# CSS

## 1. Что такое специфичность CSS и как она работает?

**Специфичность** — система приоритетов, определяющая какое CSS-правило применится при конфликте стилей.

**Формула специфичности (a, b, c, d):**

| Тип селектора                                                | Вес            |
| ------------------------------------------------------------ | -------------- |
| `!important`                                                 | Перебивает всё |
| Инлайн-стиль (`style=""`)                                    | (1, 0, 0, 0)   |
| ID (`#id`)                                                   | (0, 1, 0, 0)   |
| Класс (`.class`), псевдокласс (`:hover`), атрибут (`[type]`) | (0, 0, 1, 0)   |
| Тег (`div`), псевдоэлемент (`::before`)                      | (0, 0, 0, 1)   |
| Универсальный (`*`), комбинаторы (`>`, `+`, `~`)             | (0, 0, 0, 0)   |

```css
/* Специфичность (0,0,0,1) */
p {
  color: black;
}

/* Специфичность (0,0,1,0) — побеждает */
.text {
  color: blue;
}

/* Специфичность (0,1,0,0) — побеждает */
#title {
  color: red;
}

/* Специфичность (1,0,0,0) — побеждает */
<p style="color: green">...</p>

/* !important — перебивает всё (включая инлайн) */
p {
  color: purple !important;
}
```

**Сравнение идёт слева направо:**

```css
/* (0,1,1,1) vs (0,0,3,0) — побеждает первый */
#nav .item a {
  color: red;
} /* 0,1,1,1 */
.menu .link.active {
  color: blue;
} /* 0,0,3,0 */
```

**Правила при равной специфичности:** побеждает правило, объявленное **позже** в файле.

**Рекомендации:**

- Избегайте `!important` — создаёт трудноотлаживаемые конфликты
- Держите специфичность низкой — пишите классами, не ID
- БЭМ и CSS-модули решают проблему специфичности за счёт уникальных классов

## 2. Что такое блочная модель (Box Model) в CSS?

Каждый HTML-элемент — прямоугольный блок, состоящий из 4 слоёв (снаружи внутрь):

```
┌──────────────────────────────┐
│           margin             │
│  ┌────────────────────────┐  │
│  │        border          │  │
│  │  ┌──────────────────┐  │  │
│  │  │     padding      │  │  │
│  │  │  ┌────────────┐  │  │  │
│  │  │  │  content   │  │  │  │
│  │  │  └────────────┘  │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**`box-sizing`** — определяет, что входит в `width`/`height`:

```css
/* content-box (по умолчанию) — width = только контент */
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 2px solid;
  /* Реальная ширина: 200 + 20*2 + 2*2 = 244px */
}

/* border-box — width включает padding и border */
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 2px solid;
  /* Реальная ширина: 200px (контент = 200 - 40 - 4 = 156px) */
}

/* Современный стандарт — применять ко всем элементам */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## 3. Что такое Flexbox и когда его использовать?

**Flexbox** — одномерная система вёрстки для выравнивания элементов в строку или столбец.

```css
.container {
  display: flex;
  flex-direction: row; /* row | column | row-reverse */
  justify-content: space-between; /* выравнивание по главной оси */
  align-items: center; /* выравнивание по поперечной оси */
  flex-wrap: wrap; /* перенос при нехватке места */
  gap: 16px; /* отступы между элементами */
}

/* Свойства дочерних элементов */
.item {
  flex: 1; /* flex-grow: 1, flex-shrink: 1, flex-basis: 0 */
  flex-grow: 2; /* занимает в 2 раза больше свободного места */
  flex-shrink: 0; /* не сжимается */
  align-self: flex-start; /* переопределяет align-items для этого элемента */
}
```

**Частые паттерны:**

```css
/* Центрирование */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Прижать footer к низу */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
```

## 4. Что такое CSS Grid?

**CSS Grid** — двумерная система вёрстки: строки и столбцы одновременно.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 равные колонки */
  grid-template-rows: auto 1fr auto;
  gap: 20px;
}

/* Позиционирование элемента */
.header {
  grid-column: 1 / -1; /* растянуть на все колонки */
}

.sidebar {
  grid-row: 2 / 4; /* занять 2 строки */
}
```

**Когда Flexbox, когда Grid:**

|              | Flexbox                                  | Grid                   |
| ------------ | ---------------------------------------- | ---------------------- |
| Направление  | Одно (строка или столбец)                | Оба сразу              |
| Применение   | Навигация, карточки в ряд, центрирование | Сложные макеты страниц |
| Выравнивание | По содержимому                           | По явной сетке         |

**Правило:** Flexbox — для компонентов, Grid — для макета страницы.

## 5. В чём разница position: relative, absolute, fixed, sticky?

```css
/* relative — смещается относительно своего нормального положения,
   остаётся в потоке, создаёт контекст позиционирования */
.relative {
  position: relative;
  top: 10px;
  left: 20px;
}

/* absolute — вырывается из потока, позиционируется относительно
   ближайшего предка с position != static */
.absolute {
  position: absolute;
  top: 0;
  right: 0;
}

/* fixed — вырывается из потока, позиционируется относительно
   viewport, не скроллится */
.fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

/* sticky — гибрид relative и fixed: ведёт себя как relative
   до достижения порога скролла, затем как fixed */
.sticky {
  position: sticky;
  top: 0;
} /* прилипает при скролле */
```

|            | В потоке | Относительно      | Скроллится |
| ---------- | -------- | ----------------- | ---------- |
| `static`   | Да       | —                 | Да         |
| `relative` | Да       | Себя              | Да         |
| `absolute` | Нет      | Предка с position | Да         |
| `fixed`    | Нет      | Viewport          | Нет        |
| `sticky`   | Да       | Предка / viewport | Условно    |

## 6. В чём разница display:none, visibility:hidden и opacity:0?

Все три скрывают элемент визуально, но работают по-разному:

|                         | `display: none`          | `visibility: hidden`           | `opacity: 0`             |
| ----------------------- | ------------------------ | ------------------------------ | ------------------------ |
| Занимает место в потоке | Нет                      | Да                             | Да                       |
| Дочерние элементы       | Скрыты (нельзя показать) | Можно показать через `visible` | Скрыты (нельзя показать) |
| Клики/события           | Нет                      | Нет                            | Да (элемент кликабелен!) |
| Reflow при изменении    | Да                       | Нет                            | Нет                      |
| Анимируемость           | Нет                      | Нет                            | Да (transition работает) |

```css
/* display: none — элемент полностью убран из потока */
.hidden {
  display: none;
}

/* visibility: hidden — место сохраняется, дочерний можно показать */
.invisible {
  visibility: hidden;
}
.invisible .child {
  visibility: visible;
} /* этот дочерний будет виден */

/* opacity: 0 — прозрачный, но кликабельный! */
.transparent {
  opacity: 0;
}
/* Часто используют с pointer-events для отключения кликов */
.transparent {
  opacity: 0;
  pointer-events: none;
}
```

**Когда что использовать:**

- `display: none` — убрать элемент полностью (меню, модалки в DOM)
- `visibility: hidden` — скрыть но сохранить место (skeleton-загрузка)
- `opacity: 0` — анимации появления/исчезновения (fade in/out)

## 7. Что такое CSS Custom Properties (переменные)?

**CSS-переменные** — значения, определённые один раз и переиспользуемые по всему коду. Каскадны и доступны из JS.

```css
/* Объявление — обычно в :root (глобальный scope) */
:root {
  --color-primary: #3b82f6;
  --spacing-md: 16px;
  --border-radius: 8px;
}

/* Использование */
.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

/* Запасное значение */
color: var(--color-text, #333);

/* Переопределение локально */
.card {
  --border-radius: 4px; /* действует только внутри .card */
}
```

**Тёмная тема:**

```css
:root {
  --bg: white;
  --text: black;
}
[data-theme="dark"] {
  --bg: #0f172a;
  --text: white;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

**Доступ из JS:**

```js
// Читать
getComputedStyle(document.documentElement).getPropertyValue("--color-primary");

// Записать
document.documentElement.style.setProperty("--color-primary", "#ef4444");
```

**Отличие от переменных SASS:** CSS-переменные живут в рантайме — их можно изменять динамически. SASS-переменные компилируются в статические значения.

## 8. В чём разница transition и animation?

**`transition`** — плавный переход между двумя состояниями. Запускается при изменении свойства:

```css
.button {
  background: blue;
  transform: scale(1);
  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.button:hover {
  background: darkblue;
  transform: scale(1.05);
}
```

**`animation`** — управляемая анимация через `@keyframes`. Может быть бесконечной, с задержками, реверсом:

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.loader {
  animation: spin 1s linear infinite;
}
.badge {
  animation: pulse 2s ease-in-out 3; /* 3 раза */
}
```

|                         | `transition`                         | `animation`                |
| ----------------------- | ------------------------------------ | -------------------------- |
| Триггер                 | Изменение свойства (`:hover`, класс) | Автоматически или через JS |
| Количество шагов        | 2 (начало → конец)                   | Любое (`@keyframes`)       |
| Повторение              | Нет                                  | `infinite`, n раз          |
| `isPending` / состояние | Нет                                  | `animation-play-state`     |

**Производительность:** анимируйте только `transform` и `opacity` — они не вызывают reflow/repaint и работают на GPU. Избегайте анимации `width`, `height`, `top`, `left`.

## 9. Что такое медиазапросы и адаптивная вёрстка?

**Media queries** — применяют стили при определённых условиях (ширина экрана, тема ОС, ориентация).

**Mobile-first подход** (рекомендуемый) — базовые стили для мобильных, расширяем вверх:

```css
/* Базовые стили — мобильные */
.container {
  padding: 16px;
}

@media (min-width: 768px) {
  /* tablet+ */
  .container {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  /* desktop+ */
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Другие условия */
@media (prefers-color-scheme: dark) {
  /* тёмная тема ОС */
}
@media (prefers-reduced-motion: reduce) {
  /* отключить анимации */
}
@media print {
  .no-print {
    display: none;
  }
}
```

**Современные единицы:**

```css
font-size: 1rem; /* относительно корневого font-size */
padding: 2em; /* относительно font-size элемента */
height: 100dvh; /* dynamic viewport height (учитывает адресную строку) */
font-size: clamp(14px, 2vw, 18px); /* min, preferred, max */
```

**Container queries** — стили по размеру контейнера, а не viewport:

```css
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

## 10. Что такое BEM, CSS Modules и CSS-in-JS?

**BEM (Block Element Modifier)** — методология именования классов для избежания конфликтов:

```css
/* Block — независимый компонент */
.button {
}

/* Element — часть блока (двойное подчёркивание) */
.button__icon {
}
.button__text {
}

/* Modifier — вариант (двойное тире) */
.button--primary {
}
.button--disabled {
}
```

```html
<button class="button button--primary">
  <span class="button__icon">→</span>
  <span class="button__text">Отправить</span>
</button>
```

**CSS Modules** — CSS локален по умолчанию, классы генерируются уникальными при сборке:

```css
/* Button.module.css */
.button {
  background: blue;
}
.primary {
  background: darkblue;
}
```

```jsx
import styles from "./Button.module.css";
<button className={`${styles.button} ${styles.primary}`} />;
// → class="Button_button__x7k2q Button_primary__9mf3a"
```

**CSS-in-JS (styled-components, Emotion)** — стили в JS, полный доступ к пропсам компонента:

```jsx
const Button = styled.button`
  background: ${(props) => (props.primary ? "darkblue" : "white")};
  padding: 8px 16px;
  &:hover {
    opacity: 0.8;
  }
`;
```

|                     | BEM       | CSS Modules      | CSS-in-JS      |
| ------------------- | --------- | ---------------- | -------------- |
| Изоляция            | Конвенция | Автоматическая   | Автоматическая |
| Динамические стили  | Нет       | Ограничена       | Полная (props) |
| Runtime overhead    | Нет       | Нет              | Да             |
| Популярность сейчас | Legacy    | Стандарт в React | Снижается      |

## 11. Что такое z-index и stacking context?

**`z-index`** — управляет порядком наложения элементов по оси Z. Работает только на positioned элементах (`position != static`) и flex/grid-детях.

```css
.modal {
  position: fixed;
  z-index: 1000;
}
.tooltip {
  position: absolute;
  z-index: 100;
}
.header {
  position: sticky;
  z-index: 10;
}
```

**Stacking context (контекст наложения)** — изолированная группа, внутри которой `z-index` работает независимо. Элементы из разных контекстов сравниваются по `z-index` их контекстов, а не их собственному.

**Что создаёт stacking context:**

- `position` + `z-index != auto`
- `opacity < 1`
- `transform`, `filter`, `will-change`
- `isolation: isolate`

```css
/* Классическая ловушка */
.parent {
  position: relative;
  z-index: 1; /* создаёт stacking context */
}

.modal {
  position: fixed;
  z-index: 9999; /* ограничен контекстом .parent!
                    никогда не будет выше элементов снаружи с z-index > 1 */
}
```

```css
/* Решение 1 — React Portal: рендерить модал в document.body */

/* Решение 2 — isolation для явного контекста без z-index */
.card {
  isolation: isolate; /* внутренние z-index не вырываются наружу */
}
```

**Правило отладки:** если `z-index` не работает — проверьте, не находится ли элемент внутри чужого stacking context.

---
