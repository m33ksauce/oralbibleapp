export interface PlayerState {
    playing: boolean;
    mediaTitle: string;
    index: number;
    readableCurrentTime: string;
    readableDuration: string;
    duration: number | undefined;
    currentTime: number | undefined;
    canplay: boolean;
    error: boolean;
}

export function MakeDefaultState(): PlayerState {
    return {
        playing: false,
        mediaTitle: '',
        index: undefined,
        readableCurrentTime: '',
        readableDuration: '',
        duration: undefined,
        currentTime: undefined,
        canplay: false,
        error: false,
      }
}