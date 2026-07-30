import os
import logging
import boto3
from botocore.exceptions import ClientError
from typing import Optional, Tuple

logger = logging.getLogger("lpres.s3")

def get_s3_client():
    aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region_name = os.getenv("AWS_REGION", "us-east-1")

    if aws_access_key and aws_secret_key:
        return boto3.client(
            "s3",
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region_name
        )
    return boto3.client("s3", region_name=region_name)


def upload_file_to_s3(
    file_bytes: bytes,
    object_name: str,
    content_type: str = "image/jpeg"
) -> Tuple[bool, str]:
    """
    Uploads a file buffer to AWS S3 bucket.
    Returns (success: bool, url_or_error: str).
    """
    bucket_name = os.getenv("S3_BUCKET_NAME", "lpres-intelligence-docs-dev")
    s3_client = get_s3_client()
    
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=file_bytes,
            ContentType=content_type
        )
        url = f"https://{bucket_name}.s3.amazonaws.com/{object_name}"
        logger.info(f"Successfully uploaded {object_name} to S3 bucket {bucket_name}")
        return True, url
    except ClientError as e:
        logger.error(f"S3 Upload Error: {e}")
        return False, str(e)
