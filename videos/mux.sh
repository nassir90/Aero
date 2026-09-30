#!/bin/bash
set -e
cd "$(dirname "$0")"
n="$1"; frames=$(ls frames/$n | wc -l | tr -d ' '); D=$(python3 -c "print(round($frames/30, 3))")
ffmpeg -loglevel error -y -framerate 30 -i "frames/$n/f%05d.jpg" -i "vo/$n.mp3" -i assets/music.wav -filter_complex "\
[1:a]adelay=400|400,aresample=44100,volume=1.1,asplit=2[vo][key];\
[2:a]atrim=0:$D,asetpts=N/SR/TB,volume=0.32,afade=t=in:d=0.6,afade=t=out:st=$(python3 -c "print(max(0,$D-1.3))"):d=1.3[mus];\
[mus][key]sidechaincompress=threshold=0.02:ratio=5:attack=25:release=350[duck];\
[vo][duck]amix=inputs=2:duration=first:normalize=0,apad,atrim=0:$D,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v libx264 -pix_fmt yuv420p -crf 19 -preset medium -r 30 -c:a aac -b:a 160k -movflags +faststart "out/$n.mp4"
echo "$n: $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.mp4)s"
