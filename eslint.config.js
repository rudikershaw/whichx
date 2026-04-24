const neostandard = require("neostandard");
const mocha = require("eslint-plugin-mocha").default;

module.exports = [
    ...neostandard({ semi: true }),
    mocha.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2015,
            sourceType: "commonjs",
            globals: {
                browser: "readonly"
            }
        },
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/space-before-function-paren": ["error", "never"],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "no-var": "off",
            "mocha/consistent-spacing-between-blocks": "off"
        }
    }
];
