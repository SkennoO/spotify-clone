'use client'
import React from 'react'
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import {RxCaretLeft,RxCaretRight} from 'react-icons/rx';
import { HiHome } from 'react-icons/hi';
import { BiSearch } from 'react-icons/bi';
import Button from './Button';
import useAuthModal from '@/hooks/useAuthModal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@/hooks/useUser';
import { FaUserAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Props{
    children:React.ReactNode;
    className?:string
}

const Header: React.FC<Props> = ({children,className}) => {
    const router = useRouter()
    const supabaseClient = useSupabaseClient()
    const authModal = useAuthModal()
    const {user} = useUser()

    const handleLogout =  async () => {
        const { error } = await supabaseClient.auth.signOut()
        router.refresh()
        if(error){
            toast.error(error.message)
        }else{
            toast.success('Logged out!')
        }
    }

    return (
        <div className={twMerge(`h-fit bg-gradient-to-b from-red-600 to-transparent p-6`,className)}>
            <div className='w-full mb-4 flex items-center justify-between'>
                {/* Desktop navigation */}
                <div className='hidden md:flex gap-x-2 items-center'>
                    <button className='rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition' onClick={()=>router.back()}>
                        <RxCaretLeft size={35} className='text-white'/>
                    </button>
                    <button className='rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition' onClick={()=>router.forward()}>
                        <RxCaretRight size={35} className='text-white'/>
                    </button>
                </div>

                {/* Mobile navigation */}
                <div className='flex md:hidden gap-x-2 items-center'>
                    <button className='rounded-full p-2 bg-red-600 hover:bg-red-700 flex items-center justify-center transition'>
                        <HiHome className='text-white' size={20}/>
                    </button>
                    <button className='rounded-full p-2 bg-red-600 hover:bg-red-700 flex items-center justify-center transition'>
                        <BiSearch className='text-white' size={20}/>
                    </button>
                </div>

                {/* Auth buttons */}
                <div className='flex justify-between items-center gap-x-4'>
                    {user ? (
                        <div className='flex gap-x-4 items-center'>
                            <Button onClick={handleLogout} className='bg-red-600 hover:bg-red-700 text-white px-6 py-2'>Logout</Button>
                            <Button onClick={()=>router.push('/account')} className='bg-red-600 hover:bg-red-700 text-white'>
                                <FaUserAlt/>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <Button onClick={authModal.onOpen} className='bg-transparent text-red-600 font-medium hover:text-red-700'>Sign Up</Button>
                            </div>
                            <div>
                                <Button onClick={authModal.onOpen} className='bg-red-600 hover:bg-red-700 text-white px-6 py-2'>Log in</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {children}
        </div>
    )
}

export default Header
