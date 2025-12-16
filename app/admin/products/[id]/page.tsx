import PageComponent from "@/app/admin/products/[id]/PageComponent";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params
    return <PageComponent id={id} />
}