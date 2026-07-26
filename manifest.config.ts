import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default function manifest(devPort: number | undefined) {
  const contentSecurityPolicy =
    devPort !== undefined
      ? `script-src 'self' http://localhost:${devPort}`
      : undefined;

  return defineManifest({
    background: {
      service_worker: 'src/background/scriptsafe.js',
      scripts: ['src/background/scriptsafe.js'],
    },
    action: {
      default_icon: 'public/IconForbidden.png',
      default_popup: 'src/popup/popup.html',
      default_title: 'ScriptSafe',
    },
    commands: {
      temppage: {
        suggested_key: {
          default: 'Ctrl+Shift+S',
        },
        description: '__MSG_hotkeystoggle__',
      },
      removetemppage: {
        suggested_key: {
          default: 'Ctrl+Shift+R',
        },
        description: '__MSG_hotkeysremove__',
      },
      removetempall: {
        suggested_key: {
          default: 'Ctrl+Shift+Q',
        },
        description: '__MSG_hotkeysremoveall__',
      },
    },
    content_scripts: [
      {
        all_frames: true,
        js: ['src/content-script/ss.js'],
        matches: ['http://*/*', 'https://*/*'],
        run_at: 'document_start',
      },
    ],
    description: '__MSG_appdescription__',
    icons: {
      128: 'public/icon128.png',
      16: 'public/icon16.png',
      24: 'public/icon24.png',
      32: 'public/icon32.png',
      48: 'public/icon48.png',
    },
    default_locale: 'en',
    manifest_version: 3,
    minimum_chrome_version: '6',
    name: 'ScriptSafe',
    options_page: 'src/options/options.html',
    permissions: [
      'http://*/*',
      'https://*/*',
      'tabs',
      'unlimitedStorage',
      'webRequest',
      'webRequestBlocking',
      'storage',
      'notifications',
      'privacy',
      'contextMenus',
      'declarativeNetRequest',
    ],
    version: pkg.version,
    content_security_policy: {
      extension_pages: contentSecurityPolicy,
      sandbox: contentSecurityPolicy,
    },
    browser_specific_settings: {
      gecko: {
        id: 'script.safe@choonster.com',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  });
}
