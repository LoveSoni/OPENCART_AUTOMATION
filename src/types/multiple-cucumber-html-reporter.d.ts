declare module 'multiple-cucumber-html-reporter' {
  interface BrowserInfo {
    name: string;
    version: string;
  }

  interface PlatformInfo {
    name: string;
    version: string;
  }

  interface MetadataInfo {
    browser: BrowserInfo;
    device: string;
    platform: PlatformInfo;
  }

  interface CustomDataItem {
    label: string;
    value: string;
  }

  interface CustomData {
    title: string;
    data: CustomDataItem[];
  }

  interface ReportOptions {
    jsonDir: string;
    reportPath: string;
    reportName?: string;
    pageTitle?: string;
    displayDuration?: boolean;
    displayReportTime?: boolean;
    hideMetadata?: boolean;
    metadata?: MetadataInfo;
    customData?: CustomData;
    customStyle?: string;
    pageFooter?: string;
  }

  export function generate(options: ReportOptions): void;
}