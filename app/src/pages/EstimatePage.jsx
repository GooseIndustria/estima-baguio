import { useNavigation } from '../context/NavigationContext';
import LineItems from '../components/LineItems';
import EstimateSummary from '../components/EstimateSummary';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export function EstimatePage() {
    const { navigateTo, PAGES } = useNavigation();

    return (
        <>
            <main className="container mx-auto p-4 max-w-3xl pb-24">
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => navigateTo(PAGES.MATERIALS)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Materials
                </Button>

                <LineItems />
            </main>

            <EstimateSummary />
        </>
    );
}

export default EstimatePage;
