import { describe, it } from 'node:test';
import assert from 'node:assert';

import { parseDateTimeToUnix, formatUnixToDateTime } from '../dist/handlers/datetime.js';
import {
  downsample,
  humanizeDates,
  compactProtocols,
  compactProtocolTvl,
  compactPools,
} from '../dist/handlers/transform.js';

// 2024-01-01T00:00:00Z
const JAN_1_2024 = 1704067200;

describe('datetime parsing', () => {
  it('parses a 12-hour datetime as UTC by default', () => {
    assert.strictEqual(parseDateTimeToUnix('01/01/2024 12:00:00 AM'), JAN_1_2024);
  });

  it('accepts an explicit UTC suffix', () => {
    assert.strictEqual(parseDateTimeToUnix('01/01/2024 12:00 AM UTC'), JAN_1_2024);
  });

  it('converts a numeric offset to UTC', () => {
    // 05:00 at +05:00 is 00:00 UTC
    assert.strictEqual(parseDateTimeToUnix('01/01/2024 05:00:00 AM +05:00'), JAN_1_2024);
  });

  it('converts an IANA timezone to UTC', () => {
    // 7:00 PM Dec 31 in New York (UTC-5 in winter) is 00:00 UTC Jan 1
    assert.strictEqual(parseDateTimeToUnix('12/31/2023 07:00:00 PM America/New_York'), JAN_1_2024);
  });

  it('passes through UNIX seconds (number and string)', () => {
    assert.strictEqual(parseDateTimeToUnix(JAN_1_2024), JAN_1_2024);
    assert.strictEqual(parseDateTimeToUnix(String(JAN_1_2024)), JAN_1_2024);
  });

  it('throws a helpful error on garbage input', () => {
    assert.throws(() => parseDateTimeToUnix('not a date'), /Invalid date\/time/);
  });
});

describe('datetime formatting', () => {
  it('formats UNIX seconds as a UTC datetime string', () => {
    assert.strictEqual(formatUnixToDateTime(JAN_1_2024), '01/01/2024 12:00:00 AM UTC');
  });

  it('treats large values as milliseconds', () => {
    assert.strictEqual(formatUnixToDateTime(JAN_1_2024 * 1000), '01/01/2024 12:00:00 AM UTC');
  });
});

describe('humanizeDates', () => {
  it('converts date/timestamp fields and leaves others alone', () => {
    const out = humanizeDates({ date: JAN_1_2024, timestamp: JAN_1_2024, price: 1234.5, count: 7 });
    assert.strictEqual(out.date, '01/01/2024 12:00:00 AM UTC');
    assert.strictEqual(out.timestamp, '01/01/2024 12:00:00 AM UTC');
    assert.strictEqual(out.price, 1234.5);
    assert.strictEqual(out.count, 7);
  });

  it('recurses into nested arrays and objects', () => {
    const out = humanizeDates({ series: [{ date: JAN_1_2024, v: 1 }] });
    assert.strictEqual(out.series[0].date, '01/01/2024 12:00:00 AM UTC');
    assert.strictEqual(out.series[0].v, 1);
  });

  it('does not convert small numbers that happen to be named date', () => {
    const out = humanizeDates({ date: 100 });
    assert.strictEqual(out.date, 100);
  });
});

describe('downsample', () => {
  it('caps an array while keeping the first and last items', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const out = downsample(arr, 10);
    assert.strictEqual(out.length, 10);
    assert.strictEqual(out[0], 0);
    assert.strictEqual(out[out.length - 1], 99);
  });

  it('returns the array unchanged when already small enough', () => {
    const arr = [1, 2, 3];
    assert.deepStrictEqual(downsample(arr, 10), arr);
  });
});

