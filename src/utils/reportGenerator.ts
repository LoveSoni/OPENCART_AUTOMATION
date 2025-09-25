import * as report from 'multiple-cucumber-html-reporter';
import * as fs from 'fs';
import * as path from 'path';

export class EnhancedReportGenerator {
  /**
   * Generate enhanced HTML report with custom styling and metadata
   */
  static generateHTMLReport(): void {
    const reportPath = path.join(process.cwd(), 'reports');
    const jsonReportPath = path.join(reportPath, 'cucumber-report.json');
    
    // Check if JSON report exists
    if (!fs.existsSync(jsonReportPath)) {
      console.log('No JSON report found to generate HTML report');
      return;
    }

    // Ensure reports directory exists
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    // Generate the enhanced report
    report.generate({
      jsonDir: reportPath,
      reportPath: reportPath,
      reportName: 'OpenCart Automation Report',
      pageTitle: 'OpenCart Test Results - Enhanced',
      displayDuration: true,
      displayReportTime: true,
      hideMetadata: false,
      
      metadata: {
        browser: {
          name: process.env.BROWSER || 'chromium',
          version: 'Latest'
        },
        device: 'Local Machine',
        platform: {
          name: process.platform,
          version: process.version
        }
      },
      
      customData: {
        title: 'Test Execution Info',
        data: [
          { label: 'Project', value: 'OpenCart E-commerce Automation' },
          { label: 'Test Environment', value: process.env.BASE_URL || 'https://demo.opencart.com' },
          { label: 'Execution Date', value: new Date().toLocaleString() },
          { label: 'Framework', value: 'Playwright + Cucumber + TypeScript' },
          { label: 'Test Categories', value: 'Desktop, Laptop, Phone Products' }
        ]
      },
      
      pageFooter: this.getPageFooter()
    });

    console.log('🎨 Enhanced HTML report generated successfully!');
    console.log(`📊 Report location: ${path.join(reportPath, 'index.html')}`);
    
    // Create additional CSS file for enhanced styling
    this.createCustomCSS(reportPath);
  }
  
  /**
   * Create custom CSS file for additional styling
   * @param reportPath - Path to the reports directory
   */
  private static createCustomCSS(reportPath: string): void {
    const cssContent = this.getCustomCSSContent();
    const cssPath = path.join(reportPath, 'custom-styles.css');
    
    fs.writeFileSync(cssPath, cssContent);
    console.log('✨ Custom CSS styles created');
  }

  /**
   * Get the page footer HTML content
   * @returns HTML string for page footer
   */
  private static getPageFooter(): string {
    return `
      <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-top: 30px;">
        <h4>🛍️ OpenCart Automation Framework</h4>
        <p style="margin: 10px 0;">
          <strong>Generated:</strong> ${new Date().toLocaleString()} <br>
          <strong>Framework:</strong> Playwright + Cucumber + TypeScript <br>
          <strong>Test Coverage:</strong> Multi-currency E-commerce Product Validation
        </p>
        <div style="margin-top: 15px; font-size: 0.9em;">
          <span style="margin: 0 15px;">✅ Desktop Products</span>
          <span style="margin: 0 15px;">💻 Laptop Products</span>
          <span style="margin: 0 15px;">📱 Phone Products</span>
        </div>
      </div>
    `;
  }

  /**
   * Get custom CSS content for enhanced styling
   * @returns CSS string
   */
  private static getCustomCSSContent(): string {
    return `
/* OpenCart Automation Custom Styles */
.navbar-brand { 
  color: #2c3e50 !important; 
  font-weight: bold; 
  font-size: 1.5em !important;
}

.feature-overview { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; 
  color: white !important;
  border-radius: 10px !important;
  padding: 15px !important;
  margin: 10px 0 !important;
}

.scenario-container { 
  border-radius: 8px !important; 
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important; 
  margin: 10px 0 !important;
  border: 1px solid #e9ecef !important;
}

.passed { 
  background-color: #d4edda !important; 
  border-left: 4px solid #28a745 !important;
}

.failed { 
  background-color: #f8d7da !important; 
  border-left: 4px solid #dc3545 !important;
}

.skipped { 
  background-color: #fff3cd !important; 
  border-left: 4px solid #ffc107 !important;
}

.feature-title {
  background: #6c757d !important;
  color: white !important;
  padding: 10px !important;
  border-radius: 5px !important;
  margin: 15px 0 !important;
}

.stats-panel {
  background: #f8f9fa !important;
  border-radius: 8px !important;
  padding: 15px !important;
  margin: 10px 0 !important;
  border: 1px solid #dee2e6 !important;
}

/* Additional enhancements */
.feature-header {
  background: linear-gradient(45deg, #f39c12, #e67e22) !important;
  color: white !important;
  font-weight: bold !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2) !important;
}

.scenario-passed {
  border-left: 5px solid #27ae60 !important;
}

.scenario-failed {
  border-left: 5px solid #e74c3c !important;
}

.test-summary {
  background: #ecf0f1 !important;
  border-radius: 10px !important;
  padding: 20px !important;
  margin: 20px 0 !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
}
`;
  }
}

// Auto-generate report if this file is run directly
if (require.main === module) {
  EnhancedReportGenerator.generateHTMLReport();
}