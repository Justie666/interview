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

## 3. В чём разница между interface и type?

Оба описывают форму объекта, но имеют различия.

```ts
// interface — расширяется через extends и declaration merging
interface User { id: number; name: string; }
interface Admin extends User { role: string; }

// type — через пересечение &
type User = { id: number; name: string };
type Admin = User & { role: string };
```

| | `interface` | `type` |
| --- | --- | --- |
| Declaration merging | Да (можно дополнить) | Нет |
| Объединение `\|` | Нет | Да |
| Примитивы, тьюплы | Нет | Да |
| `extends` | Да | `&` |

```ts
// Только type может описать union и tuple
type ID = string | number;
type Point = [number, number];

// Declaration merging — добавление методов к существующему interface
interface Window { myPlugin: () => void; }
```

**Рекомендация:** используйте `interface` для публичных API и объектов, `type` для union-типов, примитивов и сложных преобразований.

---

## 4. Что такое дженерики (Generics) в TypeScript?

**Дженерики** — параметры типов, позволяющие писать переиспользуемый типобезопасный код.

```ts
// Без дженериков — теряем тип или дублируем код
function identity(value: any): any { return value; }

// С дженериком — тип сохраняется
function identity<T>(value: T): T { return value; }
identity<string>('hello'); // тип: string
identity(42);              // TypeScript выведет тип сам: number

// Дженерик с ограничением
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}
getLength('hello'); // OK
getLength([1, 2]);  // OK
getLength(42);      // Error: number не имеет length

// Дженерик-компонент React
function List<T extends { id: number }>({ items }: { items: T[] }) {
  return items.map(item => <div key={item.id}>{JSON.stringify(item)}</div>);
}
```

Дженерики используются в типах функций, классов, интерфейсов, и утилитарных типах.

---

## 5. Что такое утилитарные типы в TypeScript?

TypeScript предоставляет встроенные утилитарные типы для трансформации существующих типов.

```ts
interface User { id: number; name: string; email: string; age: number; }

// Partial — все поля опциональные
type UpdateUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }

// Required — все поля обязательные
type StrictUser = Required<Partial<User>>;

// Pick — выбрать поля
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit — исключить поля
type UserWithoutId = Omit<User, 'id'>;
// { name: string; email: string; age: number }

// Record — словарь
type RoleMap = Record<'admin' | 'user' | 'guest', User[]>;

// ReturnType — тип возвращаемого значения функции
function createUser() { return { id: 1, name: 'Alex' }; }
type CreatedUser = ReturnType<typeof createUser>;
// { id: number; name: string }

// Readonly — запрещает мутацию
type ImmutableUser = Readonly<User>;

// NonNullable — убирает null и undefined
type SafeId = NonNullable<string | null | undefined>; // string
```

---

## 6. Что такое type guards (сужение типов)?

**Type guard** — выражение, которое сужает тип переменной в определённом блоке кода.

```ts
// typeof — для примитивов
function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase(); // value: string
  }
  return value.toFixed(2); // value: number
}

// instanceof — для классов
function handle(event: MouseEvent | KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    console.log(event.key); // только у KeyboardEvent
  }
}

// in — проверка наличия свойства
type Cat = { meow: () => void };
type Dog = { bark: () => void };

function makeSound(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow(); // animal: Cat
  } else {
    animal.bark(); // animal: Dog
  }
}

// Кастомный type guard (предикат типа)
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

---

## 7. Что такое Discriminated Unions?

**Discriminated Union** (размеченное объединение) — паттерн, при котором у всех членов union есть общее поле-«маркер» (`discriminant`), по которому TypeScript сужает тип.

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // shape: { kind: 'circle', radius }
    case 'rect':
      return shape.width * shape.height;   // shape: { kind: 'rect', ... }
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}
```

**Exhaustiveness check** — TypeScript предупредит, если вы забыли обработать случай:

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    // Если забыть остальные — TypeScript ошибка: не все пути возвращают значение
    default:
      const _exhaustive: never = shape; // Error, если не все случаи обработаны
      throw new Error('Unknown shape');
  }
}
```

---

## 8. Что такое Conditional Types и infer?

**Conditional Types** — типы, которые выбираются по условию.

```ts
type IsString<T> = T extends string ? 'yes' : 'no';
type A = IsString<string>; // 'yes'
type B = IsString<number>; // 'no'
```

**`infer`** — извлечение типа внутри условного типа:

```ts
// Извлечь тип аргумента функции
type Param<T> = T extends (arg: infer P) => any ? P : never;
type P = Param<(x: string) => void>; // string

// Извлечь тип элемента массива
type Unarray<T> = T extends (infer U)[] ? U : T;
type El = Unarray<string[]>; // string

// Извлечь тип из Promise
type Awaited<T> = T extends Promise<infer R> ? R : T;
type R = Awaited<Promise<number>>; // number (встроен в TS 4.5+)
```

Conditional Types мощны в комбинации с mapped types и используются в библиотеках (zod, trpc, prisma).

---

## 9. Как работают Enums в TypeScript и когда их избегать?

**Enum** — именованный набор констант.

```ts
// Числовой enum (значения по умолчанию — числа)
enum Direction { Up, Down, Left, Right }
Direction.Up    // 0
Direction[0]    // 'Up' (обратное отображение)

// Строковый enum — предпочтительный
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
}

function updateUser(status: Status) { /* ... */ }
updateUser(Status.Active); // OK
updateUser('ACTIVE');      // Error
```

**Проблемы с enum:**
- Числовые enum допускают любое число: `Direction.Up = 999` — нет ошибки
- Добавляют runtime-код в JS (в отличие от `type`)

**Альтернатива — `const` объект + `typeof`:**

```ts
const STATUS = { Active: 'ACTIVE', Inactive: 'INACTIVE' } as const;
type Status = typeof STATUS[keyof typeof STATUS]; // 'ACTIVE' | 'INACTIVE'
```

---

## 10. Как работают keyof, typeof и mapped types?

**`keyof`** — возвращает union ключей типа/интерфейса:

```ts
interface User { id: number; name: string; age: number; }
type UserKeys = keyof User; // 'id' | 'name' | 'age'

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // типобезопасный доступ
}
```

**`typeof`** — получает тип значения (переменной/функции) на уровне типов:

```ts
const config = { host: 'localhost', port: 3000 };
type Config = typeof config; // { host: string; port: number }
```

**Mapped Types** — трансформируют все поля типа по шаблону:

```ts
// Реализация Readonly вручную
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Сделать все поля nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// Изменить тип всех полей
type Stringified<T> = {
  [K in keyof T]: string;
};
```

---
