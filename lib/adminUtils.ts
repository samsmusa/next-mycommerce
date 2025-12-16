import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getModelNames(): Promise<string[]> {
    const models = Prisma.dmmf.datamodel.models.map(m => m.name.toLowerCase())
    return models
}

export function getModelFields(modelName: string) {
    const model = Prisma.dmmf.datamodel.models.find(
        m => m.name.toLowerCase() === modelName
    )
    if (!model) return []

    return model.fields.filter(f =>
        !['createdAt', 'updatedAt'].includes(f.name) &&
        f.relationName === undefined
    )
}

export function getModelRelations(modelName: string) {
    const model = Prisma.dmmf.datamodel.models.find(
        m => m.name.toLowerCase() === modelName
    )
    if (!model) return []

    return model.fields.filter(f => f.relationName !== undefined)
}

export async function getModelData(
    modelName: string,
    skip = 0,
    take = 10
) {
    const model = prisma[modelName as keyof PrismaClient]
    if (!model) throw new Error(`Model ${modelName} not found`)

    const [data, total] = await Promise.all([
        (model as any).findMany({ skip, take }),
        (model as any).count()
    ])

    return { data, total, pages: Math.ceil(total / take) }
}

export async function getModelById(modelName: string, id: string | number) {
    const model = prisma[modelName as keyof PrismaClient]
    if (!model) throw new Error(`Model ${modelName} not found`)

    const idField = await getIdField(modelName)
    return (model as any).findUnique({
        where: { [idField]: isNaN(Number(id)) ? id : Number(id) }
    })
}

export async function getIdField(modelName: string): Promise<string> {
    const model = Prisma.dmmf.datamodel.models.find(
        m => m.name.toLowerCase() === modelName
    )
    return model?.fields.find(f => f.isId)?.name || 'id'
}

export async function deleteModelRecord(modelName: string, id: string | number) {
    const model = prisma[modelName as keyof PrismaClient]
    if (!model) throw new Error(`Model ${modelName} not found`)

    const idField = await getIdField(modelName)
    return (model as any).delete({
        where: { [idField]: isNaN(Number(id)) ? id : Number(id) }
    })
}