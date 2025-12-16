import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
  categoryId: z.string(),
  createdBy: z.string(), // In real app, get from session
  quantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  try {
    const whereClause = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { sku: { contains: search, mode: 'insensitive' as const } },
        ]
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.product.count({ where: whereClause })
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: validatedData
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product', details: error }, { status: 400 });
  }
}
