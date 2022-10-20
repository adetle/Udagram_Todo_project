import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)

// Implement the fileStorage logic
const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
  static bucketName = process.env.ATTACHMENT_S3_BUCKET

  constructor(
    private readonly s3Client = createS3Client(),
    // private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {
  }

  async getUploadUrl(imageId: string) {
    logger.info("Getting a presigned url");
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: AttachmentUtils.bucketName,
      Key: imageId,
      Expires: 300,
    })
  }

}

function createS3Client() {
  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}