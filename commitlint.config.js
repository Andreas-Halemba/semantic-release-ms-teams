export default {
    extends: ['@commitlint/config-conventional'],
    plugins: ['commitlint-plugin-function-rules'],
    rules: {
        'function-rules/scope-enum': [
            2,
            'always',
            (parsed) => {
                if (!parsed.scope) {
                    return [
                        false,
                        'Scope must not be empty. Please use a valid scope matching a Jira Ticket ID. Example: "feat(IU-123)"',
                    ];
                }
                if (!parsed.scope.match(/[A-Z][A-Z]+-\d+/)) {
                    return [
                        false,
                        `Scope must match a Jira Ticket ID (given scope: "${parsed.scope}"). Example: "feat(IU-123)"`,
                    ];
                }
                return [true];
            },
        ],
    },
};
