import { describe, expect, test } from 'vitest';
import { formatRelativeTime } from '../formatRelativeTime.js';

describe('formatRelativeTime utility', () => {
  describe('recent timestamps', () => {
    test('returns "Just now" for timestamps less than 60 seconds ago', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 30 * 1000)).toBe('Just now');
      expect(formatRelativeTime(now - 59 * 1000)).toBe('Just now');
    });

    test('returns "Just now" for current timestamp', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('Just now');
    });
  });

  describe('minutes ago', () => {
    test('returns minutes ago for timestamps between 1 minute and 1 hour ago', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 60 * 1000)).toBe('1m ago');
      expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe('5m ago');
      expect(formatRelativeTime(now - 30 * 60 * 1000)).toBe('30m ago');
      expect(formatRelativeTime(now - 59 * 60 * 1000)).toBe('59m ago');
    });
  });

  describe('hours ago', () => {
    test('returns hours ago for timestamps between 1 hour and 1 day ago', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 3600 * 1000)).toBe('1h ago');
      expect(formatRelativeTime(now - 5 * 3600 * 1000)).toBe('5h ago');
      expect(formatRelativeTime(now - 12 * 3600 * 1000)).toBe('12h ago');
      expect(formatRelativeTime(now - 23 * 3600 * 1000)).toBe('23h ago');
    });
  });

  describe('days ago', () => {
    test('returns days ago for timestamps between 1 day and 1 week ago', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 86400 * 1000)).toBe('1d ago');
      expect(formatRelativeTime(now - 3 * 86400 * 1000)).toBe('3d ago');
      expect(formatRelativeTime(now - 6 * 86400 * 1000)).toBe('6d ago');
    });
  });

  describe('weeks ago', () => {
    test('returns weeks ago for timestamps older than 1 week', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 604800 * 1000)).toBe('1w ago');
      expect(formatRelativeTime(now - 2 * 604800 * 1000)).toBe('2w ago');
      expect(formatRelativeTime(now - 4 * 604800 * 1000)).toBe('4w ago');
    });
  });

  describe('future timestamps', () => {
    test('returns weeks ago for future timestamps', () => {
      const now = Date.now();
      expect(formatRelativeTime(now + 60 * 1000)).toBe('0w ago');
      expect(formatRelativeTime(now + 3600 * 1000)).toBe('0w ago');
      expect(formatRelativeTime(now + 86400 * 1000)).toBe('0w ago');
    });
  });

  describe('null and undefined input', () => {
    test('returns "Unknown time" for null', () => {
      expect(formatRelativeTime(null)).toBe('Unknown time');
    });

    test('returns "Unknown time" for undefined', () => {
      expect(formatRelativeTime(undefined)).toBe('Unknown time');
    });

    test('returns "Unknown time" for empty string', () => {
      expect(formatRelativeTime('')).toBe('Unknown time');
    });

    test('returns "Unknown time" for 0', () => {
      expect(formatRelativeTime(0)).toBe('Unknown time');
    });

    test('returns "Unknown time" for false', () => {
      expect(formatRelativeTime(false)).toBe('Unknown time');
    });
  });

  describe('invalid timestamp values', () => {
    test('returns "Unknown time" for invalid date string', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Unknown time');
      expect(formatRelativeTime('not a date')).toBe('Unknown time');
    });

    test('returns "Unknown time" for NaN', () => {
      expect(formatRelativeTime(NaN)).toBe('Unknown time');
    });

    test('returns "Unknown time" for Infinity', () => {
      expect(formatRelativeTime(Infinity)).toBe('Unknown time');
    });

    test('returns "Unknown time" for negative Infinity', () => {
      expect(formatRelativeTime(-Infinity)).toBe('Unknown time');
    });

    test('returns "Unknown time" for object', () => {
      expect(formatRelativeTime({})).toBe('Unknown time');
    });

    test('returns "Unknown time" for array', () => {
      expect(formatRelativeTime([])).toBe('Unknown time');
    });
  });

  describe('valid input formats', () => {
    test('accepts ISO string timestamp', () => {
      const now = new Date();
      const isoString = now.toISOString();
      expect(formatRelativeTime(isoString)).toBe('Just now');
    });

    test('accepts Unix timestamp in seconds', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    test('accepts Unix timestamp in milliseconds', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    test('accepts Date object', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });
  });

  describe('boundary cases', () => {
    test('handles boundary between seconds and minutes', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 59 * 1000)).toBe('Just now');
      expect(formatRelativeTime(now - 60 * 1000)).toBe('1m ago');
    });

    test('handles boundary between minutes and hours', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 3599 * 1000)).toBe('59m ago');
      expect(formatRelativeTime(now - 3600 * 1000)).toBe('1h ago');
    });

    test('handles boundary between hours and days', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 86399 * 1000)).toBe('23h ago');
      expect(formatRelativeTime(now - 86400 * 1000)).toBe('1d ago');
    });

    test('handles boundary between days and weeks', () => {
      const now = Date.now();
      expect(formatRelativeTime(now - 604799 * 1000)).toBe('6d ago');
      expect(formatRelativeTime(now - 604800 * 1000)).toBe('1w ago');
    });
  });
});
