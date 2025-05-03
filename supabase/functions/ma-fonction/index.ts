// supabase/functions/ma-fonction/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

const url = 'https://example.com'

serve(async (req) => {
  // Ta logique ici
  console.log('Hello from Supabase Function!')
  console.log('Request URL:', req.url)

  try {
    const res = await fetch(url)
    const html = await res.text()
    const document: any = new DOMParser().parseFromString(html, 'text/html')

    const pageHeader = document.querySelector('h1').textContent

    console.log(pageHeader)
  } catch (error) {
    console.log(error)
  }
})
