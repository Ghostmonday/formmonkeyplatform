/**
Claude, seed this file with base prompt templates used by the AI assistance layer.

Purpose:
- Centralize system and user prompts for GPT-style interactions
- Examples: prompt for field inference, clause suggestion, autofill

Dependencies & Integration:
- Primary consumer: backend/services/ai_assistance.py for all AI model interactions
- Used by backend/routers/parse.py for context-aware field suggestions
- Referenced by backend/services/parser_engine.py for semantic analysis prompts
- Imported by backend/config.py for prompt versioning and environment-specific templates
- Supports integration with multiple AI providers (OpenAI, Anthropic, local models)

Prompt Management:
- Version control for prompt templates with A/B testing support
- Environment-specific prompts (development vs production)
- Localization support for multi-language legal contexts
- Template parameterization for dynamic content injection
- Prompt performance tracking and optimization

Structure:
- Exported functions like `getFieldInferencePrompt(fieldLabel: string, context: string): string`
- All prompts should be versioned and redact-sensitive by default

This file helps align prompt engineering with system modularity and safety requirements.
*/

// TODO [0]: Store standard prompts for LLM assistance
// TODO [0.1]: Add dynamic prompt generation based on document type and context
// TODO [0.2]: Implement prompt versioning and A/B testing capabilities
// TODO [1]: Support prompt templating + field injection
// TODO [1.1]: Add jurisdiction-specific legal language and terminology
// TODO [1.2]: Add automatic PII detection and sanitization in prompts
// TODO [1.3]: Add confidence calibration prompts for uncertainty estimation
// TODO [1.4]: Add model-specific prompt formatting and optimization
