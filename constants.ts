
import { Signal, SignalStatus, SignalTag, SignalType } from './types';

const dateHoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const MOCK_SIGNALS: Signal[] = [];
