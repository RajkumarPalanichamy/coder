'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminStudentCreatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/students?create=true');
  }, [router]);

  return null;
}
