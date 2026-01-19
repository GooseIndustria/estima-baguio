import { useNavigation } from '../context/NavigationContext';
import LineItems from '../components/LineItems';
import EstimateSummary from '../components/EstimateSummary';

export function EstimatePage() {
    const { navigateTo, PAGES } = useNavigation();

    return (
        <>
            <main className="main-content">
                <button
                    className="back-btn"
                    onClick={() => navigateTo(PAGES.MATERIALS)}
                >
                    ← Back to Materials
                </button>

                <LineItems />
            </main>

            <EstimateSummary />
        </>
    );
}

export default EstimatePage;
