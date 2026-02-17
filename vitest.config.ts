import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.ts', 'tests/api/**/*.axios.{test,spec}.ts'],
    environment: 'node',
  },
});
