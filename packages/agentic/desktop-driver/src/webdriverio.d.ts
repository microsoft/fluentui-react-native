declare global {
  namespace WebdriverIO {
    interface Capabilities {
      'furn:clickMode'?: 'accessibility' | 'auto' | 'physical';
      'furn:endpoint'?: 'macos' | 'win32' | 'windows';
      'furn:target'?: string;
    }
  }
}

export {};
