import {
    AuthenticationCreds,
    AuthenticationState,
    BufferJSON,
    initAuthCreds,
    SignalDataTypeMap,
    proto
} from '@whiskeysockets/baileys';
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand
} from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const s3 = new S3Client({
    region: env.AWS_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
    }
});

const bucketName = env.AWS_S3_BUCKET || '';

export const useS3AuthState = async (deviceId: string): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
    const prefix = `sessions/${deviceId}/`;

    const writeData = async (data: any, file: string) => {
        try {
            await s3.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: `${prefix}${file}.json`,
                Body: JSON.stringify(data, BufferJSON.replacer),
                ContentType: 'application/json'
            }));
        } catch (error) {
            logger.error(`[S3] Error writing to S3 (${prefix}${file}.json):`, error);
        }
    };

    const readData = async (file: string) => {
        try {
            const data = await s3.send(new GetObjectCommand({
                Bucket: bucketName,
                Key: `${prefix}${file}.json`
            }));
            const body = await data.Body?.transformToString();
            return JSON.parse(body || '', BufferJSON.reviver);
        } catch (error: any) {
            if (error.name !== 'NoSuchKey') {
                logger.error(`[S3] Error reading from S3 (${prefix}${file}.json):`, error);
            }
            return null;
        }
    };

    const removeData = async (file: string) => {
        try {
            await s3.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: `${prefix}${file}.json`
            }));
        } catch (error) {
            logger.error(`[S3] Error deleting from S3 (${prefix}${file}.json):`, error);
        }
    };

    const creds: AuthenticationCreds = await readData('creds') || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data: any) => {
                    const tasks: Promise<void>[] = [];
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id];
                            const file = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, file));
                            } else {
                                tasks.push(removeData(file));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
};

export const deleteS3Session = async (deviceId: string) => {
    if (!bucketName) return;
    const prefix = `sessions/${deviceId}/`;
    try {
        const listedObjects = await s3.send(new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix
        }));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

        const deleteParams = {
            Bucket: bucketName,
            Delete: { Objects: [] as any[] }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            if (Key) {
                deleteParams.Delete.Objects.push({ Key });
            }
        });

        await s3.send(new DeleteObjectsCommand(deleteParams));
        
        if (listedObjects.IsTruncated) {
            await deleteS3Session(deviceId);
        }
    } catch (error) {
        logger.error(`[S3] Error purging session files in S3 for ${deviceId}:`, error);
    }
};
