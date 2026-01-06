"use client";

import { FileVideo, Home, MonitorPlay, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RootState } from '@/store/store';

const FooterMenu = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <footer className='bg-white dark:bg-black md:hidden text-[10px] h-20 fixed w-full flex items-center justify-around bottom-0 left-0 z-20 border-t border-gray-200 dark:border-gray-800'>
      <Link href="/" className='flex flex-col items-center gap-1'>
        <Home className='w-6 h-6' />
        <span>Home</span>
      </Link>

      <Link href="/shorts" className='flex flex-col items-center gap-1'>
        <FileVideo className='w-6 h-6' />
        <span>Shorts</span>
      </Link>

      <Link href="/create" className='flex flex-col items-center gap-1'>
        <PlusCircle className='w-6 h-6' />
        <span>Create</span>
      </Link>

      <div className='flex flex-col items-center gap-1'>
        <MonitorPlay className='w-6 h-6' />
        <span>Subscriptions</span>
      </div>

      <Link href={user?.id ? `/channels/${user.id}` : '#'} className='flex flex-col items-center gap-1'>
        <Avatar className='w-6 h-6'>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <span>You</span>
      </Link>
    </footer>
  );
};

export default FooterMenu;
