import os
import uuid
from abc import ABC, abstractmethod
from app.core.config import settings

class StorageProvider(ABC):
    @abstractmethod
    async def upload_file(self, file_content: bytes, filename: str) -> str:
        """
        Uploads a file and returns its publicly accessible URL.
        """
        pass

class LocalStorageProvider(StorageProvider):
    async def upload_file(self, file_content: bytes, filename: str) -> str:
        # Generate a unique file name to avoid collisions
        ext = os.path.splitext(filename)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        
        # Save to settings.UPLOAD_DIR
        file_path = os.path.join(settings.UPLOAD_DIR, unique_name)
        with open(file_path, "wb") as f:
            f.write(file_content)
            
        # Return relative URL that our Nginx/FastAPI serves
        return f"/api/v1/uploads/{unique_name}"

class CloudinaryProvider(StorageProvider):
    async def upload_file(self, file_content: bytes, filename: str) -> str:
        # If cloudinary SDK is not installed or variables missing, fall back to Local
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            # Upload file bytes directly
            res = cloudinary.uploader.upload(file_content)
            return res.get("secure_url", "")
        except Exception:
            # Fallback to local
            local_provider = LocalStorageProvider()
            return await local_provider.upload_file(file_content, filename)

class S3Provider(StorageProvider):
    async def upload_file(self, file_content: bytes, filename: str) -> str:
        try:
            import boto3
            s3 = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            ext = os.path.splitext(filename)[1]
            unique_name = f"{uuid.uuid4()}{ext}"
            
            s3.put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=unique_name,
                Body=file_content,
                ACL='public-read'
            )
            return f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{unique_name}"
        except Exception:
            # Fallback to local
            local_provider = LocalStorageProvider()
            return await local_provider.upload_file(file_content, filename)

def get_storage_provider() -> StorageProvider:
    provider = settings.STORAGE_PROVIDER.lower()
    if provider == "cloudinary" and settings.CLOUDINARY_CLOUD_NAME:
        return CloudinaryProvider()
    elif provider == "s3" and settings.AWS_STORAGE_BUCKET_NAME:
        return S3Provider()
    return LocalStorageProvider()
