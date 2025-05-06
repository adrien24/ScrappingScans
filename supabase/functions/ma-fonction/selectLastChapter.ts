const url = 'https://onepiecescan.fr/'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

export const selectLastChapter = async (): Promise<string> => {
  const res = await fetch(url)
  const html = await res.text()
  const document: any = new DOMParser().parseFromString(html, 'text/html')

  const pageHeader = document.querySelector('#All_chapters ul li ul li').textContent

  const input = pageHeader || ''
  const onlyNumbers = input.replace(/\D/g, '')

  return onlyNumbers
}
