"""
Project-wide structured logging configuration for FormMonkey.

This module sets up consistent, structured logging across all components of the
FormMonkey application, including correlation ID tracking, JSON formatting,
and integration with FastAPI middleware for comprehensive request tracing.

Logging configuration supports both console and file output based on
application configuration, with proper log rotation and retention policies.
"""

import logging
import logging.config
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from contextvars import ContextVar
import sys

# TODO [0]: Set up project-wide structured logging
# TODO [0.1]: Add correlation ID to each request log
# TODO [1]: Support logging to console and file (based on config)
# TODO [2]: Integrate with FastAPI middleware for request tracing
# TODO [3]: Include log formatter for timestamped, JSON-formatted logs

# Context variable for correlation ID tracking
correlation_id: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)

class CorrelationIDFilter(logging.Filter):
    """Filter to add correlation ID to log records."""
    
    def filter(self, record):
        record.correlation_id = correlation_id.get() or 'unknown'
        return True

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'correlation_id': getattr(record, 'correlation_id', 'unknown'),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'extra'):
            log_entry.update(record.extra)
        
        return json.dumps(log_entry)

def setup_logging(config: Dict[str, Any]) -> None:
    """
    Set up logging configuration based on provided config.
    
    Args:
        config: Logging configuration dictionary
    """
    log_level = config.get('log_level', 'INFO').upper()
    log_format = config.get('log_format', 'json')  # 'json' or 'text'
    log_to_file = config.get('log_to_file', False)
    log_file_path = config.get('log_file_path', 'formmonkey.log')
    
    # Create formatters
    if log_format == 'json':
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(correlation_id)s - %(message)s'
        )
    
    # Create handlers
    handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.addFilter(CorrelationIDFilter())
    handlers.append(console_handler)
    
    # File handler if requested
    if log_to_file:
        from logging.handlers import RotatingFileHandler
        file_handler = RotatingFileHandler(
            log_file_path,
            maxBytes=10_000_000,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        file_handler.addFilter(CorrelationIDFilter())
        handlers.append(file_handler)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level),
        handlers=handlers,
        force=True
    )
    
    # Set specific loggers
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('fastapi').setLevel(logging.INFO)
    
    logging.info(f"Logging configured - Level: {log_level}, Format: {log_format}, File: {log_to_file}")

def get_correlation_id() -> str:
    """Get current correlation ID or generate a new one."""
    current_id = correlation_id.get()
    if not current_id:
        current_id = str(uuid.uuid4())[:8]
        correlation_id.set(current_id)
    return current_id

def set_correlation_id(new_id: str) -> None:
    """Set correlation ID for current context."""
    correlation_id.set(new_id)

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with proper configuration."""
    return logging.getLogger(name)
