// src/components/ReferralIdDisplay.tsx
"use client"

export const ReferralIdDisplay = ({ referralId }: { referralId: string }) => {
  const referralLink = `https://checkout.kinvest.ai/api/checkout?ref=${referralId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert('Referral-Link kopiert!');
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Referral-Link kopiert!');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
      <h3 className="text-sm/6 font-medium text-gray-600 mb-2">Ihr Referral-Link</h3>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <a 
          href={referralLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm/6 font-mono text-indigo-600 hover:text-indigo-800 underline break-all transition-colors"
        >
          {referralLink}
        </a>
        <button 
          onClick={copyToClipboard}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 shrink-0"
        >
          Kopieren
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Teilen Sie diesen Link mit Freunden für Referral-Belohnungen
      </p>
    </div>
  );
};