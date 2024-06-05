import Hls, { Level } from "hls.js";
import React, { useLayoutEffect, useRef } from "react";

export default function VideoPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [level, setLevel] = React.useState(-1);
    const [hls, setHls] = React.useState<Hls>();
    const [levels, setLevels] = React.useState<Level[]>([]);
    const videoName = "test"

    useLayoutEffect(() => {
        if (Hls.isSupported()) {
            const hls = new Hls({ 
                "debug": false,
            });  

            setHls(hls);
            hls.attachMedia(videoRef.current as HTMLVideoElement);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                hls.loadSource(`https://localhost:7100/api/Stream/stream/${videoName}/`); 
            }); 

            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                setLevels(data.levels);
            });
        } else { 
            console.log("load");
        }
    }, []); 

    function handleLevelChange(e: React.ChangeEvent<HTMLSelectElement>) {
        var value = parseInt(e.target.value); 
        if(value != -1) {
            var level = levels[value];
            var url = level.url[0];
            var parts = url.split("/");
            var streamId = parts[parts.length - 1];
            streamId = streamId.split(".")[0];
            streamId = streamId[streamId.length - 1];
            console.log("handleLevelChange", value, level, streamId)
            setLevel(value);
            hls!.currentLevel = levels.length - 1 - parseInt(streamId); //leveling bugged 0 becomes 2 and 2 becomes 0 1 is 1 so we need to reverse it
        } else {
            setLevel(value);
            hls!.currentLevel = -1;
        }
    }

    if(hls == undefined) return null;
    return (
        <>
            <h2>Current Level: {level}</h2>
            <select value={level} onChange={(e) => handleLevelChange(e)}>
                <option value="-1">Auto</option>
                {levels.map((level, index) => {
                    return ( 
                        <option key={index} value={index}>
                            {level.height}p {level.bitrate / 1000}kbps
                        </option>
                    )
                })}  
            </select>
            <video ref={videoRef} controls width="800" /> 
        </>
    );
}
