import { describe, expect, test } from 'vitest';
import { isSafeHref, safeHref } from '../safeHref.js';

describe('safeHref utility', () => {
  describe('isSafeHref', () => {
    describe('safe URLs', () => {
      test('accepts https URLs', () => {
        expect(isSafeHref('https://example.com')).toBe(true);
        expect(isSafeHref('https://example.com/path')).toBe(true);
        expect(isSafeHref('https://example.com/path?query=value')).toBe(true);
      });

      test('accepts http URLs', () => {
        expect(isSafeHref('http://example.com')).toBe(true);
        expect(isSafeHref('http://example.com/path')).toBe(true);
      });

      test('accepts root-relative paths', () => {
        expect(isSafeHref('/')).toBe(true);
        expect(isSafeHref('/about')).toBe(true);
        expect(isSafeHref('/about/team')).toBe(true);
        expect(isSafeHref('/path?query=value')).toBe(true);
      });

      test('accepts URLs with whitespace (trims internally)', () => {
        expect(isSafeHref('  https://example.com  ')).toBe(true);
        expect(isSafeHref('  /about  ')).toBe(true);
      });

      test('accepts mixed case protocols', () => {
        expect(isSafeHref('HTTPS://example.com')).toBe(true);
        expect(isSafeHref('HTTP://example.com')).toBe(true);
      });
    });

    describe('unsafe URLs', () => {
      test('rejects javascript: protocol', () => {
        expect(isSafeHref('javascript:alert(1)')).toBe(false);
        expect(isSafeHref('javascript:void(0)')).toBe(false);
        expect(isSafeHref('JAVASCRIPT:alert(1)')).toBe(false);
      });

      test('rejects data: protocol', () => {
        expect(isSafeHref('data:text/html,<script>alert(1)</script>')).toBe(false);
        expect(isSafeHref('data:image/png;base64,...')).toBe(false);
        expect(isSafeHref('DATA:text/html,...')).toBe(false);
      });

      test('rejects vbscript: protocol', () => {
        expect(isSafeHref('vbscript:msgbox("test")')).toBe(false);
        expect(isSafeHref('VBSCRIPT:msgbox("test")')).toBe(false);
      });

      test('rejects file: protocol', () => {
        expect(isSafeHref('file:///etc/passwd')).toBe(false);
        expect(isSafeHref('FILE:///etc/passwd')).toBe(false);
      });

      test('rejects about: protocol', () => {
        expect(isSafeHref('about:blank')).toBe(false);
        expect(isSafeHref('about:config')).toBe(false);
      });

      test('rejects chrome: protocol', () => {
        expect(isSafeHref('chrome://settings')).toBe(false);
        expect(isSafeHref('CHROME://settings')).toBe(false);
      });

      test('rejects jar: protocol', () => {
        expect(isSafeHref('jar:file:///path.jar!/')).toBe(false);
      });

      test('rejects mocha: protocol', () => {
        expect(isSafeHref('mocha:test')).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('rejects empty string', () => {
        expect(isSafeHref('')).toBe(false);
      });

      test('rejects whitespace-only strings', () => {
        expect(isSafeHref('   ')).toBe(false);
        expect(isSafeHref('\t\n')).toBe(false);
      });

      test('rejects null', () => {
        expect(isSafeHref(null)).toBe(false);
      });

      test('rejects undefined', () => {
        expect(isSafeHref(undefined)).toBe(false);
      });

      test('rejects non-string types', () => {
        expect(isSafeHref(123)).toBe(false);
        expect(isSafeHref({})).toBe(false);
        expect(isSafeHref([])).toBe(false);
        expect(isSafeHref(true)).toBe(false);
      });

      test('rejects malformed URLs', () => {
        expect(isSafeHref('not-a-url')).toBe(false);
        expect(isSafeHref('://example.com')).toBe(false);
        expect(isSafeHref('ftp://example.com')).toBe(false);
        expect(isSafeHref('//example.com')).toBe(false);
      });

      test('rejects URLs exceeding maximum length', () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(2048);
        expect(isSafeHref(longUrl)).toBe(false);
      });

      test('accepts URLs at maximum length boundary', () => {
        const url = 'https://example.com/' + 'a'.repeat(2048 - 19);
        expect(isSafeHref(url)).toBe(true);
      });
    });
  });

  describe('safeHref', () => {
    describe('safe URLs', () => {
      test('returns trimmed URL for safe https URLs', () => {
        expect(safeHref('https://example.com')).toBe('https://example.com');
        expect(safeHref('  https://example.com  ')).toBe('https://example.com');
      });

      test('returns trimmed URL for safe http URLs', () => {
        expect(safeHref('http://example.com')).toBe('http://example.com');
        expect(safeHref('  http://example.com  ')).toBe('http://example.com');
      });

      test('returns trimmed URL for root-relative paths', () => {
        expect(safeHref('/about')).toBe('/about');
        expect(safeHref('  /about  ')).toBe('/about');
      });

      test('returns trimmed URL for root path', () => {
        expect(safeHref('/')).toBe('/');
        expect(safeHref('  /  ')).toBe('/');
      });
    });

    describe('unsafe URLs', () => {
      test('returns null for javascript: protocol', () => {
        expect(safeHref('javascript:alert(1)')).toBeNull();
      });

      test('returns null for data: protocol', () => {
        expect(safeHref('data:text/html,...')).toBeNull();
      });

      test('returns null for vbscript: protocol', () => {
        expect(safeHref('vbscript:msgbox("test")')).toBeNull();
      });

      test('returns null for file: protocol', () => {
        expect(safeHref('file:///etc/passwd')).toBeNull();
      });

      test('returns null for malformed URLs', () => {
        expect(safeHref('not-a-url')).toBeNull();
        expect(safeHref('ftp://example.com')).toBeNull();
      });
    });

    describe('edge cases', () => {
      test('returns null for empty string', () => {
        expect(safeHref('')).toBeNull();
      });

      test('returns null for whitespace-only strings', () => {
        expect(safeHref('   ')).toBeNull();
      });

      test('returns null for null', () => {
        expect(safeHref(null)).toBeNull();
      });

      test('returns null for undefined', () => {
        expect(safeHref(undefined)).toBeNull();
      });

      test('returns null for non-string types', () => {
        expect(safeHref(123)).toBeNull();
        expect(safeHref({})).toBeNull();
        expect(safeHref([])).toBeNull();
        expect(safeHref(true)).toBeNull();
      });

      test('returns null for URLs exceeding maximum length', () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(2048);
        expect(safeHref(longUrl)).toBeNull();
      });
    });
  });
});
