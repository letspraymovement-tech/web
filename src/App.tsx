import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CommunityBand } from './components/CommunityBand';
import { ContactDialog, type ContactTopic } from './components/ContactDialog';
import { HomePage } from './pages/HomePage';
import { SessionsPage } from './pages/SessionsPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { GivingDialog } from './components/GivingDialog';
import { whatsappGroupUrl } from './data/content';
import './App.css';
export default function App() {
    const [topic, setTopic] = useState<ContactTopic | null>(null);
    const path = window.location.pathname.replace(/\/$/, '');
    const openContact = (value: ContactTopic = 'community') => setTopic(value);
    return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main">
      {path === '/prayer-sessions' ? <SessionsPage onJoin={() => { window.location.href = whatsappGroupUrl; }}/> : path === '/IPC2026' ? <RegistrationPage /> : <HomePage onContact={openContact}/>}
      <CommunityBand />
    </main>
    <Footer onContact={openContact}/>
    {topic === 'giving' ? <GivingDialog onClose={() => setTopic(null)}/> : topic && <ContactDialog topic={topic} onClose={() => setTopic(null)}/>}
  </>;
}
