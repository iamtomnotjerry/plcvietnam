export type IntegrationStatusLevel = 'ok' | 'warn' | 'error' | 'info';

export type IntegrationStatusItem = {
  id: string;
  level: IntegrationStatusLevel;
  liveCheck: boolean;
  liveOk?: boolean;
  detailCodes: string[];
};

export type IntegrationHealthReport = {
  checkedAt: string;
  nodeEnv: string;
  vercel: boolean;
  items: IntegrationStatusItem[];
};
