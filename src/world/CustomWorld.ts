import { chromium, firefox, webkit, Browser, Page, BrowserContext } from '@playwright/test';
import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';

export interface CustomWorldOptions extends IWorldOptions {
  browser?: string;
  headless?: boolean;
}

let sharedContext: BrowserContext | null = null;

export class CustomWorld extends World<CustomWorldOptions> {
  public context!: BrowserContext;
  public page!: Page;
  public baseUrl: string;

  constructor(options: CustomWorldOptions) {
    super(options);
    this.baseUrl = 'https://opencart.abstracta.us';
  }

  async init() {
    const browserName = (this.parameters as any).browser || 'chromium';
    if (!sharedContext) {
      console.log(`Launching ${browserName} browser with anti-detection`);
      
      let browser;
      switch (browserName) {
        case 'firefox':
          browser = await firefox.launch({ headless: false });
          break;
        case 'webkit':
          browser = await webkit.launch({ headless: false });
          break;
        default: // chromium
          browser = await chromium.launch({ 
            headless: false,
            args: [
              '--start-maximized',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor,AutomationControlled',
              '--disable-blink-features=AutomationControlled',
              '--exclude-switches=enable-automation',
              '--no-first-run',
              '--no-default-browser-check',
              '--no-sandbox',
              '--disable-dev-shm-usage'
            ],
            ignoreDefaultArgs: ['--enable-automation']
          });
      }

      sharedContext = await browser.newContext({ 
        viewport: null,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ignoreHTTPSErrors: true
      });
    }
    
    this.context = sharedContext;
    
    const existingPages = this.context.pages();
    if (existingPages.length > 0) {
      this.page = existingPages[0];
      await this.page.bringToFront();
      const currentUrl = this.page.url();
      if (currentUrl === 'about:blank' || currentUrl === 'chrome://newtab/' || currentUrl.includes('newtab')) {
        console.log('Reusing existing blank page');
      } else {
        console.log(`Reusing page with URL: ${currentUrl}`);
      }
    } else {
      this.page = await this.context.newPage();
    }

    await this.page.addInitScript(() => {
      // Essential anti-detection measures
      // @ts-ignore
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
        configurable: true
      });
      
      // Remove automation indicators  
      // @ts-ignore
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
      // @ts-ignore
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
      // @ts-ignore
      delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
      // @ts-ignore
      delete window.$cdc_asdjflasutopfhvcZLmcfl_;
      // @ts-ignore
      window.chrome = {
        runtime: {},
        loadTimes: function() {
          return {
            commitLoadTime: Date.now(),
            finishDocumentLoadTime: Date.now(),
            finishLoadTime: Date.now(),
            navigationType: 'Other'
          };
        }
      };
    });
  }

  async cleanup() {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }
    } catch (error) {
    }
  }

  static async cleanupSharedContext() {
    if (sharedContext) {
      try {
        await sharedContext.close();
        sharedContext = null;
        console.log('Shared context cleaned up');
      } catch (error) {
        console.warn(error);
      }
    }
  }
}

setWorldConstructor(CustomWorld);