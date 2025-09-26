import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DesktopPage extends BasePage {
  
  private readonly pageTitle: Locator;
  private readonly productItems: Locator;
  private readonly productNames: Locator;
  private readonly paginationLinks: Locator;
  private readonly nextPageButton: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);
    this.pageTitle = this.page.locator('h2:has-text("Desktops")');
    this.productItems = this.page.locator('.product-thumb');
    this.productNames = this.page.locator('.product-thumb h4 a'); 
    this.paginationLinks = this.page.locator('.pagination li a');
    this.nextPageButton = this.page.locator('.pagination li a').filter({ hasText: /^>$/ });
  }

  async isDesktopPageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.pageTitle);
  }

  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  async getAllProductNames(): Promise<string[]> {
    try {
      console.log('Extracting product names');
      await this.waitForElement(this.productItems.first(), 10000);
      console.log('Product items are visible');
      
      const productCount = await this.productItems.count();
      console.log(`Total desktop count:  ${productCount}`);
      const nameCount = await this.productNames.count();
      const names: string[] = [];
      
      // Extract names
      for (let i = 0; i < nameCount; i++) {
        try {
          const nameElement = this.productNames.nth(i);
          await this.waitForElement(nameElement, 3000);
          const name = await nameElement.textContent();
          if (name && name.trim()) {
            names.push(name.trim());
            console.log(`Extracted name ${i + 1}: "${name.trim()}"`);
          } else {
            console.log(`Empty name at index ${i}`);
          }
        } catch (error) {
          console.log(`Error extracting name at index ${i}:`, error instanceof Error ? error.message : String(error));
          continue;
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
      // Wait for product items to be visible
      await this.waitForElement(this.productItems.first(), 10000);
      
      const count = await this.productItems.count();
      console.log(`Found ${count} products to extract prices from`);
      
      const products: { name: string; price: string; originalPrice?: string }[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const productItem = this.productItems.nth(i);

          await this.waitForElement(productItem, 5000);
          
          // Get product name
          const nameElement = productItem.locator('h4 a'); // Fixed: removed .caption
          const name = await nameElement.textContent({ timeout: 5000 });
          
          // Get product price
          const priceElement = productItem.locator('.price');
          const priceText = await priceElement.textContent({ timeout: 5000 });
          
          // Check for discounted price
          const oldPriceElement = priceElement.locator('.price-old');
          const newPriceElement = priceElement.locator('.price-new');
          
          let price = '';
          let originalPrice = '';
          
          if (await oldPriceElement.count() > 0 && await newPriceElement.count() > 0) {
            // Discounted product
            originalPrice = (await oldPriceElement.textContent({ timeout: 3000 }))?.trim() || '';
            price = (await newPriceElement.textContent({ timeout: 3000 }))?.trim() || '';
          } else {
            // Regular price - clean up "Ex Tax" text
            const fullPriceText = priceText?.trim() || '';
            // Extract only the main price (first line before any Ex Tax info)
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
      const nextButton = await this.nextPageButton.count();
      return nextButton > 0;
    } catch (error) {
      return false;
    }
  }

  async goToNextPage(): Promise<boolean> {
    try {
      if (await this.hasNextPage()) {
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
        await this.clickElement(firstPageLink.first());
        await this.waitForPageLoad();
        await this.page.waitForTimeout(2000);
      } else {
        await this.page.reload();
        await this.waitForPageLoad();
      }
    } catch (error) {
      await this.page.reload();
      await this.waitForPageLoad();
    }
  }

  async getAllProductNamesFromAllPages(): Promise<string[]> {
    try {
      console.log('Extracting desktop product names...');
      const hasPagination = await this.hasPagination();
      
      if (!hasPagination) {
        console.log('Single desktop page detected, extracting all products...');
        const names = await this.getAllProductNames();
        console.log(`Found ${names.length} desktop product names across all pages:`, names);
        return names;
      }
      
      // Multiple pages logic
      const allProductNames: string[] = [];
      let currentPageNum = 1;

      do {
        console.log(`Processing desktop names on page ${currentPageNum}...`);
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
          console.log('Reached maximum page limit');
          break;
        }
      } while (true);

      console.log(`Total desktop products found across all pages: ${allProductNames.length}`);
      return [...new Set(allProductNames)]; 
    } catch (error) {
      console.error('Error getting desktop products from all pages:', error);
      // Fallback to single page
      return await this.getAllProductNames();
    }
  }

  async getAllProductPricesFromAllPages(): Promise<{ name: string; price: string; originalPrice?: string }[]> {
    try {
      console.log('Starting to extract desktop product prices...');
      const hasPagination = await this.hasPagination();
      
      if (!hasPagination) {
        console.log('Single desktop page detected, extracting all product prices...');
        const prices = await this.getAllProductPrices();
        console.log(`Total desktop products with prices found: ${prices.length}`);
        return prices;
      }
      const allProductPrices: { name: string; price: string; originalPrice?: string }[] = [];
      let currentPageNum = 1;

      do {
        console.log(`Processing desktop prices on page ${currentPageNum}...`);
        
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
          console.log('Reached maximum page limit');
          break;
        }
      } while (true);

      console.log(`Total desktop products with prices found across all pages: ${allProductPrices.length}`);
      return allProductPrices;
    } catch (error) {
      console.error('Error getting desktop product prices from all pages:', error);
      // Fallback to single page
      return await this.getAllProductPrices();
    }
  }
}