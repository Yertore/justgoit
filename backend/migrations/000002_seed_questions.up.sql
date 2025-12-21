INSERT INTO questions (title, answer, level, category, popularity)
VALUES
(
  'Что такое goroutine?',
  'Goroutine — это лёгкий поток выполнения, управляемый Go runtime.',
  'junior',
  'concurrency',
  95
),
(
  'Чем goroutine отличается от thread?',
  'Goroutine легче, их тысячи, управляются планировщиком Go, а не ОС.',
  'junior',
  'concurrency',
  90
),
(
  'Что такое channel?',
  'Channel — это типизированный канал для безопасного обмена данными между goroutine.',
  'junior',
  'concurrency',
  92
),
(
  'Как работает garbage collector в Go?',
  'Go использует трицветный mark-and-sweep GC с concurrent marking.',
  'middle',
  'memory',
  85
),
(
  'Что такое escape analysis?',
  'Механизм, определяющий, будет ли переменная размещена в heap или stack.',
  'middle',
  'memory',
  80
),
(
  'Что такое context.Context?',
  'Context используется для управления временем жизни запросов, отменой и дедлайнами.',
  'middle',
  'stdlib',
  88
),
(
  'Как работает scheduler в Go?',
  'Scheduler использует модель GMP (Goroutine, Machine, Processor).',
  'senior',
  'runtime',
  75
);
