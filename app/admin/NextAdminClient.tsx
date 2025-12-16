'use client';
import '../../nextAdminCss.css';
import { NextAdmin } from '@premieroctet/next-admin/adapters/next';
import PageLoader from '@premieroctet/next-admin/pageLoader';

export default function NextAdminClient(props: any) {
    return <NextAdmin pageLoader={<PageLoader />} {...props} />;
}
