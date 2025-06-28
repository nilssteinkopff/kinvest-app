// src/components/ReferralIdDisplay.tsx
"use client"

export const ReferralIdDisplay = ({ referralId }: { referralId: string }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralId);
      alert('Referral-ID kopiert!');
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Ihre Referral-ID</h3>
      <div className="flex items-center justify-between">
        <p className="text-xl font-mono font-bold text-indigo-600">{referralId}</p>
        <button 
          onClick={copyToClipboard}
          className="ml-3 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
        >
          Kopieren
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Teilen Sie diese ID mit Freunden für Referral-Belohnungen
      </p>
    </div>
  );
};