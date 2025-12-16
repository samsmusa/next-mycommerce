"use client"

import React, {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {formatCurrency} from "@/lib/utils";
import Link from "next/link";
import {getProducts} from "@/app/server_action/products";
import {Product} from "@/app/types/product";
import {PaginatedResponse} from "@/app/types/common";
import {APP_ROUTE} from "@/lib/route";

const ProductList: React.FC = () => {
    const router = useRouter()
    const [searchParams, setSearchParams] = useState<string[]>([])
    const searchParamsHook = useSearchParams()
    const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParamsHook.get('q') || '');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const page = parseInt(searchParamsHook.get('page') || '1');


    useEffect(() => {
        getProducts().then(r=>{
            setLoading(false);
            setData(r)
        });
    }, [page, searchTerm]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams(prev => {
                // if (searchTerm) prev.set('q', searchTerm);
                // else prev.delete('q');
                // prev.set('page', '1');
                return prev;
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        setDeletingId(id);
        try {
            // await deleteProduct(id);
            // fetchData();
        } catch (error) {
            alert("Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        // setSearchParams(prev => {
        //     prev.set('page', newPage.toString());
        //     return prev;
        // });
    };

    useEffect(() => {
        console.log("data", data)
    }, [data]);

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 shadow-sm">
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50"
                    />
                </div>
                <Link href="/admin/products/new">
                    <Button variant="default">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Table Card */}
            <div className="bg-white shadow-sm overflow-hidden h-screen">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">SKU</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Stock</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div
                                            className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-black rounded-full"></div>
                                        Loading products...
                                    </div>
                                </td>
                            </tr>
                        ) : data?.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            data?.data.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div>
                                            {product.name}
                                            {product.isFeatured && <span
                                                className="ml-2 text-xs text-yellow-600 font-normal">★ Featured</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <Badge variant="outline" className="bg-gray-50">{product?.category?.name}</Badge>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {formatCurrency(product.price)}
                                        {product.discount > 0 && <span
                                            className="ml-2 text-xs text-red-500 line-through">{formatCurrency(Number(product.price) + Number(product.discount))}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {product.quantity}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className="font-semibold" variant={product.isActive ? 'success' : 'secondary'}>
                                            {product.isActive ? 'Active' : 'Draft'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm"
                                                onClick={() => router.push(APP_ROUTE.ADMIN_PRODUCTS_EDIT(product.id))}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingId === product.id}
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            {deletingId === product.id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {data && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} results)
                </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={data?.meta?.page <= 1}
                                onClick={() => handlePageChange(data?.meta?.page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={data?.meta?.page >= data.meta.totalPages}
                                onClick={() => handlePageChange(data.meta.page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;