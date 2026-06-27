'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FaFire } from 'react-icons/fa';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    if (oobCode && auth) {
      applyActionCode(auth, oobCode)
        .then(() => setStatus('success'))
        .catch((err) => { setStatus('error'); setError(err.message); });
    } else {
      setStatus('error');
      setError('Invalid verification link');
    }
  }, [searchParams]);

  return (
    <div className="glass p-6 rounded-2xl">
      {status === 'loading' && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-dark-300">Verifying your email...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="py-8 text-center">
          <HiOutlineCheckCircle className="w-16 h-16 text-accent-green mx-auto" />
          <h1 className="text-2xl font-bold mt-4 mb-2">Email Verified!</h1>
          <p className="text-dark-300 mb-6">Your email has been verified successfully.</p>
          <Link href="/home" className="btn-primary">Go to Home</Link>
        </div>
      )}
      {status === 'error' && (
        <div className="py-8 text-center">
          <HiOutlineXCircle className="w-16 h-16 text-accent-red mx-auto" />
          <h1 className="text-2xl font-bold mt-4 mb-2">Verification Failed</h1>
          <p className="text-dark-300 mb-6">{error}</p>
          <Link href="/home" className="btn-primary">Go to Home</Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/home" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-pink rounded-xl flex items-center justify-center">
              <FaFire className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Z.XTREAM</span>
          </Link>
        </div>
        <Suspense fallback={<div className="glass p-6 rounded-2xl py-8 text-center"><div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
          <VerifyContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
