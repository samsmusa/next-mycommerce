export const MODELS: any[] = ["users"]

export const MODEL_FIELDS: Record<string, Array<{ name: string; type: string; isRequired: boolean }>> = {
    user: [
        { name: 'email', type: 'String', isRequired: true },
        { name: 'name', type: 'String', isRequired: false },
        { name: 'role', type: 'String', isRequired: false }
    ]
}

export const ID_FIELDS: Record<string, string> = {
    user: 'id',
    post: 'id',
    category: 'id'
}