# TypeScript

## 1. Что такое TypeScript?

**TypeScript** — типизированное надмножество JavaScript от Microsoft. Компилируется в обычный JavaScript. Добавляет статическую типизацию, интерфейсы, дженерики и другие возможности.

```ts
// Ошибка находится на этапе компиляции, а не в рантайме
function add(a: number, b: number): number {
  return a + b;
}
add('2', 3); // Error: Argument of type 'string' is not assignable to 'number'

// Интерфейсы
interface User {
  id: number;
  name: string;
  email?: string; // опциональное поле
}

// Дженерики
function identity<T>(value: T): T {
  return value;
}
```

**Преимущества:** ошибки на этапе компиляции, лучший IntelliSense, самодокументируемый код, безопасный рефакторинг.

---

## 2. Что такое типы any и unknown в TypeScript?

`any` — отключает проверку типов, можно делать что угодно без ошибок компилятора.

```ts
let x: any = 5;
x.foo(); // не ошибка компилятора — но упадёт в рантайме
```

`unknown` — типобезопасная альтернатива. Нельзя выполнять операции без предварительного сужения типа.

```ts
let y: unknown = 5;
y.foo(); // Ошибка компилятора!
if (typeof y === 'string') { y.toUpperCase(); } // OK
```

Предпочитайте `unknown` вместо `any` — он заставляет явно проверить тип перед использованием.

---
