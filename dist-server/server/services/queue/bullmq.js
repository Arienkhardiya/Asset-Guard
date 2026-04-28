import { Queue, Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();
let scanQueue;
let actionQueue;
let initializeWorkers;
if (process.env.REDIS_ENABLED === 'true') {
    // Real Redis + BullMQ
    const IORedis = (await import('ioredis')).default;
    const redisUrl = process.env.REDIS_URL;
    const connection = new IORedis(redisUrl || 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn('Redis connection failed. Running in mock queue mode (no background processing).');
                return null;
            }
            return Math.min(times * 50, 2000);
        }
    });
    connection.on('error', (err) => {
        console.warn('Redis connection issue, safely ignoring:', err.message);
    });
    scanQueue = new Queue('scanQueue', { connection });
    actionQueue = new Queue('actionQueue', { connection });
    initializeWorkers = () => {
        const scanWorker = new Worker('scanQueue', async (job) => {
            console.log(`Processing scan job ${job.id} for tenant: ${job.data.tenantId}`);
            await new Promise(r => setTimeout(r, 2000));
            return { status: 'COMPLETED' };
        }, { connection });
        scanWorker.on('failed', (job, err) => {
            console.error(`Scan job ${job?.id} failed:`, err);
        });
        return { scanWorker };
    };
}
else {
    // Redis disabled — stub queues so the rest of the app doesn't crash
    console.log('Redis disabled (REDIS_ENABLED != true). Using no-op queue stubs.');
    const noop = async (..._args) => ({ id: 'mock-job' });
    scanQueue = { add: noop };
    actionQueue = { add: noop };
    initializeWorkers = () => ({});
}
export { scanQueue, actionQueue, initializeWorkers };
