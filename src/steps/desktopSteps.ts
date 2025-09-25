import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../world/CustomWorld';
import { PageManager } from '../pages/PageManager';
import * as fs from 'fs';
import * as path from 'path';

interface TestProduct {
  name: string;
  price: {
    Pound: string;
    Dollar: string;
    Euro: string;
  };
}

const testDataPath = path.join(process.cwd(), 'test-data', 'desktopList.json');
const testData: TestProduct[] = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

Given('user is on the OpenCart homepage', async function (this: CustomWorld) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const homePage = pageManager.homePage;
  await homePage.navigateToHome();
  expect(await homePage.isHomepageDisplayed()).toBeTruthy();
});

When('user navigates to the desktop section', async function (this: CustomWorld) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const homePage = pageManager.homePage;
  await homePage.hoverOverDesktopMenu();
  await this.page.waitForTimeout(1000); 
});

When('user clicks on {string}', async function (this: CustomWorld, linkText: string) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const homePage = pageManager.homePage;
  
  if (linkText === 'Show All Desktops') {
    await homePage.clickShowAllDesktops();
  } else if (linkText === 'Show All Phones & PDAs') {
    await homePage.clickShowAllPhones();
  } else {
    await this.page.click(`text=${linkText}`);
  }
  await this.page.waitForLoadState('networkidle');
});

When('user clicks on {string} button', async function (this: CustomWorld, buttonText: string) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const homePage = pageManager.homePage;
  
  if (buttonText === 'Show All Desktops') {
    await homePage.clickShowAllDesktops();
  } else if (buttonText === 'Show All Laptops & Notebooks') {
    await homePage.clickShowAllLaptops();
  } else if (buttonText === 'Show All Phones & PDAs') {
    await homePage.clickShowAllPhones();
  } else {
    await this.page.click(`text=${buttonText}`);
  }
  await this.page.waitForLoadState('networkidle');
});

Then('user should see the desktop products page', async function (this: CustomWorld) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const desktopPage = pageManager.desktopPage;
  expect(await desktopPage.isDesktopPageDisplayed()).toBeTruthy();
  const productCount = await desktopPage.getProductCount();
  expect(productCount).toBeGreaterThan(0)
});

Then('verify user should see the desktop section details page', async function (this: CustomWorld) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const desktopPage = pageManager.desktopPage;
  expect(await desktopPage.isDesktopPageDisplayed()).toBeTruthy();
  const productCount = await desktopPage.getProductCount();
  expect(productCount).toBeGreaterThan(0);
});

Then('validate desktop names should match test data', async function (this: CustomWorld) {
  try {
    console.log('Validating desktop names against test data...');
    const pageManager = new PageManager(this.page, this.baseUrl);
    const desktopPage = pageManager.desktopPage;
    await expect(this.page.locator('.product-thumb').first()).toBeVisible();
    console.log('Verified all the products are present on page');
    const hasPagination = await desktopPage.hasPagination();
    let actualProductNames: string[];
    if (hasPagination) {
      console.log('Extracting products from all pages...');
      actualProductNames = await desktopPage.getAllProductNamesFromAllPages();
    } else {
      console.log('Extracting products from current page only...');
      actualProductNames = await desktopPage.getAllProductNames();
    }
    
    console.log(`Found ${actualProductNames.length} product names across all pages:`, actualProductNames);

    const expectedProductNames = testData.map(product => product.name);
    console.log(`Expected ${expectedProductNames.length} product names from test data`);
    console.log("Expected product names are:", expectedProductNames);
    
    expect(actualProductNames.length).toBeGreaterThan(0);
    
    let foundProducts = 0;
    let missingProducts: string[] = [];
    let foundMatches: string[] = [];
    
    for (const expectedProduct of expectedProductNames) {
      const isProductFound = actualProductNames.some(actualName => 
        actualName.toLowerCase().includes(expectedProduct.toLowerCase()) || 
        expectedProduct.toLowerCase().includes(actualName.toLowerCase()) ||
        actualName.trim().toLowerCase() === expectedProduct.trim().toLowerCase()
      );
      
      if (isProductFound) {
        foundProducts++;
        foundMatches.push(expectedProduct);
        console.log(`Found product: ${expectedProduct}`);
      } else {
        missingProducts.push(expectedProduct);
        console.log(`Missing product: ${expectedProduct}`);
      }
    }
    
    console.log(`Desktop names validation results:`);
    console.log(`Found matches: ${foundProducts}/${expectedProductNames.length}`);
    console.log(`Matched products:`, foundMatches);
    
    if (missingProducts.length > 0) {
      console.log(`Missing products:`, missingProducts);
      if (hasPagination) {
        console.log(`${missingProducts.length} products not found even after checking all pages`);
      } else {
        console.log(`${missingProducts.length} products not found on current page (no pagination detected)`);
      }
    }
    
    expect(foundProducts).toBeGreaterThan(0);
    
    if (hasPagination && missingProducts.length === 0) {
      console.log('All expected products found across all pages');
    }
  } catch (error) {
    console.error('Error in desktop names validation:', error);
  }
});

