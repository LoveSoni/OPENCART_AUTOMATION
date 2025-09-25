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
    this.desktopMenu = this.page.locator('a[href*="desktop"]:has-text("Desktops")').first();
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
      await this.clickElement(this.currencyDropdown);
      let currencyOption;
    
      switch (currency.toUpperCase()) {
        case 'USD':
          currencyOption = this.page.locator("//a[contains(text(),'US Dollar') or contains(text(),'USD')]").first();
          break;
        case 'EUR':
          currencyOption = this.page.locator("//a[contains(text(),'Euro') or contains(text(),'EUR')]").first();
          break;
        case 'GBP':
          currencyOption = this.page.locator("//a[contains(text(),'Pound Sterling') or contains(text(),'GBP')]").first();
          break;
        default:
          currencyOption = this.page.locator(`//a[contains(text(),'${currency}')]`).first();
      }
      
    
      const optionCount = await currencyOption.count();
      if (optionCount === 0) {
        const availableOptions = await this.page.locator('#form-currency .dropdown-menu a').allTextContents();
        throw new Error(`Currency option ${currency} not found. Available: ${availableOptions.join(', ')}`);
      }
    
      const [response] = await Promise.all([
        this.page.waitForResponse(response => response.status() === 200 && response.url().includes('demo.opencart')),
        this.clickElement(currencyOption)
      ]);
    
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForLoadState('domcontentloaded');
      
      console.log(`Currency changed to: ${currency}`);
    } catch (error) {
      console.error(`Failed to change currency to ${currency}:`, error);
      throw error;
    }
  }
}