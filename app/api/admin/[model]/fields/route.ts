import { NextRequest, NextResponse } from 'next/server'
import {PrismaClient as Prisma} from "@/prisma/prisma/client";


export async function GET(
    request: NextRequest,
    { params }: { params: { model: string } }
) {
    try {
        const modelName = params.model
        const model = Prisma.dmmf.datamodel.models.find(
            m => m.name.toLowerCase() === modelName
        )

        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        const fields = model.fields
            .filter(f => !['createdAt', 'updatedAt'].includes(f.name) && !f.relationName)
            .map(f => ({
                name: f.name,
                type: f.type,
                isRequired: f.isRequired,
                isList: f.isList
            }))

        return NextResponse.json(fields)
    } catch (error) {
        console.error('GET fields error:', error)
        return NextResponse.json({ error: 'Failed to fetch fields' }, { status: 500 })
    }
}
