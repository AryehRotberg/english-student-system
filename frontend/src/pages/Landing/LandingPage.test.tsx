import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { LandingPage } from './LandingPage';

function renderAt(url: string) {
    return render(
        <MemoryRouter initialEntries={[url]}>
            <LandingPage />
        </MemoryRouter>,
    );
}

describe('LandingPage', () => {
    afterEach(async () => {
        cleanup();
        await i18n.changeLanguage('en');
    });

    it('opens in Hebrew, right-to-left, with ?lang=he', async () => {
        renderAt('/landing-page?lang=he');

        await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
        expect(
            screen.getByRole('heading', { level: 2, name: 'שישה מקצועות, בליווי אישי' }),
        ).toBeTruthy();
    });

    it('lists all six subjects and the contact email', () => {
        renderAt('/landing-page?lang=en');

        for (const name of [
            'English',
            'Mathematics',
            'Computer Science',
            'Software Engineering',
            'Artificial Intelligence',
            'Cyber Security',
        ]) {
            expect(screen.getByRole('heading', { level: 3, name })).toBeTruthy();
        }
        const emailLinks = screen.getAllByRole('link', {
            name: /contact\.roaryeh@gmail\.com/,
        });
        expect(emailLinks[0].getAttribute('href')).toBe(
            'mailto:contact.roaryeh@gmail.com',
        );
    });
});
