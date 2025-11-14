import axios from 'axios'
import { getMALToken } from '../../MyAnimeList/malAuth'

export type MALMangaSearchResponse = {
    id: number
    title: string
    main_picture: {
        medium: string
        large: string
    },
    "start-date": string
    synopsis: string
    mean: number
    updated_at: string
    media_type: string
    status: string
    genres: Array<{
        id: number
        name: string
    }>
    authors: Array<{
        node: {
            id: number
            first_name: string
            last_name: string
        }
        role: string
    }>
}

export const getTitleMangaInMyAnimeList = async (title: string, token: string) => {
    if (!title) throw new Error('title is required')

    const q = encodeURIComponent(title)
    const url = `https://api.myanimelist.net/v2/manga?q=${q}`

    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!res.data && res.data.data > 0) throw new Error('Manga not found in MyAnimeList')

        return res.data.data[0].node.id
    } catch (err: any) {
        const status = err?.response?.status
        const statusText = err?.response?.statusText || err?.message
        const body = err?.response?.data ? JSON.stringify(err.response.data) : ''
        throw new Error(`MAL API error ${status || 'ERR'} ${statusText}: ${body}`)
    }
}

export const getMangaInMyAnimeList = async (title: string): Promise<MALMangaSearchResponse | undefined> => {
    const token = await getMALToken()
    const id = await getTitleMangaInMyAnimeList(title, token)

    try {
        const url = `https://api.myanimelist.net/v2/manga/${id}?fields=main_picture,start_date,end_date,synopsis,mean,updated_at,media_type,status,genres,authors{first_name,last_name}`
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const response: MALMangaSearchResponse = res.data
        return response
    } catch (e) {
        console.log(e);

    }
}

