import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

class SlackReporter implements Reporter {
  private failedTests: string[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests.push(test.title);
    }
  }

  async onEnd(result: FullResult) {
    if (result.status === 'failed' && process.env.SLACK_WEBHOOK_URL) {
      const message = {
        text: `🚨 *Visual Regression Tests Failed!*\n\nThe following visual snapshots detected unintended changes:\n- ${this.failedTests.join('\n- ')}\n\nPlease review the visual-regression-report artifact in GitHub Actions.`,
      };

      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        console.log('Slack alert sent successfully.');
      } catch (err) {
        console.error('Failed to send Slack alert:', err);
      }
    }
  }
}

export default SlackReporter;
