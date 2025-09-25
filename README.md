# OpenCart Automation Framework
This repository contains OpenCart E-commerce Automation project which is covering following modules:        
**Desktop Products**  
**Laptop & Notebook Products**<br>
**Phone & PDA Products**<br>
**Multi-Currency Price Validation**

**Installation (pre-requisites)**
1. **Node.js 18+**<br>
   **Mac:** brew install node <br>
   **Ubuntu** sudo apt-get install nodejs npm <br>
   **Windows** choco install nodejs <br>
   
Run following command to check Node.js is installed:

     node --version
     npm --version

2. **TypeScript**<br>
   **Global Installation:** npm install -g typescript <br>
   **Local Installation:** npm install typescript <br>

Run following command to check TypeScript is installed:

     tsc --version

---

## 🚀 Project Setup

Follow these steps to set up and run the OpenCart Automation Framework on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/LoveSoni/OPENCART_AUTOMATION.git
cd OPENCART_AUTOMATION
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Playwright Browsers
```bash
npx playwright install
```

### 4. Verify Installation
```bash
# Check if all dependencies are installed correctly
npm list

# Verify TypeScript compilation
npx tsc --noEmit
```

### 5. Run Tests
```bash
# Run sanity tests (quick verification)
npm run test:sanity

# Run complete test suite
npm test

# Generate and open HTML reports
npm run report:generate
npm run report:open
```

---

**Language and Libraries Used**
* TypeScript -> Modern JavaScript with type safety
* Playwright -> Cross-browser automation
* Cucumber -> BDD framework with Gherkin syntax
* Node.js -> Runtime environment
* JSON -> Test data management

---

**Browser Supported** 
* Chromium (Primary)
* Firefox
* WebKit (Safari)

---

# Project Structure
```bash
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── cucumber.js
├── reports/
│   ├── cucumber-report.html
│   └── cucumber-report.json
└── src/
    ├── features/
    │   ├── desktop-products.feature
    │   ├── laptop-products.feature
    │   └── phone-products.feature
    ├── hooks/
    │   └── hooks.ts
    ├── pages/
    │   ├── BasePage.ts
    │   ├── DesktopPage.ts
    │   ├── HomePage.ts
    │   ├── LaptopPage.ts
    │   ├── PageManager.ts
    │   └── PhonePage.ts
    ├── steps/
    │   ├── desktopSteps.ts
    │   ├── laptopSteps.ts
    │   └── phoneSteps.ts
    ├── utils/
    │   └── helpers.ts
    └── world/
        └── CustomWorld.ts
└── test-data/
    ├── desktopList.json
    ├── laptopList.json
    └── phoneList.json
```

---

**Environment Variables(Optional):** Environment variables can be configured in `.env` file or passed via command line <br>
<table>
    <thead>
      <tr>
        <th>Variable</th>
        <th>Description</th>
        <th>Possible Values</th>
      </tr>
    </thead>
    <tbody>
        <tr>
            <td>BROWSER</td>
            <td>Run tests on specific browser</td>
            <td>chromium, firefox, webkit</td>
        </tr>
        <tr>
            <td>HEADLESS</td>
            <td>Run test in headless mode</td>
            <td>true, false</td>
        </tr>
         <tr>
            <td>BASE_URL</td>
            <td>OpenCart demo URL</td>
            <td>https://demo.opencart.com/</td>
        </tr>
        <tr>
            <td>SCREENSHOT_ON_FAILURE</td>
            <td>Capture screenshots on test failure</td>
            <td>true, false</td>
        </tr>
        <tr>
            <td>RECORD_VIDEO</td>
            <td>Record video during test execution</td>
            <td>true, false</td>
        </tr>
    </tbody>
  </table>

---

**Framework Features**
* **BDD Approach:** Gherkin syntax for readable test scenarios
* **Page Object Model:** Organized and maintainable page objects
* **Multi-Browser Support:** Cross-browser testing capabilities
* **HTML Reports:** Comprehensive test execution reports
* **Screenshot on Failure:** Automatic screenshot capture for failed tests
* **Test Data Management:** JSON-based test data organization
* **TypeScript Support:** Type-safe automation code

---

**Commands to run automated tests:** <br><br>

Install dependencies:

     npm install

Complete Suite:

     npm test

Sanity tests (Quick smoke tests):

     npm run test:sanity

Desktop Product Tests:

     npm run test:desktop

Laptop Product Tests:

     npm run test:laptop

Phone Product Tests:

     npm run test:phone

Desktop Sanity Test:

     npm run test:desktop-sanity

Laptop Sanity Test:

     npm run test:laptop-sanity

Phone Sanity Test:

     npm run test:phone-sanity

---

**Test Execution Flow**
1. **Background:** Navigate to OpenCart homepage
2. **Sanity Tests:** Quick validation of product visibility and counts
3. **Price Validation:** Comprehensive price verification across multiple currencies (USD, EUR, GBP)
4. **Product Names:** Validation against predefined test data
5. **Multi-page Support:** Handles pagination for complete product coverage

---

**Reporting**
- **HTML Reports:** Generated in `reports/cucumber-report.html`
- **Preety Html Reports:** Generated `reports/index.html`
- **JSON Reports:** Available in `reports/cucumber-report.json`  
- **Screenshots:** Captured on failure in `screenshots/` directory
- **Console Logs:** Detailed execution information during test runs

---

**Cucumber Report**

<img width="1533" height="834" alt="Screenshot 2025-09-25 at 4 40 50 pm" src="https://github.com/user-attachments/assets/78e11e39-df31-464a-be2b-aa1bf0f9cde4" />

---

**Pretty Html Report**

<img width="1534" height="826" alt="Screenshot 2025-09-25 at 4 42 38 pm" src="https://github.com/user-attachments/assets/051b906e-5172-4298-a93b-77656ef556c3" />


---

**Complete Test Execution Recording**

https://github.com/user-attachments/assets/ac977e93-20cd-4353-bcae-6b3cedc7301f

---
