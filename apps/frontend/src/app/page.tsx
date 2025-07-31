import { FormField } from '@frommonkey/types';
import { formatFieldName } from '@frommonkey/utils';

export default function Home() {
  const sampleFields: FormField[] = [
    {
      id: '1',
      name: 'Email Address',
      type: 'email',
      required: true
    },
    {
      id: '2', 
      name: 'Full Name',
      type: 'text',
      required: true
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">FromMonkey</h1>
      <p className="text-lg mb-6">
        Intelligent form processing and document automation platform.
      </p>
      
      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold">Sample Form Fields</h2>
        {sampleFields.map((field) => (
          <div key={field.id} className="p-4 border rounded-lg">
            <h3 className="font-medium">{field.name}</h3>
            <p className="text-sm text-gray-600">
              Type: {field.type} | Field Name: {formatFieldName(field.name)}
            </p>
            {field.required && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Required
              </span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
