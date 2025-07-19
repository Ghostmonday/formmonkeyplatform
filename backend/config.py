"""
Claude, implement the centralized configuration management system for FormMonkey backend.

Configuration Domains:
- Environment detection (development, staging, production) with appropriate defaults
- File processing: size limits, allowed types, storage paths, retention policies
- AI/ML models: local model paths, remote API configurations, fallback chains
- Database: connection strings, pool sizes, migration settings
- Security: API keys, JWT secrets, encryption keys, CORS policies
- Compliance: data retention periods, audit log settings, PII handling rules
- External integrations: DocuSign, HelloSign, cloud storage credentials

Dependencies & Integration:
- Consumed by main.py via get_settings() function for app configuration
- Used by all routers/ files for validation limits and API configurations
- Referenced by services/ai_assistance.py for model provider settings
- Imported by services/storage_service.py for storage path and retention policies
- Used by compliance/audit_log.py for logging configuration
- Shared with shared/constants.ts for cross-platform configuration consistency

Architecture Requirements:
- Environment-based configuration inheritance (dev → staging → prod)
- Secrets management with proper isolation (never log sensitive values)
- Runtime validation of critical settings with helpful error messages
- Support for configuration hot-reloading in development
- Modular structure allowing services to import only needed config sections
- Type-safe configuration with proper defaults and validation

Privacy & Security:
- All PII-related settings clearly documented and privacy-safe by default
- Encryption settings for data at rest and in transit
- Audit log configuration with configurable detail levels
- Rate limiting and security thresholds
- Compliance flags for different regulatory requirements (GDPR, CCPA, etc.)

Structure should be easily extensible for new services while maintaining backwards compatibility.
"""

# TODO [0]: Provide project-level constants via os.getenv()
# TODO [0.1]: Load env vars with fallback to default.env file
# TODO [0.2]: Implement singleton pattern for config instance
# TODO [1]: Support for dev vs prod config switching
# TODO [1.1]: Add retry logic for database connection testing
# TODO [1.2]: Define fallback model sequence priority
# TODO [2]: Should be consumed by all routers + services (esp. file limits, model paths)
# TODO [2.1]: Validate directory existence on startup
# TODO [2.2]: Check write permissions for upload/temp folders
# TODO [2.3]: Ensure JWT secret is 32+ chars minimum
# TODO [2.4]: Parse CORS origins as array from string
