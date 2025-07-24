import React from 'react'
import ClientOnly from './components/ClientOnly'
import Container from './components/Container'
import EmptyState from './components/EmptyState';
import getListings, { IListingsParams } from './actions/getListings';
import ListingCard from './components/listings/ListingCard';
import getCurrentUser from './actions/getCurrentUser';

interface PageProps {
    searchParams: IListingsParams
}

const Page = async ({ searchParams }: PageProps) => {
    // Debug: Log des paramètres reçus par la page
    console.log('🏠 Page Home - searchParams reçus:', searchParams);

    const listings = await getListings(searchParams);
    const currentUser = await getCurrentUser();

    // Debug: Log du nombre de listings récupérés
    console.log(`🏠 Page Home - ${listings.length} listings récupérés`);

    if (listings.length === 0) {
        return (
            <ClientOnly>
                <EmptyState showReset />
            </ClientOnly>
        )
    }

    return (
        <ClientOnly>
            <Container>
                {/* Indicateur des filtres actifs (en mode développement) */}
                {process.env.NODE_ENV === 'development' && Object.keys(searchParams).length > 0 && (
                    <div className="pt-20 pb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                🔍 Filtres actifs ({listings.length} résultat{listings.length > 1 ? 's' : ''})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(searchParams).map(([key, value]) => (
                                    <span
                                        key={key}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                    >
                                        {key}: {String(value)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className={`${process.env.NODE_ENV === 'development' && Object.keys(searchParams).length > 0 ? 'pt-4' : 'pt-24'} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8`}>
                    {listings.map((listing) => {
                        return (
                            <ListingCard
                                currentUser={currentUser}
                                key={listing.id}
                                data={listing}
                            />
                        )
                    })}
                </div>

                {/* Indicateur du nombre de résultats (en mode développement) */}
               
            </Container>
        </ClientOnly>
    )
}

export default Page