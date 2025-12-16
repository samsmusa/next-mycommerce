import { BarChart3, Database, Users } from 'lucide-react'
import Link from 'next/link'
import prisma from "@/lib/prisma";
import {getDMMF} from "@prisma/internals";
import {MODELS} from "@/lib/models";


// type ModelName = Prisma.ModelName;
export default function AdminHome() {
    return (
        <div className="max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
                <p className="text-slate-600">Manage your database with ease</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Models</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{MODELS.length}</p>
                        </div>
                        <Database className="w-12 h-12 text-blue-200" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Quick Access</p>
                            <p className="text-slate-700 text-sm mt-2">Select a model to get started</p>
                        </div>
                        <Users className="w-12 h-12 text-purple-200" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Features</p>
                            <p className="text-slate-700 text-sm mt-2">CRUD operations</p>
                        </div>
                        <BarChart3 className="w-12 h-12 text-green-200" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Models</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODELS.map(model => (
                        <Link
                            key={model}
                            href={`/admin/${model}`}
                            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                        >
                            <p className="font-semibold text-slate-900 capitalize group-hover:text-blue-700">{model}</p>
                            <p className="text-sm text-slate-600 mt-1">Manage {model} records</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}