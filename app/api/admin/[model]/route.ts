import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

function getIdField(modelName: string): string {
    const model = Prisma.dmmf.datamodel.models.find(
        m => m.name.toLowerCase() === modelName
    )
    return model?.fields.find(f => f.isId)?.name || 'id'
}

export async function GET(
    request: NextRequest,
    { params }: { params: { model: string } }
) {
    try {
        const modelName = params.model
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')

        const model = prisma[modelName as keyof typeof prisma] as any
        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        const [data, total] = await Promise.all([
            model.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            model.count()
        ])

        return NextResponse.json({ data, total, page })
    } catch (error) {
        console.error('GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { model: string } }
) {
    try {
        const modelName = params.model
        const body = await request.json()

        const model = prisma[modelName as keyof typeof prisma] as any
        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        const result = await model.create({ data: body })
        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error('POST error:', error)
        return NextResponse.json({ error: 'Failed to create record' }, { status: 400 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { model: string } }
) {
    try {
        const modelName = params.model
        const body = await request.json()

        // Extract id from URL or body
        const url = new URL(request.url)
        const id = url.pathname.split('/').pop()

        const model = prisma[modelName as keyof typeof prisma] as any
        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        const idField = getIdField(modelName)
        const result = await model.update({
            where: { [idField]: isNaN(Number(id)) ? id : Number(id) },
            data: body
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('PUT error:', error)
        return NextResponse.json({ error: 'Failed to update record' }, { status: 400 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { model: string } }
) {
    try {
        const modelName = params.model
        const url = new URL(request.url)
        const id = url.pathname.split('/').pop()

        const model = prisma[modelName as keyof typeof prisma] as any
        if (!model) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        const idField = getIdField(modelName)
        await model.delete({
            where: { [idField]: isNaN(Number(id)) ? id : Number(id) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE error:', error)
        return NextResponse.json({ error: 'Failed to delete record' }, { status: 400 })
    }
}
