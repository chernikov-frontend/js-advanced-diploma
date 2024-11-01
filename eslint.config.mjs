import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.browser, // Определение глобальных переменных для браузера
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module', // Разрешение на использование import/export
      },
    },
  },
  pluginJs.configs.recommended,
];


// import globals from "globals";
// import pluginJs from "@eslint/js";


// export default [
//   {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
// ];  - дефолтный вариант не работает 

