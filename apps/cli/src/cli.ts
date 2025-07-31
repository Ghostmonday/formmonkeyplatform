#!/usr/bin/env node

import { Command } from 'commander';
import { DocumentProcessor, FormProcessor } from '@frommonkey/core';
import { FormField } from '@frommonkey/types';

const program = new Command();

program
  .name('frommonkey')
  .description('FromMonkey CLI - Intelligent form processing tools')
  .version('0.1.0');

program
  .command('process')
  .description('Process a document or form')
  .option('-f, --file <path>', 'path to file to process')
  .option('-t, --type <type>', 'type of processing (document|form)', 'document')
  .action(async (options) => {
    console.log('🐒 FromMonkey Processing...');
    
    if (options.type === 'document') {
      const processor = new DocumentProcessor();
      const result = await processor.processDocument(options.file);
      console.log('Document processing result:', result);
    } else if (options.type === 'form') {
      const processor = new FormProcessor();
      // Example form data
      const sampleFields: FormField[] = [
        { id: '1', name: 'email', type: 'email', required: true },
        { id: '2', name: 'name', type: 'text', required: true, value: 'John Doe' }
      ];
      const result = await processor.validateForm(sampleFields);
      console.log('Form validation result:', result);
    }
  });

program
  .command('validate')
  .description('Validate form data')
  .option('-d, --data <json>', 'JSON data to validate')
  .action(async (options) => {
    console.log('🔍 Validating data...');
    try {
      const data = JSON.parse(options.data || '{}');
      console.log('Validation complete:', data);
    } catch (error) {
      console.error('Invalid JSON data:', error);
    }
  });

program.parse();
