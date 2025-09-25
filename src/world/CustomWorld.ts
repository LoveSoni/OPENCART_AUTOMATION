import { chromium, firefox, webkit, Browser, Page, BrowserContext } from '@playwright/test';
import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { PageManager } from '../pages/PageManager';

export interface CustomWorldOptions extends IWorldOptions {
  browser?: string;
  headless?: boolean;
  baseUrl?: string;
}


let sharedContext: BrowserContext | null = null;

export class CustomWorld extends World<CustomWorldOptions> {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public baseUrl: string;
  public pageManager!: PageManager;

  constructor(options: CustomWorldOptions) {
    super(options);
    this.baseUrl = (options.parameters as any)?.baseUrl || 'https://demo.opencart.com';
  }

  async init() {
    const browserName = (this.parameters as any).browser || 'chromium';
    
    // Get Chrome user data directory based on OS
    const getUserDataDir = () => {
      if (process.env.CHROME_USER_DATA_DIR) {
        return process.env.CHROME_USER_DATA_DIR;
      }
      
      const os = process.platform;
      const homeDir = process.env.HOME || process.env.USERPROFILE;
      
      switch (os) {
        case 'darwin': // macOS
          return `${homeDir}/Library/Application Support/Google/Chrome/Default`;
        case 'win32': // Windows
          const appData = process.env.LOCALAPPDATA || `${homeDir}/AppData/Local`;
          return `${appData}/Google/Chrome/User Data/Default`;
        case 'linux': // Linux
          return `${homeDir}/.config/google-chrome/Default`;
        default:
          console.warn(`Unsupported OS: ${os}. Using default Chrome profile path.`);
          return `${homeDir}/.config/google-chrome/Default`;
      }
    };

    const userDataDir = getUserDataDir();

    if (browserName === 'chromium' || browserName === 'chrome') {
      // Use shared context if it exists, otherwise create a new one
      if (!sharedContext) {
        console.log(`Using Chrome profile: ${userDataDir}`);
        sharedContext = await chromium.launchPersistentContext(userDataDir, {
          headless: false,
          channel: 'chrome',
          viewport: null, 
          args: [
            '--start-maximized',
            '--disable-web-security',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-blink-features=AutomationControlled', 
            '--disable-extensions-except', 
            '--disable-plugins-discovery',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ],
          ignoreDefaultArgs: ['--enable-automation'], 
          recordVideo: process.env.RECORD_VIDEO === 'true' ? { dir: 'test-results/videos' } : undefined
        });
      }
      
      this.context = sharedContext;
      
    
      const existingPages = this.context.pages();
      if (existingPages.length > 0) {
        this.page = existingPages[0];
        await this.page.bringToFront();
        const currentUrl = this.page.url();
        if (currentUrl === 'about:blank' || currentUrl === 'chrome://newtab/' || currentUrl.includes('newtab')) {
        } else {
          console.log(`current url : ${currentUrl}`);
        }
      } else {
        this.page = await this.context.newPage();
      }
      
  
      await this.page.addInitScript(() => {
        // @ts-ignore - navigator is available in browser context
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });
      
      
    } else {
      switch (browserName) {
        case 'firefox':
          this.browser = await firefox.launch({ headless: false });
          break;
        case 'webkit':
          this.browser = await webkit.launch({ headless: false });
          break;
        default:
          this.browser = await chromium.launch({ headless: false });
      }
      
      this.context = await this.browser.newContext({ viewport: null });
      this.page = await this.context.newPage();
    }
    
    // Initialize PageManager
    this.pageManager = new PageManager(this.page, this.baseUrl);
  }

  async cleanup() {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }
      if (this.context && this.browser) {
        await this.context.close();
      }
      
      if (this.browser) {
        await this.browser.close();
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