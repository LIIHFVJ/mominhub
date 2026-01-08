
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obvrirdhqnwjmfaiqfki.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idnJpcmRocW53am1mYWlxZmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDgxMzIsImV4cCI6MjA4MzI4NDEzMn0.YQZdQLH6SP01T__3Ckw6CMD31I4fSLNkW3sWk5hWqx0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log('Testing insert WITHOUT is_featured column...');
  const { data, error } = await supabase.from('books').insert([{
    title: 'Test Book ' + Date.now(),
    category: 'shia',
    file_url: 'https://example.com/test.pdf'
  }]);
  
  if (error) {
    console.error('Insert failed:', error.message);
    if (error.message.includes('is_featured')) {
      console.log('CONFIRMED: is_featured column requires a value and has no working default in DB.');
    }
  } else {
    console.log('Insert successful! Database default for is_featured is working.');
  }
}

testInsert();
