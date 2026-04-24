const neostandard = require("neostandard");
const mocha = require("eslint-plugin-mocha").default;

module.exports = [
    { ignores: ["dist/**"] },
    ...neostandard({ semi: true }),
    mocha.configs.recommended,
    {
        languageOptions: {
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
    },
    {
        files: ["src/**/*.js"],
        languageOptions: { ecmaVersion: 5 }
    },
    {
        files: ["test/**/*.js"],
        languageOptions: { ecmaVersion: "latest" }
    }
];
