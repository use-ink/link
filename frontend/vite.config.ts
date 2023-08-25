// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsConfigPaths(), eslintPlugin(), svgr(), nodePolyfills()],

  server: { port: 8081 },
  build: {
    minify: false, // solves vite [WARNING] Expected ";" [css-syntax-error]
    target: 'esnext',
    rollupOptions: {
      output: {
        dir: './build',
      },
    },
  },
});
