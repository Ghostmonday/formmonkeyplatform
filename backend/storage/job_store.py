# storage/job_store.py - Persistent job storage for document processing
# This module provides a scalable job storage solution to replace in-memory storage

import os
import json
from typing import Dict, Any, Optional, List, Union, Tuple
from datetime import datetime, timedelta

# Try to import aioredis, fall back gracefully if not available
try:
    import aioredis
    redis_available = True
except ImportError as e:
    print(f"Warning: aioredis not available ({e}). Using in-memory storage only.")
    aioredis = None
    redis_available = False

from shared.types import JobData, ProcessingStatus

# Flag to determine if we're using Redis or in-memory storage
USE_REDIS = os.environ.get("USE_REDIS", "false").lower() == "true" and redis_available
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
JOB_EXPIRATION = int(os.environ.get("JOB_EXPIRATION_HOURS", "24"))  # Hours to keep jobs

# Fallback in-memory store when Redis is not available
_in_memory_store: Dict[str, Dict[str, Any]] = {}

# Redis connection pool
_redis_pool = None

async def get_redis_pool():
    """Get or create Redis connection pool"""
    global _redis_pool
    if USE_REDIS and redis_available and _redis_pool is None:
        try:
            # Use aioredis v2 syntax with type ignore since we handle type safety at runtime
            if aioredis is not None:
                _redis_pool = aioredis.from_url(REDIS_URL)  # type: ignore
        except Exception as e:
            print(f"Failed to connect to Redis: {e}. Using in-memory storage.")
    return _redis_pool

async def close_redis_pool():
    """Close Redis connection pool if it exists"""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.close()
        _redis_pool = None

async def store_job(job_data: Union[JobData, Dict[str, Any]]) -> None:
    """
    Store job data in Redis or in-memory storage
    
    Args:
        job_data: Job data to store (JobData instance or dict)
    """
    # Convert to JobData if dict
    if isinstance(job_data, dict):
        job_data = JobData(**job_data)
    
    # Update the timestamp
    job_data.update_timestamp()
    
    # Get job ID and serialized data
    job_id: str = job_data.job_id
    serialized_data: str = job_data.model_dump_json()
    
    if USE_REDIS:
        pool = await get_redis_pool()
        if pool:
            try:
                # Store in Redis with expiration (aioredis v2 syntax)
                # Type annotation issues are avoided by using Any
                await pool.set(
                    f"job:{job_id}", 
                    serialized_data,
                    ex=int(timedelta(hours=JOB_EXPIRATION).total_seconds())
                )
                return
            except Exception as e:
                print(f"Redis storage error: {e}. Falling back to in-memory storage.")
    
    # Fallback to in-memory storage
    _in_memory_store[job_id] = json.loads(serialized_data)

async def get_job(job_id: str) -> Optional[JobData]:
    """
    Retrieve job data from Redis or in-memory storage
    
    Args:
        job_id: Unique job identifier
        
    Returns:
        JobData if found, None otherwise
    """
    if USE_REDIS:
        pool = await get_redis_pool()
        if pool:
            try:
                # Get from Redis
                job_data_bytes: Optional[Union[bytes, str]] = await pool.get(f"job:{job_id}")
                if job_data_bytes:
                    # Decode bytes to string for JSON parsing
                    job_data_str = job_data_bytes.decode('utf-8') if isinstance(job_data_bytes, bytes) else str(job_data_bytes)
                    return JobData.model_validate_json(job_data_str)
                return None
            except Exception as e:
                print(f"Redis retrieval error: {e}. Falling back to in-memory storage.")
    
    # Fallback to in-memory storage
    job_dict = _in_memory_store.get(job_id)
    return JobData(**job_dict) if job_dict else None

async def update_job(job_id: str, updates: Dict[str, Any]) -> Optional[JobData]:
    """
    Update specific fields in a job
    
    Args:
        job_id: Unique job identifier
        updates: Dict of fields to update
        
    Returns:
        Updated JobData if found, None otherwise
    """
    job_data = await get_job(job_id)
    if not job_data:
        return None
    
    # Update fields
    for key, value in updates.items():
        if hasattr(job_data, key):
            setattr(job_data, key, value)
    
    # Store updated job
    await store_job(job_data)
    return job_data

async def update_job_status(
    job_id: str, 
    status: ProcessingStatus, 
    progress: Optional[int] = None, 
    error: Optional[str] = None
) -> Optional[JobData]:
    """
    Update job status, progress and error
    
    Args:
        job_id: Unique job identifier
        status: New processing status
        progress: Optional progress percentage (0-100)
        error: Optional error message
        
    Returns:
        Updated JobData if found, None otherwise
    """
    updates: Dict[str, Any] = {"status": status}
    if progress is not None:
        updates["progress"] = progress
    if error is not None:
        updates["error"] = error
    
    return await update_job(job_id, updates)

async def delete_job(job_id: str) -> bool:
    """
    Delete a job from storage
    
    Args:
        job_id: Unique job identifier
        
    Returns:
        True if job was deleted, False otherwise
    """
    if USE_REDIS:
        pool = await get_redis_pool()
        if pool:
            try:
                # Delete from Redis
                result: Optional[int] = await pool.delete(f"job:{job_id}")
                # Redis delete returns the number of keys deleted
                # We convert to int to ensure type safety
                delete_count: int = 0
                if result is not None:
                    try:
                        delete_count = int(result)
                    except (TypeError, ValueError):
                        delete_count = 0
                return delete_count > 0
            except Exception as e:
                print(f"Redis deletion error: {e}. Falling back to in-memory storage.")
    
    # Fallback to in-memory storage
    if job_id in _in_memory_store:
        del _in_memory_store[job_id]
        return True
    return False

