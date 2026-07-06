import { getApiBase } from '../../utils/runtimeConfig';

export function buildGithubReposUrl(username, apiBase = getApiBase()) {
  const encodedUsername = encodeURIComponent(String(username || '').trim());
  const path = `/api/portfolio/github-repos/${encodedUsername}?sort=updated&per_page=30`;
  return apiBase ? `${apiBase}${path}` : path;
}
