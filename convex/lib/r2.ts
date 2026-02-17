import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_CONFIG = {
    bucket: "convex-files",
    endpoint: "https://a35598b9adcf9d35aeff1bdc162ec979.r2.cloudflarestorage.com",
    accessKeyId: "842705659772b8ce5a553f12ac1d76f2",
    secretAccessKey: "ee4cdb8d880ee7e5d329efcb08327028fb07e56624dd30645fec35e08c7ba380",
};

export class R2Client {
    private client: S3Client;
    private bucket: string;
    private publicUrl: string;

    constructor() {
        this.client = new S3Client({
            region: "auto",
            endpoint: R2_CONFIG.endpoint,
            credentials: {
                accessKeyId: R2_CONFIG.accessKeyId,
                secretAccessKey: R2_CONFIG.secretAccessKey,
            },
        });
        this.bucket = R2_CONFIG.bucket;
        // Public URL for R2 bucket (usually set up in Cloudflare dashboard, 
        // often strict R2 buckets need a worker or public access enabled. 
        // Using the S3 endpoint for signed URLs or a custom domain if available.)
        // For now we will rely on Signed URLs or assume direct access if configured.
        // The endpoint provided is the S3 API endpoint.
        this.publicUrl = R2_CONFIG.endpoint.replace('r2.cloudflarestorage.com', 'r2.dev'); // This is a guess, usually we need a custom domain
    }

    async generateUploadUrl(key: string, contentType: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    }

    async getUrl(key: string) {
        // Generate a signed URL for reading
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    }
}

export const r2 = new R2Client();
