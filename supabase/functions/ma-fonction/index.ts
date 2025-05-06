// supabase/functions/ma-fonction/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { selectLastChapter } from './selectLastChapter.ts'
import { selectLastChapterSupabase } from './selectLastChapterSupabase.ts'
import { getChapters } from './uploadChapterToSupabase.ts'

serve(async () => {
  try {
    const lastChapter = await selectLastChapter()
    const lastChapterSupabase = await selectLastChapterSupabase()

    if (lastChapter > lastChapterSupabase) {
      const _chaptersNumber: number[] = []
      for (let i = Number(lastChapterSupabase) + 1; i <= Number(lastChapter); i++) {
        _chaptersNumber.push(i)
      }
      await getChapters(_chaptersNumber)
    } else console.log(`All chapter is upload : ${lastChapterSupabase}`)

    if (!lastChapter) {
      return new Response('No chapter found: verify the DOM selector', { status: 404 })
    }

    return new Response(lastChapter, { status: 200 })
  } catch (error) {
    return new Response(error, { status: 500 })
  }
})
