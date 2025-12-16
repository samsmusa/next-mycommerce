import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        // Validate body...

        const product = await prisma.product.update({
            where: { id: params.id },
            data: body
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await prisma.product.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
