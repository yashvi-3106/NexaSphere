const BAD_WORDS = ['crap', 'damn', 'hell', 'abuse', 'fuck', 'shit', 'asshole', 'bastard'];

export function filterProfanity(text) {
  if (typeof text !== 'string') return text;
  let filtered = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
}

export function profanityFilterMiddleware(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = filterProfanity(req.body[key]);
      }
    }
  }
  next();
}
