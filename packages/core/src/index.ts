import { FormField, ProcessingResult, ProcessingStatus } from '@frommonkey/types';

export class DocumentProcessor {
  async processDocument(document: any): Promise<ProcessingResult> {
    try {
      // Placeholder implementation
      return {
        success: true,
        data: { processed: true },
        warnings: []
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export class FormProcessor {
  async validateForm(fields: FormField[]): Promise<ProcessingResult> {
    const errors: string[] = [];
    
    for (const field of fields) {
      if (field.required && !field.value) {
        errors.push(`Field ${field.name} is required`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

export * from '@frommonkey/types';
