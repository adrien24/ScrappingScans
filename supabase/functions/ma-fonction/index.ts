// supabase/functions/ma-fonction/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Ta logique ici
  console.log('Tâche CRON exécutée')

  return new Response('OK', { status: 200 })
})
