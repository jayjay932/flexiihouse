import { Nunito } from 'next/font/google';

import './globals.css'

import ToastProvider from './providers/ToasterProvider';
import getCurrentUser from './actions/getCurrentUser';
// Components
import Navbar from './components/navbar';
import BottomNav from './components/navbar/BottomNav';


import ClientOnly from './components/ClientOnly';
// Modals
import RegisterModal from './components/modals/RegisterModal';
import LoginModal from './components/modals/LoginModal';
import RentModal from './components/modals/RentModal';
import SearchModal from './components/modals/SearchModal';
import TermsModal from '@/app/components/modals/TermsModal'

export const metadata = {
  title: 'Flexiihouse | Home',
  description: 'Flexiihouse - Votre plateforme de réservation de logements',
  icon: {
    url: "/favicon.png",
    type: "image/png",
  },
  shortcut: { url: "/favicon.png", type: "image/png" },
}

const font = Nunito({
  subsets: ["latin"]
})

export default async function RootLayout({ children, }: { children: React.ReactNode }) {

  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={font.className}>
        <ClientOnly>
          <ToastProvider />
          <RegisterModal />
          <LoginModal />
          <RentModal />
          <SearchModal />
          <Navbar currentUser={currentUser} />
           <BottomNav currentUser={currentUser} />
             <TermsModal currentUser={currentUser} /> {/* ✅ Modal injecté */}
        </ClientOnly>
        <div className='pb-20 pt-28'>
          {children}
        </div>
      </body>
    </html>
  )
}
