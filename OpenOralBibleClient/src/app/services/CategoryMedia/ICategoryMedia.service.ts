import { MediaItem } from 'src/app/models/MediaItem';

export interface ICategoryMediaService {
    getAvailable(id: string): MediaItem[]
    getBreadcrumbs(id: string): MediaItem[]
    getParent(id?: string): string
    getCategory(id: string): MediaItem
    getPrevious(id: string): MediaItem
    getNext(id: string): MediaItem
}