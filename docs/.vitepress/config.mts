import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "JS & React Interview",
  description: "Шпаргалка по топовым вопросам интервью",
  base: '/interview/', // замени 'interview' на имя своего репозитория
  themeConfig: {
    nav: [
      { text: 'Главная', link: '/' },
      { text: 'JavaScript', link: '/js' },
      { text: 'React', link: '/react' },
      { text: 'TypeScript', link: '/typescript' },
      { text: 'Browser', link: '/browser' },
      { text: 'CSS', link: '/css' },
      { text: 'Задачи', link: '/tasks' },
    ],

    sidebar: [
      {
        text: 'Разделы',
        items: [
          { text: 'JavaScript Core', link: '/js' },
          { text: 'React', link: '/react' },
          { text: 'TypeScript', link: '/typescript' },
          { text: 'Browser & Network', link: '/browser' },
          { text: 'CSS', link: '/css' },
          { text: 'Практические задачи', link: '/tasks' },
        ]
      }
    ],

    socialLinks: [],

    search: {
      provider: 'local'
    },

    outline: {
      label: 'На странице',
      level: [2, 3]
    }
  }
})
