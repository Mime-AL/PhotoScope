if (typeof host == 'undefined') {const host = require('uxp').host;}
window.addEventListener('DOMContentLoaded', () => {
  let lang = host.uiLocale || 'en';
  if (typeof lang !== 'string') lang = 'en';

  const texts = {
    'zh': {
      'tab-settings': '设置',
      'settings-server-heading': '服务器设置',
      'server-url-label': '服务器地址',
      'server-connection': '服务器连接',
      'server-status': '服务器状态',
      'disconnected': '未连接',
      'python-label': 'Python位置',
      'validate': '校验',
      'settings-scope-heading': '示波器设置',
      'disconnect': '断开',
      'gain-label': '增益',
      'scale-label': '缩放',
      'samplerate-label': '采样率',
      'save-settings': '保存设置',
      'local-server': '启动本地服务器',
      'device-label': '使用GPU',
      'tab-vectorscope': '示波器',
      'vectorscope-heading': '矢量示波器',
      'intensityscope-heading': '波形示波器',
    },
    'en': {
      'tab-settings': 'Settings',
      'settings-server-heading': 'Server Settings',
      'server-url-label': 'Server URL',
      'server-connection': 'SERVER CONNECTION',
      'server-status': 'SERVER STATUS',
      'disconnected': 'Disconnected',
      'python-label': 'Python Path',
      'validate': 'Validate',
      'disconnect': 'Disconnect',
      'settings-scope-heading': 'Scope Settings',
      'gain-label': 'Gain',
      'scale-label': 'Scale',
      'samplerate-label': 'Sample Rate',
      'save-settings': 'Save Settings',
      'local-server': 'launch local Server',
      'device-label': 'Use GPU',
      'tab-vectorscope': 'scope',
      'vectorscope-heading': 'Vector Scope',
      'intensityscope-heading': 'luminance Scope',
    }
  };
  const locale = lang.startsWith('zh') ? 'zh' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (texts[locale][key]) {
      el.textContent = texts[locale][key];
    }
  });
});