import { BrowserAPIGateway, initializeBrowserAPIGateway } from './gateway';

let gatewayInstance: BrowserAPIGateway | null = null;

export function initializeGateway(firebaseApp: unknown, geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY) {
  gatewayInstance = initializeBrowserAPIGateway({
    firebaseApp,
    geminiApiKey,
    enableLogging: import.meta.env.DEV,
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
