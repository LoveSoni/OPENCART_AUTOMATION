import { Page } from '@playwright/test';
import { HomePage } from './HomePage';
import { DesktopPage } from './DesktopPage';
import { LaptopPage } from './LaptopPage';
import { PhonePage } from './PhonePage';

export class PageManager {
  protected page: Page;
  protected baseUrl: string;
  public homePage: HomePage;
  public desktopPage: DesktopPage;
  public laptopPage: LaptopPage;
  public phonePage: PhonePage;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;
    
    this.homePage = new HomePage(this.page, this.baseUrl);
    this.desktopPage = new DesktopPage(this.page, this.baseUrl);
    this.laptopPage = new LaptopPage(this.page, this.baseUrl);
    this.phonePage = new PhonePage(this.page, this.baseUrl);
  }
}