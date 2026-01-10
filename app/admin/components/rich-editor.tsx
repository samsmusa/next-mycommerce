'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Editor = dynamic(() => import('@/app/admin/components/custom-editor'), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

const EditorClient = ({content, onChange}: { content?: string, onChange: any }) => {
    return (
        <>
            <Editor onChange={onChange} content={content}/>
        </>
    );
}


export default EditorClient;