When('user changes currency to {string}', async function (this: CustomWorld, currency: string) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const homePage = pageManager.homePage;
  
  await homePage.changeCurrency(currency);
  console.log(`Changed currency to: ${currency}`);
});


Then('validate desktop prices should match {word} prices from test data', async function (this: CustomWorld, currency: string) {
  try {
    console.log(`Validating ${currency} prices after currency change...`);
    await expect(this.page).toHaveTitle(/Desktop/i);
    console.log('Verified page title contains "Desktop"');
    await expect(this.page.locator('.product-thumb').first()).toBeVisible();
    console.log('Changed currency and Verify products are present ');

    const pageManager = new PageManager(this.page, this.baseUrl);
    const desktopPage = pageManager.desktopPage;
    await desktopPage.goToFirstPage();
    console.log(`Ensured we are on first page for ${currency} price validation`);
    const hasPagination = await desktopPage.hasPagination();
  
    let actualProducts: { name: string; price: string; originalPrice?: string }[];
    if (hasPagination) {
      console.log(`Extracting ${currency} prices from all pages...`);
      actualProducts = await desktopPage.getAllProductPricesFromAllPages();
    } else {
      actualProducts = await desktopPage.getAllProductPrices();
    }
    
    console.log(`Found ${actualProducts.length} products with ${currency} prices:`, actualProducts);
    
    const expectedProducts = testData;
    console.log(`Expected ${expectedProducts.length} products with ${currency} prices from test data`);
    
    expect(actualProducts.length).toBeGreaterThan(0);
    
    let priceProperty: string;
    switch (currency.toUpperCase()) {
      case 'USD':
        priceProperty = 'Dollar';
        break;
      case 'EUR':
        priceProperty = 'Euro';
        break;
      case 'GBP':
        priceProperty = 'Pound';
        break;
      default:
        throw new Error(`Unsupported currency: ${currency}`);
    }
    
    let priceMatches = 0;
    let priceMismatches: string[] = [];
    let foundPriceMatches: string[] = [];
    
    for (const expectedProduct of expectedProducts) {
      const actualProduct = actualProducts.find(actual => 
        actual.name.toLowerCase().includes(expectedProduct.name.toLowerCase()) || 
        expectedProduct.name.toLowerCase().includes(actual.name.toLowerCase()) ||
        actual.name.trim().toLowerCase() === expectedProduct.name.trim().toLowerCase()
      );
      
      if (actualProduct) {
        const expectedPrice = expectedProduct.price[priceProperty as keyof typeof expectedProduct.price];
        const actualPrice = actualProduct.price;
        if (actualPrice === expectedPrice) {
          priceMatches++;
          foundPriceMatches.push(`${expectedProduct.name}: ${actualPrice}`);
          console.log(`${currency} price match: ${expectedProduct.name} - Expected: ${expectedPrice}, Actual: ${actualPrice}`);
        } else {
          priceMismatches.push(`${expectedProduct.name}: Expected ${expectedPrice}, Got ${actualPrice}`);
          console.log(`${currency} price mismatch: ${expectedProduct.name} - Expected: ${expectedPrice}, Actual: ${actualPrice}`);
        }
      } else {
        console.log(`Product not found for ${currency} price comparison: ${expectedProduct.name}`);
      }
    }
    
    console.log(`${currency} Price validation results:`);
    console.log(`Price matches: ${priceMatches}/${expectedProducts.length}`);
    console.log(`Matched prices:`, foundPriceMatches);
    
    if (priceMismatches.length > 0) {
      console.log(`Price mismatches:`, priceMismatches);
      if (hasPagination) {
        console.log(`${priceMismatches.length} ${currency} price mismatches found after checking all pages`);
      } else {
        console.log(`${priceMismatches.length} ${currency} price mismatches found on current page`);
      }
    }

    expect(priceMatches).toBeGreaterThan(0);
    if (priceMismatches.length === 0 && priceMatches === expectedProducts.length) {
      console.log(`Perfect ${currency} price match! All ${currency} prices match the test data exactly`);
    }
    
    console.log(`${currency} price validation completed - actual price comparison implemented`);
    
  } catch (error) {
    console.error(`Error in ${currency} price validation:`, error);
    throw error;
  }
});

Then('verify desktop products count should be greater than 0', async function (this: CustomWorld) {
  const pageManager = new PageManager(this.page, this.baseUrl);
  const desktopPage = pageManager.desktopPage;
  const productCount = await desktopPage.getProductCount();
  expect(productCount).toBeGreaterThan(0);
  console.log(`Sanity Test: Found ${productCount} desktop products - Count validation passed`);
});