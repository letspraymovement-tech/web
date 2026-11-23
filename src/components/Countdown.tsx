import { useEffect, useState } from "react";
const meetingDays = [1, 2, 5]; // Monday, Tuesday, Friday

function nextMeeting(from = new Date()) {
  return meetingDays
    .map((day) => {
      const target = new Date(from);
      target.setUTCHours(22, 0, 0, 0); // 11 PM in Lagos (WAT, UTC+1)
      target.setUTCDate(target.getUTCDate() + ((day - from.getUTCDay() + 7) % 7));
      if (target <= from) target.setUTCDate(target.getUTCDate() + 7);
      return target;
    })
    .sort((a, b) => a.getTime() - b.getTime())[0];
}

export function Countdown({ titleId }: { titleId: string }) {
  const [target, setTarget] = useState(nextMeeting);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= target.getTime()) setTarget(nextMeeting(new Date(time)));
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
  const day = target.toLocaleDateString("en-GB", {
    weekday: "long",
    timeZone: "Africa/Lagos",
  });
  return (
    <>
      <h2 id={titleId}>
        <span>{day}</span> Meeting
      </h2>
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
        aria-label={`Time until the next ${day} meeting`}
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
