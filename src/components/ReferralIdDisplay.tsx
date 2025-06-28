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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Ihr Referral-Link</h3>
      <div className="flex items-center justify-between gap-3">
        <a 
          href={referralLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm font-mono text-indigo-600 hover:text-indigo-800 underline break-all transition-colors"
        >
          {referralLink}
        </a>
        <button 
          onClick={copyToClipboard}
          className="flex-shrink-0 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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