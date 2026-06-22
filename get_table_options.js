const supabaseUrl = 'https://zulhwafhfmreitiapcev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bGh3YWZoZm1yZWl0aWFwY2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDcxNTEsImV4cCI6MjA5NzUyMzE1MX0.VPxiXJFd-7bL-tlM3VRVoKe94YnWg4oFLhUPXcTTrcI';

async function checkTableOptions() {
  const tables = ['users', 'appointments', 'ai_reports', 'emergency_contacts'];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'OPTIONS',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      const schema = await response.json();
      console.log(`\nTable: ${table}`);
      if (schema.definitions && schema.definitions[table]) {
        const properties = schema.definitions[table].properties;
        console.log('Columns:');
        for (const [col, info] of Object.entries(properties)) {
          console.log(`  - ${col} (${info.type}${info.format ? ', ' + info.format : ''})`);
        }
      } else {
        console.log('Schema properties not found in response. Root keys:', Object.keys(schema));
        if (schema.message) console.log('Message:', schema.message);
      }
    } catch (err) {
      console.error(`Error on ${table}:`, err.message);
    }
  }
}

checkTableOptions();
