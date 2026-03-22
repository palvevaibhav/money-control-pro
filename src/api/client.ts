import { BrowserAPIGateway, initializeBrowserAPIGateway } from './gateway';

let gatewayInstance: BrowserAPIGateway | null = null;

export function initializeGateway(firebaseApp: any) {
  gatewayInstance = initializeBrowserAPIGateway({
    firebaseApp,
    geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY,
    enableLogging: process.env.NODE_ENV === 'development',
  });
  return gatewayInstance;
}

export function getGateway(): BrowserAPIGateway {
  if (!gatewayInstance) {
    throw new Error('Gateway not initialized. Call initializeGateway first.');
  }
  return gatewayInstance;
}

export * from './gateway';
export * from './hooks';
