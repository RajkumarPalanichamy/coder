'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminStudentEditPage() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    router.replace(`/admin/students?edit=${id}`);
  }, [router, id]);

  return null;
}
