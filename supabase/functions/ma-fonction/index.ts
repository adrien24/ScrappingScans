// supabase/functions/ma-fonction/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { selectLastChapter } from './selectLastChapter.ts'

serve(async () => {
  try {
    const lastChapter = await selectLastChapter()
    if (!lastChapter) {
      return new Response('No chapter found: verify the DOM selector', { status: 404 })
    }
    return new Response(lastChapter, { status: 200 })
  } catch (error) {
    return new Response(error, { status: 500 })
  }
})
