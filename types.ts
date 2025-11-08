export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum SignalStatus {
  ACTIVE = 'active',
  ACHIEVED = 'achieved',
  CANCELED = 'canceled',
}

export enum SignalTag {
  FREE = 'free',
  VIP = 'vip',
  BOTH = 'both',
}

export interface Signal {
  id: string;
  symbol: string;
  type: SignalType;
  entry: number;
  stop_loss: number;
  take_profits: number[];
  confidence: number;
  tag: SignalTag;
  notes: string;
  created_at: string;
  status: SignalStatus;
}

export type Page = 'landing' | 'feed' | 'detail' | 'admin' | 'admin_dashboard';