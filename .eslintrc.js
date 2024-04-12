module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    chrome: "readonly",
  },
  plugins: [
    "react",
    "import",
    "jsx-a11y",
    "react-hooks",
    "prettier",
    "@typescript-eslint",
  ],
  rules: {
    "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],
    "react/react-in-jsx-scope": "off",
    "react/jsx-no-bind": "off",
    "react/no-array-index-key": "warn",
    "no-unused-vars": "warn",
    "no-console": "off",
    "func-names": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/require-default-props": "off",
    "react/jsx-props-no-spreading": "warn",
    "prettier/prettier": "warn",
    "no-use-before-define": "off",
    "import/no-extraneous-dependencies": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "no-shadow": "off",
    "no-restricted-globals": "off",
    "default-case": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-plusplus": "off",
    "no-param-reassign": ["error", { props: false }],
    "no-restricted-syntax": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
