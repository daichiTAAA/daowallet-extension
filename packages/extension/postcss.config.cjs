// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
const path = require('path');

module.exports = {
  plugins: {
    autoprefixer: {},
    tailwindcss: {
      config: path.join(__dirname, 'tailwind.config.cjs')
    }
  }
};
