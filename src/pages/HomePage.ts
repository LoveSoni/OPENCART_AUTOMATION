import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Locators
  private readonly logo: Locator;
  private readonly desktopMenu: Locator;
  private readonly showAllDesktopsLink: Locator;
  private readonly laptopMenu: Locator;
  private readonly showAllLaptopsLink: Locator;
  private readonly phoneMenu: Locator;
  private readonly currencyDropdown: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    
    this.logo = this.page.locator('#logo');
    this.desktopMenu = this.page.locator("a.dropdown-toggle", { hasText: "Desktops" }).first();
    this.showAllDesktopsLink = this.page.locator('a:has-text("Show All Desktops")');
    this.laptopMenu = this.page.locator('a:has-text("Laptops & Notebooks")').first();
    this.showAllLaptopsLink = this.page.locator('a:has-text("Show All Laptops & Notebooks")');
    this.phoneMenu = this.page.locator("//a[contains(text(),'Phones & PDAs')]");
    this.currencyDropdown = this.page.locator('#form-currency');
  }

  async navigateToHome(): Promise<void> {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  async isHomepageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.logo);
  }

  async hoverOverDesktopMenu(): Promise<void> {
    await this.desktopMenu.hover();
  }

  async clickShowAllDesktops(): Promise<void> {
    await this.hoverOverDesktopMenu();
    await this.clickElement(this.showAllDesktopsLink);
  }

  async hoverOverLaptopMenu(): Promise<void> {
    await this.laptopMenu.hover();
  }

  async clickShowAllLaptops(): Promise<void> {
    await this.hoverOverLaptopMenu();
    await this.clickElement(this.showAllLaptopsLink);
  }

  async hoverOverPhoneMenu(): Promise<void> {
    await this.phoneMenu.hover();
  }

  async clickShowAllPhones(): Promise<void> {
    await this.clickElement(this.phoneMenu);
  }

  async changeCurrency(currency: string) {
    try {
      await this.waitForElement(this.currencyDropdown, 10000);
      
      await this.page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      await this.page.waitForTimeout(500);
      
      // Click currency dropdown with better targeting because of overlapping elements
      await this.currencyDropdown.click({ position: { x: 50, y: 17 } });
      await this.page.waitForTimeout(800); 
      
      let currencyOption;
    
      switch (currency.toUpperCase()) {
        case 'USD':
          currencyOption = this.page.locator('button.currency-select[name="USD"]').first();
          break;
        case 'EUR':
          currencyOption = this.page.locator('button.currency-select[name="EUR"]').first();
          break;
        case 'GBP':
          currencyOption = this.page.locator('button.currency-select[name="GBP"]').first();
          break;
        default:
          currencyOption = this.page.locator(`button.currency-select[name="${currency.toUpperCase()}"]`).first();
      }
      
      const optionCount = await currencyOption.count();
      if (optionCount === 0) {
        const availableOptions = await this.page.locator('button.currency-select').allTextContents();
        throw new Error(`Currency option ${currency} not found. Available: ${availableOptions.join(', ')}`);
      }
      const currentUrl = this.page.url();
      
      // Use JavaScript execution for all currencies 
      console.log(`Using JavaScript execution for ${currency} currency change...`);
      await this.page.evaluate((currencyCode) => {
        const currencyButton = document.querySelector(`button.currency-select[name="${currencyCode}"]`) as HTMLButtonElement;
        if (currencyButton) {
          if (currencyCode === 'USD') {
            const desktopMenus = document.querySelectorAll('a.dropdown-toggle');
            desktopMenus.forEach(menu => {
              (menu as HTMLElement).style.visibility = 'hidden';
            });
            currencyButton.click();
            setTimeout(() => {
              desktopMenus.forEach(menu => {
                (menu as HTMLElement).style.visibility = 'visible';
              });
            }, 1000);
          } else {
            currencyButton.click();
          }
        } else {
          throw new Error(`${currencyCode} currency button not found`);
        }
      }, currency.toUpperCase());
      
      await this.page.waitForTimeout(1500); 
      await this.page.waitForTimeout(1000);
      const newUrl = this.page.url();
      
      if (newUrl !== currentUrl && !newUrl.includes('currency')) {
        console.warn(`invalid navigation: ${currentUrl} -> ${newUrl}`);
        if (newUrl.includes('product/category&path=20')) {
          console.log('invalid desktop navigation, going back...');
          await this.page.goBack();
          await this.page.waitForLoadState('networkidle');
        }
      }
      await this.page.waitForTimeout(1000);
      await this.page.waitForFunction(() => {
        const dropdown = document.querySelector('button.currency-select[name="USD"], button.currency-select[name="EUR"], button.currency-select[name="GBP"]');
        return !dropdown || !(dropdown as HTMLElement).offsetParent;
      }, { timeout: 5000 });
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      console.log(`Currency changed to: ${currency}`);
      console.log('Waiting for page to stabilize and scrolling to show all items...');
      await this.page.waitForTimeout(1500);
      await this.page.evaluate(() => {
        document.body.style.pointerEvents = 'none';
      });
      await this.page.evaluate(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      });
      await this.page.waitForTimeout(1500);
      await this.page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      await this.page.waitForTimeout(1500);
      await this.page.evaluate(() => {
        document.body.style.pointerEvents = 'auto';
      });
      
      console.log('Currency changed ');
    } catch (error) {
      console.error(`Failed to change currency to ${currency}:`, error);
      throw error;
    }
  }
}