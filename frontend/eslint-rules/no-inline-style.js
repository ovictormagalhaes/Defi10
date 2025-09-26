/**
 * Custom rule: no-inline-style
 * Flags usage of JSX attribute `style={...}` to encourage utility classes / design tokens.
 * Options: [{ allow: string[] }] where allow are component names allowed to use inline styles.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow inline style attribute in JSX except whitelisted components',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noInline:
        'Avoid inline style attribute. Move styles to CSS utility classes or tokens. Component: {{component}}',
    },
  },
  create(context) {
    const option = context.options[0] || {};
    const allow = new Set(option.allow || []);

    function getJsxName(node) {
      if (!node || !node.name) return 'Unknown';
      if (node.name.type === 'JSXIdentifier') return node.name.name;
      if (node.name.type === 'JSXMemberExpression') return node.name.property.name;
      return 'Unknown';
    }

    return {
      JSXOpeningElement(node) {
        const componentName = getJsxName(node);
        if (allow.has(componentName)) return;
        const styleAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'style'
        );
        if (styleAttr) {
          context.report({
            node: styleAttr,
            messageId: 'noInline',
            data: { component: componentName },
          });
        }
      },
    };
  },
};
