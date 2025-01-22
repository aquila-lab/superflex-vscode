/** @type {import('tailwindcss').Config} */

import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '256px',
        sm: '384px',
        md: '512px',
        lg: '640px',
        xl: '896px',
        '2xl': '1024px'
      },
      fontSize: {
        sm: ['13px', '19px'],
        md: ['14px', '20px']
      },
      border: {
        DEFAULT: '1px'
      },
      colors: {
        border: 'var(--vscode-dropdown-border)',
        input: 'var(--vscode-input-background)',
        ring: 'var(--vscode-focusBorder)',
        sidebar: 'var(--vscode-sideBar-background)',
        background: 'var(--vscode-editor-background)',
        foreground: 'var(--vscode-foreground)',
        destructive: {
          DEFAULT: 'var(--vscode-errorForeground)',
          background: 'var(--vscode-errorForeground)',
          foreground: 'var(--vscode-editor-background)'
        },
        button: {
          background: {
            DEFAULT: 'var(--vscode-button-background)',
            hover: 'var(--vscode-button-hoverBackground)'
          },
          foreground: 'var(--vscode-button-foreground)',
          border: 'var(--vscode-button-border, transparent)',
          secondary: {
            background: {
              DEFAULT: 'var(--vscode-button-secondaryBackground)',
              hover: 'var(--vscode-button-secondaryHoverBackground)'
            },
            foreground: 'var(--vscode-button-secondaryForeground)'
          }
        },
        muted: {
          DEFAULT: 'var(--vscode-input-background)',
          transparent: 'color-mix(in lch, currentColor 15%, transparent)',
          foreground: 'var(--vscode-input-placeholderForeground)',
          secondary: {
            foreground: 'var(--vscode-commentsView-resolvedIcon)'
          }
        },
        accent: {
          DEFAULT: 'var(--vscode-button-background)',
          foreground: 'var(--vscode-button-foreground)'
        },
        popover: {
          DEFAULT: 'var(--vscode-quickInput-background)',
          foreground: 'var(--vscode-dropdown-foreground)'
        },
        keybinding: {
          foreground: 'var(--vscode-keybindingLabel-foreground)',
          background: 'var(--vscode-keybindingLabel-background)',
          border: 'var(--vscode-keybindingLabel-border)'
        },
        link: {
          DEFAULT: 'var(--vscode-textLink-foreground)',
          hover: 'var(--vscode-textLink-activeForeground)'
        },
        current: {
          DEFAULT: 'currentColor',
          25: 'color-mix(in lch, currentColor 25%, transparent)'
        },
        badge: {
          border: 'var(--vscode-contrastBorder)',
          foreground: 'var(--vscode-badge-foreground)',
          background: 'var(--vscode-badge-background)'
        },
        combobox: {
          item: {
            selected: 'var(--vscode-editorGutter-addedBackground)'
          }
        }
      },
      borderRadius: {
        lg: '6px',
        md: '4px',
        sm: '2px'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' }
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' }
        },
        gradient: {
          '0%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '100% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '75%': { backgroundPosition: '0% 100%' },
          '100%': { backgroundPosition: '0% 0%' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.15s ease-out',
        'accordion-up': 'accordion-up 0.15s ease-out',
        'collapsible-down': 'collapsible-down 0.15s ease-out',
        'collapsible-up': 'collapsible-up 0.15s ease-out',
        gradient: 'gradient'
      }
    }
  },
  daisyui: {
    themes: []
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    plugin(({ addVariant }) => {
      // Allows use to customize styling for VS Code light and dark themes
      addVariant('high-contrast-dark', 'body[data-vscode-theme-kind="vscode-high-contrast"] &');
      addVariant('high-contrast-light', 'body[data-vscode-theme-kind="vscode-high-contrast-light"] &');
    })
  ]
};
