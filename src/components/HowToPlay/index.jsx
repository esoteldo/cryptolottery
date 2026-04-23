const HowToPlay = () => {
  const steps = [
    { color: 'bg-orange-500', text: 'Predict the last 2 digits(decimal number) of Bitcoin and Ethereum price' },
    { color: 'bg-blue-500', text: 'Buy tickets with your predictions (00-99 for each crypto) Bitcoin and Ethereun price' },
    { color: 'bg-green-500', text: 'Win if your numbers match the actual price endings!' },
    { color: 'bg-yellow-500', text: 'If there is no winner, the prize accumulates for the next draw.' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4 orbitron">How to Play</h3>
      <div className="space-y-3 text-sm text-gray-300">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-6 h-6 shrink-0 ${step.color} rounded-full flex items-center justify-center text-xs font-bold leading-none`}>
              {i + 1}
            </div>
            <span className="leading-6">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToPlay;
