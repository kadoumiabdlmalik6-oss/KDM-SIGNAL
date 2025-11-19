
import { Signal, SignalStatus, SignalTag, SignalType } from './types';

const dateHoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const MOCK_SIGNALS: Signal[] = [
  {
    id: 'sig_xauusd_vip_001',
    symbol: 'XAUUSD',
    type: SignalType.BUY,
    entry: 4010,
    stop_loss: 4000,
    take_profits: [4100, 4200, 63000],
    confidence: 0.78,
    tag: SignalTag.VIP,
    notes: 'تحليل يعتمد على تلاقي دعم EMA50 مع منطقة الطلب.',
    created_at: dateHoursAgo(2),
    status: SignalStatus.ACTIVE,
  }
];
