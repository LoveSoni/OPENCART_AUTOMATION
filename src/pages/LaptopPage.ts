import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LaptopPage extends BasePage {
  
  private readonly pageTitle: Locator;
  private readonly productItems: Locator;
  private readonly productNames: Locator;
  private readonly paginationLinks: Locator;
  private readonly nextPageButton: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
  
    this.pageTitle = this.page.locator('h2:has-text("Laptops & Notebooks")');
    this.productItems = this.page.locator('.product-thumb');
    this.productNames = this.page.locator('.product-thumb h4 a');
    this.paginationLinks = this.page.locator('.pagination li a');
    this.nextPageButton = this.page.locator('.pagination li a:has-text(">")');
  }

  async isLaptopPageDisplayed(): Promise<boolean> {
    try {
      await this.waitForElement(this.pageTitle, 10000);
      const titleText = await this.pageTitle.textContent();
      return titleText ? titleText.includes('Laptops & Notebooks') : false;
    } catch (error) {
      return false;
    }
  }

  async getProductCount(): Promise<number> {
    await this.waitForElement(this.productItems.first(), 10000);
    return await this.productItems.count();
  }

  async getAllProductNames(): Promise<string[]> {
    try {
      
      await this.waitForElement(this.productItems.first(), 10000);
      const count = await this.productItems.count();
      console.log(`Found ${count} product items`);
      const nameElements = this.productNames;
      const nameCount = await nameElements.count();
      console.log(`Found ${nameCount} product name elements`);
      const names: string[] = [];
      for (let i = 0; i < nameCount; i++) {
        try {
          const nameElement = nameElements.nth(i);
          await this.waitForElement(nameElement, 5000);
          
          const name = await nameElement.textContent({ timeout: 5000 });
          if (name) {
            names.push(name.trim());
            console.log(`Extracted name ${i + 1}: "${name.trim()}"`);
          }
        } catch (error) {
          console.error(`Error extracting name ${i + 1}:`, error);
        }
      }
      
      console.log(`Total extracted names: ${names.length}`);
      return names;
    } catch (error) {
      console.error('Error in getAllProductNames:', error);
      return [];
    }
  }

  async getAllProductPrices(): Promise<{ name: string; price: string; originalPrice?: string }[]> {
    try {
      await this.waitForElement(this.productItems.first(), 10000);
      const count = await this.productItems.count();
      console.log(`Found ${count} products to extract prices from`);
      const products: { name: string; price: string; originalPrice?: string }[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const productItem = this.productItems.nth(i);
          await this.waitForElement(productItem, 5000);
        
          const nameElement = productItem.locator('h4 a'); 
          const name = await nameElement.textContent({ timeout: 5000 });
          
          const priceElement = productItem.locator('.price');
          const priceText = await priceElement.textContent({ timeout: 5000 });
          
          const oldPriceElement = priceElement.locator('.price-old');
          const newPriceElement = priceElement.locator('.price-new');
          
          let price = '';
          let originalPrice = '';
          
          if (await oldPriceElement.count() > 0 && await newPriceElement.count() > 0) {
            originalPrice = (await oldPriceElement.textContent({ timeout: 3000 }))?.trim() || '';
            price = (await newPriceElement.textContent({ timeout: 3000 }))?.trim() || '';
          } else {
            const fullPriceText = priceText?.trim() || '';
            price = fullPriceText.split('\n')[0].trim();
          }
          
          if (name && price) {
            const product: { name: string; price: string; originalPrice?: string } = {
              name: name.trim(),
              price
            };
            
            if (originalPrice) {
              product.originalPrice = originalPrice;
            }
            
            products.push(product);
            console.log(`Product ${i + 1}: ${name.trim()} - ${price}`);
          } else {
            console.log(`Skipped product ${i + 1}: missing name or price`);
          }
        } catch (error) {
          console.error(`Error processing product ${i + 1}:`, error);
          continue;
        }
      }
      
      console.log(`Successfully extracted ${products.length} products with prices`);
      return products;
    } catch (error) {
      console.error('Error in getAllProductPrices:', error);
      throw error;
    }
  }


  async hasPagination(): Promise<boolean> {
    return await this.paginationLinks.count() > 0;
  }

  async hasNextPage(): Promise<boolean> {
    try {
      const allLinks = await this.paginationLinks.allTextContents();
      console.log('Available pagination links:', allLinks);
      
      const nextButton = await this.nextPageButton.count();
      console.log(`Found ${nextButton} ">" buttons`);
      return nextButton > 0;
    } catch (error) {
      return false;
    }
  }

  async goToNextPage(): Promise<boolean> {
    try {
      if (await this.hasNextPage()) {
        console.log('Attempting to click next page button...');
        await this.clickElement(this.nextPageButton.first());
        await this.waitForPageLoad();
        await this.page.waitForTimeout(2000); 
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error navigating to next page:', error);
      return false;
    }
  }

  async goToFirstPage(): Promise<void> {
    try {
      const firstPageLink = this.page.locator('.pagination li a').filter({ hasText: /^1$/ });
      const firstPageCount = await firstPageLink.count();
      
      if (firstPageCount > 0) {
        console.log('Navigating back to first page...');
        await this.clickElement(firstPageLink.first());
        await this.waitForPageLoad();
        await this.page.waitForTimeout(2000);
      } else {
        console.log('Already on first page or refreshing page...');
        await this.page.reload();
        await this.waitForPageLoad();
      }
    } catch (error) {
      console.log('Error navigating to first page, refreshing instead:', error);
      await this.page.reload();
      await this.waitForPageLoad();
    }
  }

  async getAllProductNamesFromAllPages(): Promise<string[]> {
    const allProductNames: string[] = [];
    let currentPageNum = 1;

    try {
      console.log('Starting to extract product names from all pages...');

      do {
        console.log(`Processing page ${currentPageNum}...`);
        const pageProductNames = await this.getAllProductNames();
        allProductNames.push(...pageProductNames);
        console.log(`Found ${pageProductNames.length} products on page ${currentPageNum}`);

        const hasNext = await this.goToNextPage();
        if (!hasNext) {
          console.log('Reached last page or no pagination found');
          break;
        }
        currentPageNum++;
        if (currentPageNum > 10) {
          console.log('Reached maximum page limit (10) for safety');
          break;
        }
      } while (true);

      console.log(`Total products found across all pages: ${allProductNames.length}`);
      return [...new Set(allProductNames)];
    } catch (error) {
      console.error('Error getting products from all pages:', error);
      return allProductNames;
    }
  }

  async getAllProductPricesFromAllPages(): Promise<{ name: string; price: string; originalPrice?: string }[]> {
    const allProductPrices: { name: string; price: string; originalPrice?: string }[] = [];
    let currentPageNum = 1;

    try {
      console.log('Starting to extract product prices from all pages...');

      do {
        console.log(`Processing prices on page ${currentPageNum}...`);
        
        // Get product prices from current page
        const pageProductPrices = await this.getAllProductPrices();
        allProductPrices.push(...pageProductPrices);
        console.log(`Found ${pageProductPrices.length} products with prices on page ${currentPageNum}`);

        const hasNext = await this.goToNextPage();
        if (!hasNext) {
          console.log('Reached last page or no pagination found');
          break;
        }
        currentPageNum++;
        if (currentPageNum > 10) {
          console.log('Reached maximum page limit (10) for safety');
          break;
        }
      } while (true);

      console.log(`Total products with prices found across all pages: ${allProductPrices.length}`);
      return allProductPrices; 
    } catch (error) {
      console.error('Error getting product prices from all pages:', error);
      return allProductPrices;
    }
  }
}