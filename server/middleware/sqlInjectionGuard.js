const BOOLEAN_OPERATOR_PATTERN = /(\b(OR|AND)\b\s+\d+\s*[=<>])/i;

const SQL_INJECTION_PATTERNS = [
  /([';])\s*(--|#|\/\*)/,
  /(\b(LOAD_FILE|INTO_OUTFILE|INTO_DUMPFILE|BENCHMARK|SLEEP|WAITFOR)\b)/i,
  /(\bINFORMATION_SCHEMA\b)/i,
];

function maskQuotedLiterals(value) {
  let masked = '';

  for (let i = 0; i < value.length; i += 1) {
    const quote = value[i];

    if (quote !== "'" && quote !== '"' && quote !== '`') {
      masked += quote;
      continue;
    }

    let end = -1;
    for (let j = i + 1; j < value.length; j += 1) {
      if (value[j] === '\\') {
        j += 1;
        continue;
      }

      if (value[j] === quote && value[j + 1] === quote) {
        j += 1;
        continue;
      }

      if (value[j] === quote) {
        end = j;
        break;
      }
    }

    if (end === -1) {
      masked += quote;
      continue;
    }

    masked += ' '.repeat(end - i + 1);
    i = end;
  }

  return masked;
}

function hasSqliPattern(value) {
  if (typeof value === 'string') {
    return (
      BOOLEAN_OPERATOR_PATTERN.test(maskQuotedLiterals(value)) ||
      SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value))
    );
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some((v) => hasSqliPattern(v));
  }
  return false;
}

export function sqlInjectionGuard(req, res, next) {
  const suspicious = [];

  // Check query parameters
  if (req.query && hasSqliPattern(req.query)) {
    suspicious.push('query');
  }

  // Check body
  if (req.body && hasSqliPattern(req.body)) {
    suspicious.push('body');
  }

  // Check params
  if (req.params && hasSqliPattern(req.params)) {
    suspicious.push('params');
  }

  if (suspicious.length > 0) {
    console.warn(
      `[SQLI-GUARD] Blocked request from ${req.ip} - suspicious patterns in: ${suspicious.join(', ')}`
    );
    return res.status(400).json({ error: 'Request contains invalid patterns' });
  }

  next();
}