describe('compactProtocols', () => {
  it('limits, sorts by TVL, and strips noisy fields', () => {
    const protocols = Array.from({ length: 200 }, (_, i) => ({
      name: `p${i}`,
      symbol: 'X',
      tvl: i,
      logo: 'https://example.com/logo.png',
      description: 'a'.repeat(500),
      audit_links: ['x', 'y'],
    }));
    const out = compactProtocols(protocols, { limit: 50 });
    assert.strictEqual(out.total, 200);
    assert.strictEqual(out.returned, 50);
    assert.strictEqual(out.protocols.length, 50);
    assert.strictEqual(out.protocols[0].tvl, 199); // sorted desc
    assert.strictEqual(out.protocols[0].logo, undefined);
    assert.strictEqual(out.protocols[0].description, undefined);
  });

  it('returns the raw array when full is set', () => {
    const protocols = [{ name: 'p', tvl: 1, logo: 'x' }];
    assert.deepStrictEqual(compactProtocols(protocols, { full: true }), protocols);
  });
});

describe('compactProtocolTvl size reduction', () => {
  function makeBigProtocol() {
    const series = Array.from({ length: 2000 }, (_, i) => ({
      date: JAN_1_2024 + i * 86400,
      totalLiquidityUSD: 1_000_000 + i,
    }));
    return {
      name: 'Hyperliquid',
      symbol: 'HYPE',
      url: 'https://app.hyperliquid.xyz',
      description: 'long description '.repeat(50),
      chains: ['Arbitrum', 'Hyperliquid L1'],
      currentChainTvls: { Arbitrum: 3404044146, 'Hyperliquid L1': 2241666381 },
      tvl: series,
      tokensInUsd: series.map(s => ({ date: s.date, tokens: { '0x1': 1, '0x2': 2 } })),
      tokens: series.map(s => ({ date: s.date, tokens: { '0x1': 1, '0x2': 2 } })),
      chainTvls: {
        Arbitrum: { tvl: series, tokens: series, tokensInUsd: series },
        'Hyperliquid L1': { tvl: series, tokens: series, tokensInUsd: series },
      },
    };
  }

  it('shrinks the payload by at least 90% by default', () => {
    const big = makeBigProtocol();
    const compact = compactProtocolTvl(big, {});
    const before = JSON.stringify(big).length;
    const after = JSON.stringify(compact).length;
    assert.ok(after < before * 0.1, `expected >=90% reduction, got ${(100 * after / before).toFixed(1)}%`);
  });

  it('drops token arrays and per-chain history, downsamples the series', () => {
    const compact = compactProtocolTvl(makeBigProtocol(), { points: 30 });
    assert.strictEqual(compact.tokens, undefined);
    assert.strictEqual(compact.tokensInUsd, undefined);
    assert.strictEqual(compact.chainTvls, undefined);
    assert.ok(Array.isArray(compact.tvl));
    assert.strictEqual(compact.tvl.length, 30);
    assert.deepStrictEqual(compact.currentChainTvls, { Arbitrum: 3404044146, 'Hyperliquid L1': 2241666381 });
  });

  it('includes token breakdowns when includeTokens is set', () => {
    const compact = compactProtocolTvl(makeBigProtocol(), { includeTokens: true, points: 10 });
    assert.ok(Array.isArray(compact.tokensInUsd));
    assert.strictEqual(compact.tokensInUsd.length, 10);
  });
});

describe('compactPools', () => {
  it('unwraps the data array, sorts by tvlUsd, and trims fields', () => {
    const data = {
      status: 'success',
      data: Array.from({ length: 100 }, (_, i) => ({
        pool: `id-${i}`,
        chain: 'Ethereum',
        project: 'aave',
        symbol: 'USDC',
        tvlUsd: i,
        apy: 3.2,
        underlyingTokens: ['0xabc', '0xdef'],
        rewardTokens: ['0x123'],
      })),
    };
    const out = compactPools(data, { limit: 10 });
    assert.strictEqual(out.total, 100);
    assert.strictEqual(out.returned, 10);
    assert.strictEqual(out.pools[0].tvlUsd, 99);
    assert.strictEqual(out.pools[0].underlyingTokens, undefined);
  });
});
