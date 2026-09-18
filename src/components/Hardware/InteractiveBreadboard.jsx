import React, { useState } from 'react';

export default function InteractiveBreadboard({ icName = 'CD4051BE', connections = {}, onToggleWire, isVerified = false }) {
  // Helper to render a pin on the IC
  const renderPin = (num, label, colorClass, side = 'left', isConnected = true) => {
    return (
      <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''} mb-2`}>
        <button
          onClick={() => onToggleWire && onToggleWire(num)}
          className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
            isConnected ? colorClass : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
          }`}
        >
          {num}: {label}
        </button>
      </div>
    );
  };

  // Helper to render an external module block
  const renderModule = (title, lines) => (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3 w-40 flex flex-col justify-center">
      <p className="text-slate-400 text-xs mb-2 font-medium">{title}</p>
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          {line.dot && <div className={`w-2 h-2 rounded-full ${line.dotClass}`} />}
          <span className={`text-xs font-mono font-bold ${line.textClass}`}>{line.text}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Verification Banner */}
      {isVerified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 shadow-sm">
          <div className="text-emerald-500 font-bold text-xl">✓</div>
          <div>
            <h4 className="text-emerald-800 font-bold">All Hardware Connections Verified!</h4>
            <p className="text-emerald-600 text-sm mt-1">
              IC 4051 VDD, GND, Inhibit, inputs, clock, and output bus are correctly routed. Analog signals are actively interleaving in real time.
            </p>
          </div>
        </div>
      )}

      {/* Main Board Area */}
      <div className="bg-[#0b1120] rounded-2xl p-6 shadow-2xl font-sans border border-slate-800">
        
        {/* Power Rails */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="text-rose-500 font-mono font-bold text-sm tracking-widest">+5V Power Rail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="text-cyan-500 font-mono font-bold text-sm tracking-widest">GND Reference Rail</span>
          </div>
        </div>

        {/* Board Layout */}
        <div className="flex justify-between items-stretch gap-4">
          
          {/* Left Column: Inputs */}
          <div className="flex flex-col gap-4 justify-between">
            {renderModule('DC Power Supply', [{ dot: true, dotClass: 'bg-rose-500', text: '+5.0 V DC', textClass: 'text-rose-100' }])}
            {renderModule('Signal Generator 1 (X0)', [{ text: '1 kHz Sine (CH0)', textClass: 'text-cyan-400' }])}
            {renderModule('Signal Generator 2 (X1)', [{ text: '2.5 kHz Sine (CH1)', textClass: 'text-emerald-400' }])}
            {renderModule('Clock Generator (TTL)', [{ text: '15 kHz Sq (f_clk)', textClass: 'text-amber-400' }])}
          </div>

          {/* Center Column: IC Socket */}
          <div className="flex flex-col items-center">
            <p className="text-slate-400 text-xs font-mono font-bold tracking-widest mb-2 text-center">BREADBOARD IC SOCKET<br/>(DIP-16)</p>
            
            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-xl p-4 relative shadow-2xl min-w-[220px]">
              {/* IC Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 bg-zinc-800 rounded-b-full border-b border-zinc-600 shadow-inner" />
              
              <h3 className="text-center text-zinc-300 font-mono font-bold text-sm tracking-widest mt-4 mb-6">{icName}</h3>
              
              <div className="flex justify-between gap-6">
                {/* Left Pins */}
                <div className="flex flex-col">
                  {renderPin(13, 'X0', 'bg-cyan-900 text-cyan-300 border border-cyan-700', 'left', connections[13])}
                  {renderPin(14, 'X1', 'bg-emerald-900 text-emerald-300 border border-emerald-700', 'left', connections[14])}
                  {renderPin(3, 'COM', 'bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-700', 'left', connections[3])}
                  {renderPin(6, 'INH', 'bg-blue-900 text-blue-300 border border-blue-700', 'left', connections[6])}
                  {renderPin(8, 'VSS', 'bg-cyan-900 text-cyan-300 border border-cyan-700', 'left', connections[8])}
                </div>
                
                {/* Right Pins */}
                <div className="flex flex-col">
                  {renderPin(16, 'VDD', 'bg-rose-900 text-rose-300 border border-rose-700', 'right', connections[16])}
                  {renderPin(11, 'A', 'bg-amber-900 text-amber-300 border border-amber-700', 'right', connections[11])}
                  {renderPin(10, 'B (0)', 'bg-slate-800 text-slate-500', 'right', false)}
                  {renderPin(9, 'C (0)', 'bg-slate-800 text-slate-500', 'right', false)}
                  {renderPin(7, 'VEE (0)', 'bg-slate-800 text-slate-500', 'right', false)}
                </div>
              </div>
            </div>

            {/* Status LED */}
            <div className="mt-6 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`} />
              <span className={`font-mono font-bold text-sm tracking-widest ${isVerified ? 'text-emerald-500' : 'text-slate-500'}`}>
                IC 4051 {isVerified ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

          {/* Right Column: Outputs */}
          <div className="flex flex-col gap-4 justify-between">
            {renderModule('TDM Composite Line', [
              { dot: true, dotClass: 'bg-fuchsia-500', text: 'Pin 3 Common', textClass: 'text-fuchsia-400' },
              { text: 'Bus', textClass: 'text-fuchsia-400 ml-4' }
            ])}
            {renderModule('Demux IC 4051', [
              { text: 'Reconstruction', textClass: 'text-purple-400' },
              { text: 'Filter', textClass: 'text-purple-400' }
            ])}
            {renderModule('DSO CH1 Probe', [
              { text: 'Live Signal', textClass: 'text-emerald-400' },
              { text: 'Probed', textClass: 'text-emerald-400' }
            ])}
          </div>

        </div>
      </div>
    </div>
  );
}
