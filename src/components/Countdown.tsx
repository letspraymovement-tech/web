import { useEffect, useState } from "react";
function nextMonday() {
  const now = new Date(),
    target = new Date(now);
  target.setUTCHours(22, 0, 0, 0);
  target.setUTCDate(target.getUTCDate() + ((1 - now.getUTCDay() + 7) % 7));
  if (target <= now) target.setUTCDate(target.getUTCDate() + 7);
  return target;
}
export function Countdown() {
  const [target, setTarget] = useState(nextMonday);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= target.getTime()) setTarget(nextMonday());
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  const seconds = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const values = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  return (
    <>
      <p className="meeting-date">
        {target.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          timeZone: "Africa/Lagos",
        })}{" "}
        · 11 PM – 12 AM (WAT)
      </p>
      <div
        className="countdown"
        aria-label="Time until next Monday prayer meeting"
      >
        {["Days", "Hrs", "Min", "Sec"].map((label, index) => (
          <div key={label}>
            <strong>{String(values[index]).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
