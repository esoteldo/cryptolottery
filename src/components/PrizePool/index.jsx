import { useEffect, useState } from "react";
import "./styles.css";

const PrizePool = () => {
    const [countdown, setCountdown] = useState({ hours: '00', minutes: '00', seconds: '00' });
   const utcDate=new Date().getTimezoneOffset();
    // 8 PM UTC countdown
  useEffect(() => {
    const tick = () => {
      const now = new Date(Date.now( ) +(utcDate*60000))
      const next = new Date();
      next.setHours(20, 0, 0, 0);
      if (now.getTime() > next.getTime()) next.setDate(next.getDate() + 1);
      const diff =( next.getTime() - now.getTime());
      const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
      setCountdown({ hours: h, minutes: m, seconds: s });
    };
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    /* Current Lottery Pool */
    <div className="glass-card rounded-2xl p-6 text-center glow-orange">
                <h2 className="text-lg font-semibold mb-2 text-gray-300">Current Prize Pool</h2>
                <div className="pool-amount orbitron mb-2" id="pool-amount">$2,847,392</div>
                <div className="text-sm text-gray-400">Next draw in:</div>
                <div className="flex justify-center items-center mt-4">
                    <div className="countdown-timer flex space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold orbitron" id="hours">{countdown.hours}</div>
                            <div className="text-xs text-gray-400">Hours</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold orbitron" id="minutes">{countdown.minutes}</div>
                            <div className="text-xs text-gray-400">Minutes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold orbitron" id="seconds">{countdown.seconds}</div>
                            <div className="text-xs text-gray-400">Seconds</div>
                        </div>
                    </div>
                </div>
            </div>
  )
}

export default PrizePool