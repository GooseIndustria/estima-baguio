import { useState, useEffect } from 'react';

export function useInstallPrompt() {
    const [promptEvent, setPromptEvent] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setPromptEvent(e);
            console.log('Capture PWA install prompt event');
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const promptInstall = async () => {
        if (promptEvent) {
            // Show the install prompt
            promptEvent.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await promptEvent.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);

            // We've used the prompt, and can't use it again, discard it
            setPromptEvent(null);
        }
    };

    return { isInstallable: !!promptEvent, promptInstall };
}
