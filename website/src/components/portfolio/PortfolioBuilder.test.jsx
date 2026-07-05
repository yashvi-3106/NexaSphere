import { describe, expect, it } from 'vitest';
import { buildGithubReposUrl } from './githubReposConfig';

describe('PortfolioBuilder GitHub repository fetch config', () => {
  it('builds a backend API URL instead of calling api.github.com from the browser', () => {
    const url = buildGithubReposUrl('octocat', '');

    expect(url).toBe('/api/portfolio/github-repos/octocat?sort=updated&per_page=30');
    expect(url).not.toContain('api.github.com');
  });

  it('uses the configured API base when one is available', () => {
    const url = buildGithubReposUrl('octo-cat', 'https://api.nexasphere.test');

    expect(url).toBe(
      'https://api.nexasphere.test/api/portfolio/github-repos/octo-cat?sort=updated&per_page=30'
    );
  });
});
