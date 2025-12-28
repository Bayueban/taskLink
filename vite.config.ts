import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果您的 GitHub 仓库名称不是 'todolist'，请将下面的路径改为 '/您的仓库名/'
  // 例如：如果仓库名是 'my-todo-app'，则改为 base: '/my-todo-app/'
  base: '/todolist/',
})

