"use client"
// Next Libraries
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const Logo = () => {

    const router = useRouter();

    return (
        <Image
            onClick={() => router.push("/")}
            alt='Logo'
            className='hidden md:block cursor-pointer'
            height={10}
            width={70}
            src="/images/flexii.jpg"
            
        />
    )
}

export default Logo