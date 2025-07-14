import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_CONFIG } from '../config/s3';

class S3Service {
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key
      });
      
      await s3Client.send(command);
      console.log(`File deleted from S3: ${key}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  async getFileInfo(key: string): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key
      });
      
      const response = await s3Client.send(command);
      
      return {
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error getting file info from S3:', error);
      throw new Error('File not found in S3');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key
      });
      
      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  getPublicUrl(key: string): string {
    return `https://${S3_CONFIG.BUCKET_NAME}.s3.${S3_CONFIG.REGION}.amazonaws.com/${key}`;
  }

  generateFileKey(mimetype: string, filename: string): string {
    const folder = mimetype.startsWith('image/') ? S3_CONFIG.IMAGES_FOLDER : S3_CONFIG.VIDEOS_FOLDER;
    return `${folder}${filename}`;
  }
}

export default new S3Service();