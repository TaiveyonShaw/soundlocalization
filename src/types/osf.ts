export interface FileData {
    id: string[];
}

export interface Folder {
    relationships: {
        files: {
            links: {
                related: {
                    href: string;
                };
            };
        };
    };
}

export interface Pages {
    data: {
        attributes: {
            name: string;
        };
    }[];
    links: {
        next: string;
    };
} 