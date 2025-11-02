"""
S3 Service for handling file uploads to AWS S3
"""
import boto3
from botocore.exceptions import ClientError
from typing import BinaryIO
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class S3Service:
    """Service for interacting with AWS S3"""
    
    def __init__(self):
        """Initialize S3 client with credentials from settings"""
        try:
            self.s3_client = boto3.client(
                's3',
                region_name=settings.S3_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            self.bucket_name = settings.S3_BUCKET_NAME
            logger.info(f"S3 Service initialized for bucket: {self.bucket_name}")
        except Exception as e:
            logger.error(f"Error initializing S3 client: {e}")
            raise
    
    def upload_file(
        self,
        file_obj: BinaryIO,
        object_name: str,
        content_type: str = "image/jpeg"
    ) -> str:
        """
        Upload a file to S3 bucket
        
        Args:
            file_obj: File object to upload
            object_name: S3 object name (key/path in bucket)
            content_type: MIME type of the file
            
        Returns:
            str: S3 key (path) of the uploaded file
            
        Raises:
            Exception: If upload fails
        """
        try:
            # Upload file to S3 (sin ACL público - bucket es privado)
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_name,
                ExtraArgs={
                    'ContentType': content_type,
                    'ServerSideEncryption': 'AES256'  # Encriptación del lado del servidor
                }
            )
            
            logger.info(f"File uploaded successfully to S3: {object_name}")
            # Retornar solo la key, no la URL pública
            return object_name
            
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during S3 upload: {e}")
            raise
    
    def get_presigned_url(
        self,
        object_name: str,
        expiration: int = 3600
    ) -> str:
        """
        Generate a presigned URL for temporary access to a file
        
        Args:
            object_name: S3 object name (key/path in bucket)
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            str: Presigned URL for accessing the file
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_name
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
    
    def get_object_url(self, object_name: str) -> str:
        """
        Get the S3 URL (key path) for an object
        This is not a public URL, but the S3 key that can be used to generate presigned URLs
        
        Args:
            object_name: S3 object name (key/path in bucket)
            
        Returns:
            str: S3 key path
        """
        return object_name
    
    def delete_file(self, object_name: str) -> bool:
        """
        Delete a file from S3 bucket
        
        Args:
            object_name: S3 object name (key/path in bucket)
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            logger.info(f"File deleted successfully: {object_name}")
            return True
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False


# Singleton instance
s3_service = S3Service()
