import axios from 'axios'
import { getMALToken } from '../../MyAnimeList/malAuth'

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
        console.log(res.data.data[0].node.id);

        return res.data.data[0].node.id
    } catch (err: any) {
        // axios throws for non-2xx by default; provide a readable error
        const status = err?.response?.status
        const statusText = err?.response?.statusText || err?.message
        const body = err?.response?.data ? JSON.stringify(err.response.data) : ''
        throw new Error(`MAL API error ${status || 'ERR'} ${statusText}: ${body}`)
    }
}

export const getMangaInMyAnimeList = async (title: string) => {
    const token = await getMALToken()
    const id = await getTitleMangaInMyAnimeList(title, token)

    try {
        const url = `https://api.myanimelist.net/v2/manga/${id}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},pictures,background,related_anime,related_manga,recommendations,serialization{name}`
        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        console.log(res.data);

    } catch (e) {
        console.log(e);

    }
}

