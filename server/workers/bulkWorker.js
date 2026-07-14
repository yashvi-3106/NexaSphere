import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import logger from '../utils/logger.js';
import { bulkOperationsService, bulkOperationsQueue } from '../services/bulkOperationsService.js';
import { sendEmail } from '../services/emailService.js';

let connection;
if (process.env.REDIS_URL) {
  connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
}

export const bulkWorker =
  connection && bulkOperationsQueue
    ? new Worker(
        bulkOperationsQueue.name,
        async (job) => {
          if (job.name === 'import_users') {
            const { jobId, csvText, adminId } = job.data;
            logger.info(`[bulkWorker] Processing bulk import users job ${jobId}`);
            try {
              const result = await bulkOperationsService.processImportUsersJob(
                jobId,
                csvText,
                adminId
              );
              return result;
            } catch (err) {
              logger.error(`[bulkWorker] Error processing job ${jobId}: ${err.message}`);
              bulkOperationsService.updateJobProgress(
                jobId,
                0,
                [{ message: err.message }],
                'failed'
              );
              throw err;
            }
          } else if (job.name === 'send_welcome_email') {
            const { email, displayName, plainPassword } = job.data;
            logger.info(`[bulkWorker] Sending welcome email to ${email}`);
            try {
              await sendEmail({
                to: email,
                subject: 'Welcome to NexaSphere!',
                templateName: 'generic',
                data: {
                  name: displayName || 'Student',
                  message: `Your account has been created. You can log in using your email and this temporary password: ${plainPassword} \nPlease change it after your first login.`,
                },
              });
              return { sent: true };
            } catch (err) {
              logger.error(`[bulkWorker] Error sending welcome email to ${email}: ${err.message}`);
              throw err;
            }
          }
        },
        { connection }
      )
    : null;

if (bulkWorker) {
  bulkWorker.on('completed', (job) => {
    logger.info(`[bulkWorker] Job ${job.id} completed successfully.`);
  });
  bulkWorker.on('failed', (job, err) => {
    logger.error(`[bulkWorker] Job ${job.id} failed: ${err.message}`);
  });
}
