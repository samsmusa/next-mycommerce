import {Media} from "@/app/types/media";

export type MediaType = 'image' | 'video' | 'audio' | 'pdf';



export interface MediaSelectorProps {
    control: any;
    name: string;
    multiple?: boolean;
    onSearch: (query: string) => Promise<Media[]>;
    onUpload: (files: File[]) => Promise<Media[]>;
    label?: string;
    maxFiles?: number;
}