async def list_jobs(
    user_id: Optional[str] = None, 
    status: Optional[ProcessingStatus] = None, 
    limit: int = 100
) -> List[JobData]:
    """
    List jobs, optionally filtered by user_id and status
    
    Args:
        user_id: Optional user ID filter
        status: Optional status filter
        limit: Maximum number of jobs to return
        
    Returns:
        List of JobData objects
    """
    if USE_REDIS:
        pool = await get_redis_pool()
        if pool:
            try:
                # Scan Redis for matching keys
                jobs: List[JobData] = []
                cursor_val: int = 0
                pattern: str = "job:*"
                
                while True:
                    # Redis scan returns (cursor, keys) tuple as Any
                    # Type safety is handled through runtime checks
                    scan_result: Any = await pool.scan(cursor_val, match=pattern, count=100)
                    
                    # Safely handle the scan result
                    cursor_raw: Any = None
                    keys_raw: Any = None
                    
                    # Extract data based on the result type
                    if isinstance(scan_result, (list, tuple)):
                        try:
                            if len(scan_result) == 2:  # type: ignore
                                cursor_raw = scan_result[0]
                                keys_raw = scan_result[1]
                            else:
                                break
                        except (TypeError, ValueError, IndexError):
                            break
                    else:
                        break
                    
                    # Convert cursor to int safely
                    cursor_val = 0  # Reset to default
                    if cursor_raw is not None:
                        if isinstance(cursor_raw, bytes):
                            try:
                                cursor_val = int(cursor_raw.decode('utf-8'))
                            except (ValueError, UnicodeDecodeError):
                                cursor_val = 0
                        elif isinstance(cursor_raw, int):
                            cursor_val = cursor_raw
                        elif cursor_raw:  # Only try conversion if not None/empty
                            # Use a type ignore to handle cursor_raw since we're handling all cases at runtime
                            try:
                                cursor_val = int(str(cursor_raw))  # type: ignore
                            except (ValueError, TypeError):
                                cursor_val = 0
                    
                    # Process keys (could be bytes or strings)
                    if not isinstance(keys_raw, (list, tuple)):
                        break
                    
                    # Use index-based access instead of iterator
                    # to avoid "key_raw" typing issues
                    for i in range(len(keys_raw)):  # type: ignore
                        if len(jobs) >= limit:
                            break
                            
                        # Get the key and handle it safely
                        try:
                            # Use type ignore since we're checking types at runtime
                            item: Any = keys_raw[i]  # type: ignore
                            
                            # Decode key if it's bytes
                            key_str: str = ""
                            if isinstance(item, bytes):
                                try:
                                    key_str = item.decode('utf-8')
                                except UnicodeDecodeError:
                                    continue  # Skip invalid keys
                            elif item is not None:
                                key_str = str(item)  # type: ignore
                                
                            if not key_str:  # Skip empty keys
                                continue
                        except (IndexError, TypeError):
                            continue
                            
                        # Get job data
                        job_data_bytes: Optional[Union[bytes, str]] = await pool.get(key_str)
                        
                        if job_data_bytes:
                            try:
                                # Process job data safely
                                job_data_str: str
                                if isinstance(job_data_bytes, bytes):
                                    job_data_str = job_data_bytes.decode('utf-8')
                                else:
                                    job_data_str = str(job_data_bytes)
                                    
                                job = JobData.model_validate_json(job_data_str)
                                
                                # Apply filters
                                if user_id and job.user_id != user_id:
                                    continue
                                if status and job.status != status:
                                    continue
                                
                                jobs.append(job)
                            except Exception as e:
                                print(f"Error parsing job data: {e}")
                                continue
                    
                    if cursor_val == 0 or len(jobs) >= limit:
                        break
                
                return jobs
            except Exception as e:
                print(f"Redis list error: {e}. Falling back to in-memory storage.")
    
    # Fallback to in-memory storage
    jobs: List[JobData] = []
    for _, job_dict in _in_memory_store.items():
        if len(jobs) >= limit:
            break
            
        job = JobData(**job_dict)
        
        # Apply filters
        if user_id and job.user_id != user_id:
            continue
        if status and job.status != status:
            continue
        
        jobs.append(job)
    
    return jobs

async def cleanup_expired_jobs() -> int:
    """
    Clean up expired jobs (older than JOB_EXPIRATION hours)
    
    Returns:
        Number of jobs cleaned up
    """
    count = 0
    expiration_time = datetime.now() - timedelta(hours=JOB_EXPIRATION)
    
    if USE_REDIS:
        # Redis handles expiration automatically
        return 0
    
    # Clean up in-memory storage
    to_delete: List[str] = []
    for job_id, job_dict in _in_memory_store.items():
        try:
            updated_at = datetime.fromisoformat(job_dict.get("updated_at", ""))
            if updated_at < expiration_time:
                to_delete.append(job_id)
        except (ValueError, TypeError):
            # If date parsing fails, keep the job
            pass
    
    for job_id in to_delete:
        del _in_memory_store[job_id]
        count += 1
    
    return count
