import React from 'react';
import MatsyaDashboard from '@/components/matsya/MatsyaDashboard';

const Matsya: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <MatsyaDashboard />
      </div>
    </div>
  );
};

export default Matsya;