import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/services/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('StorageService.getRounds', () => {
  it('returns empty array when no rounds exist', async () => {
    expect(await StorageService.getRounds()).toEqual([]);
  });
});

describe('StorageService.startNewRound', () => {
  it('creates the first round with roundNumber 1', async () => {
    const round = await StorageService.startNewRound();
    expect(round.roundNumber).toBe(1);
    expect(round.endDate).toBeNull();
    expect(round.relapses).toEqual([]);
  });

  it('persists the round so getRounds returns it', async () => {
    const round = await StorageService.startNewRound();
    const rounds = await StorageService.getRounds();
    expect(rounds).toHaveLength(1);
    expect(rounds[0].id).toBe(round.id);
  });

  it('creates round 2 with roundNumber 2 and keeps round 1', async () => {
    await StorageService.startNewRound();
    const round2 = await StorageService.startNewRound();
    const rounds = await StorageService.getRounds();
    expect(rounds).toHaveLength(2);
    expect(round2.roundNumber).toBe(2);
  });
});

describe('StorageService.saveRelapse', () => {
  it('adds a relapse event to the correct round', async () => {
    const round = await StorageService.startNewRound();
    const event = { timestamp: new Date().toISOString(), relapseCountThatDay: 1 };
    await StorageService.saveRelapse(round.id, event);
    const rounds = await StorageService.getRounds();
    expect(rounds[0].relapses).toHaveLength(1);
    expect(rounds[0].relapses[0].relapseCountThatDay).toBe(1);
  });

  it('appends multiple relapses in order', async () => {
    const round = await StorageService.startNewRound();
    await StorageService.saveRelapse(round.id, { timestamp: new Date().toISOString(), relapseCountThatDay: 1 });
    await StorageService.saveRelapse(round.id, { timestamp: new Date().toISOString(), relapseCountThatDay: 2 });
    const rounds = await StorageService.getRounds();
    expect(rounds[0].relapses).toHaveLength(2);
    expect(rounds[0].relapses[1].relapseCountThatDay).toBe(2);
  });
});

describe('StorageService.completeRound', () => {
  it('sets endDate on the round', async () => {
    const round = await StorageService.startNewRound();
    const endDate = new Date().toISOString();
    await StorageService.completeRound(round.id, endDate);
    const rounds = await StorageService.getRounds();
    expect(rounds[0].endDate).toBe(endDate);
  });
});

describe('StorageService check-ins', () => {
  it('returns empty array when no check-ins exist', async () => {
    expect(await StorageService.getCheckIns()).toEqual([]);
  });

  it('saves and retrieves a check-in', async () => {
    await StorageService.saveCheckIn({ date: '2026-04-14', mood: 'strong', note: 'Good day' });
    const checkIns = await StorageService.getCheckIns();
    expect(checkIns).toHaveLength(1);
    expect(checkIns[0]).toEqual({ date: '2026-04-14', mood: 'strong', note: 'Good day' });
  });

  it('overwrites an existing check-in for the same date', async () => {
    await StorageService.saveCheckIn({ date: '2026-04-14', mood: 'struggling' });
    await StorageService.saveCheckIn({ date: '2026-04-14', mood: 'strong', note: 'Recovered' });
    const checkIns = await StorageService.getCheckIns();
    expect(checkIns).toHaveLength(1);
    expect(checkIns[0].mood).toBe('strong');
  });
});

describe('StorageService.createRoundWithDate', () => {
  it('creates a round anchored to the given startDate', async () => {
    const startDate = '2026-01-01T00:00:00.000Z';
    const round = await StorageService.createRoundWithDate(startDate);
    expect(round.startDate).toBe(startDate);
    expect(round.roundNumber).toBe(1);
    expect(round.endDate).toBeNull();
    expect(round.relapses).toEqual([]);
  });

  it('persists the round so getRounds returns it', async () => {
    const round = await StorageService.createRoundWithDate('2026-01-01T00:00:00.000Z');
    const rounds = await StorageService.getRounds();
    expect(rounds).toHaveLength(1);
    expect(rounds[0].id).toBe(round.id);
  });

  it('increments roundNumber when prior rounds exist', async () => {
    await StorageService.startNewRound();
    const round = await StorageService.createRoundWithDate('2026-06-01T00:00:00.000Z');
    expect(round.roundNumber).toBe(2);
  });
});

describe('StorageService.clearAllData', () => {
  it('wipes rounds and check-ins', async () => {
    await StorageService.startNewRound();
    await StorageService.saveCheckIn({ date: '2026-04-14', mood: 'neutral' });
    await StorageService.clearAllData();
    expect(await StorageService.getRounds()).toEqual([]);
    expect(await StorageService.getCheckIns()).toEqual([]);
  });
});
