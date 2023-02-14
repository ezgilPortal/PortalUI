import { Button } from "primereact/button";
import React, { createContext, useCallback, useMemo, useRef, useState } from "react";
import useSound from "use-sound";
import alarm from "../alarm.mp3";

export const AlarmContext = createContext(null);

export function AlarmContextProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [play, { stop }] = useSound(alarm, { loop: true });
  const btn = useRef(null);

  const alarmPlay = useCallback(() => {
    btn.current.click();
    setIsPlaying(true);
  }, []);

  const alarmStop = useCallback(() => {
    stop();
    setIsPlaying(false);
  }, [stop]);

  const context = useMemo(() => ({ play, alarmStop, alarmPlay, isPlaying }), [play, alarmStop, alarmPlay, isPlaying]);

  return (
    <>
      <AlarmContext.Provider value={context}>{children}</AlarmContext.Provider>
      <Button ref={btn} label="Çal" onClick={() => play()} style={{ display: "none" }} />
    </>
  );
}
