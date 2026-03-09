"use client"

import React, {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {deleteCategory, getCategories} from "@/app/server_action/categories";
import {PaginatedResponse} from "@/app/types/common";
import {APP_ROUTE} from "@/lib/route";
import {ProductCategory} from "@/prisma/prisma/client";

const CategoryList: React.FC = () => {
    const router = useRouter()
    const [searchParams, setSearchParams] = useState<string[]>([])
    const searchParamsHook = useSearchParams()
    const [data, setData] = useState<PaginatedResponse<ProductCategory> | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParamsHook.get('q') || '');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const page = parseInt(searchParamsHook.get('page') || '1');

    useEffect(() => {
        getCategories({page, limit: 10}).then(r=>{
            setLoading(false);
            setData(r)
        });
    }, [page, searchTerm]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        setDeletingId(id);
        try {
            await deleteCategory(id);
            getCategories({page, limit: 10}).then(r=>{
                setLoading(false);
                setData(r)
            });
        } catch (error) {
            alert("Failed to delete category");
        } finally {
            setDeletingId(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        // Implement query param update for pagination
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 shadow-sm">
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search by name or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50"
                    />
                </div>
                <Link href={`${APP_ROUTE.ADMIN_CATEGORIES}/new`}>
                    <Button variant="default">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Category
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Slug</th>
                            <th className="px-6 py-4 font-medium">Parent</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-black rounded-full"></div>
                                        Loading categories...
                                    </div>
                                </td>
                            </tr>
                        ) : data?.data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            data?.data.map((category: any) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{category.slug}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {category.parent ? (
                                            <Badge variant="outline" className="bg-gray-50">{category.parent.name}</Badge>
                                        ) : (
                                            <span className="text-xs text-gray-400">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm"
                                                onClick={() => router.push(APP_ROUTE.ADMIN_CATEGORIES_EDIT(category.id))}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingId === category.id}
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            {deletingId === category.id ? 'Deleting...' : 'Delete'}
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

export default CategoryList;
