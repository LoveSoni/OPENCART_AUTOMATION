import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from '../world/CustomWorld';
import { createScreenshot } from '../utils/helpers';

setDefaultTimeout(30 * 1000);

BeforeAll(async function () {
  console.log('Execution started');
});

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld, scenario: any) {
  try {
    if (scenario.result?.status === Status.FAILED) {
      if (process.env.SCREENSHOT_ON_FAILURE === 'true') {
        const screenshot = await createScreenshot(this.page);
        this.attach(screenshot, 'image/png');
      }
    }
    
    // Add timeout to cleanup to prevent hanging
    await Promise.race([
      this.cleanup(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Cleanup timeout')), 10000)
      )
    ]);
  } catch (error) {
  }
});

AfterAll(async function () {
  console.log('Test execution completed.');
  await CustomWorld.cleanupSharedContext();
});